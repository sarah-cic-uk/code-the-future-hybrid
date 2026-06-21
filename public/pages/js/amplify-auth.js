import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resetPassword, confirmResetPassword, fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';

/**
 * Amplify Authentication Module
 * Replaces Firebase authentication with AWS Amplify Cognito
 */

const client = generateClient();

// Validate cohort code against DynamoDB
export async function validateCohortCode(cohortCode) {
  try {
    const { data: cohorts } = await client.models.Cohort.list({
      filter: {
        cohortCode: { eq: cohortCode }
      }
    });
    
    if (cohorts && cohorts.length > 0) {
      return { valid: true, cohort: cohorts[0] };
    }
    
    return { valid: false, error: 'Invalid cohort code' };
  } catch (error) {
    console.error('Cohort validation error:', error);
    return { valid: false, error: error.message };
  }
}

// Sign up a new user with cohort validation
export async function register(email, password, displayName, cohortCode) {
  try {
    // Validate cohort code first
    const cohortValidation = await validateCohortCode(cohortCode);
    if (!cohortValidation.valid) {
      return {
        success: false,
        error: 'Invalid cohort code. Please check with your coordinator.'
      };
    }
    
    // Register user in Cognito
    const { userId, isSignUpComplete, nextStep } = await signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email,
          name: displayName
        }
      }
    });
    
    console.log('User registered in Cognito:', userId);
    
    // Create user record in DynamoDB
    const isTutor = cohortCode === 'cTfTut0rCod3!1'; // Tutor code
    
    try {
      await client.models.User.create({
        email: email,
        displayName: displayName,
        cohortId: cohortCode,
        isTeacher: false,
        isTutor: isTutor,
        progress: {},
        profile: {}
      });
      
      console.log('User record created in DynamoDB');
    } catch (dbError) {
      console.error('Error creating user record:', dbError);
      // Continue anyway - user is registered in Cognito
    }
    
    // Check if email confirmation is needed
    if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      return {
        success: true,
        userId,
        needsConfirmation: true,
        message: 'Please check your email for confirmation code'
      };
    }
    
    // Auto-login after successful registration
    if (isSignUpComplete) {
      const loginResult = await login(email, password);
      if (loginResult.success) {
        localStorage.setItem('cohort', cohortCode);
        return {
          success: true,
          userId,
          needsConfirmation: false,
          autoLoggedIn: true
        };
      }
    }
    
    return { success: true, userId, needsConfirmation: false };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Confirm sign up with code
export async function confirmSignUpCode(email, code) {
  try {
    const { isSignUpComplete } = await confirmSignUp({
      username: email,
      confirmationCode: code
    });
    
    return { success: true, isSignUpComplete };
  } catch (error) {
    console.error('Confirmation error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in and fetch user data
export async function login(email, password) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password: password
    });
    
    if (isSignedIn) {
      const user = await getCurrentUser();
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      // Get user attributes from Cognito
      const attributes = await fetchUserAttributes();
      if (attributes.name) {
        localStorage.setItem('displayName', attributes.name);
      }
      
      // Fetch user data from DynamoDB
      try {
        const { data: users } = await client.models.User.list({
          filter: {
            email: { eq: email }
          }
        });
        
        if (users && users.length > 0) {
          const userData = users[0];
          if (userData.cohortId) {
            localStorage.setItem('cohort', userData.cohortId);
          }
          if (userData.displayName) {
            localStorage.setItem('displayName', userData.displayName);
          }
          
          console.log('User data loaded from DynamoDB');
        }
      } catch (dbError) {
        console.error('Error fetching user data:', dbError);
        // Continue anyway - user is authenticated
      }
      
      return { success: true, user, isSignedIn: true };
    }
    
    // Handle MFA or other next steps
    return { success: false, error: 'Additional authentication required', nextStep };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out
export async function logout() {
  try {
    await signOut();
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('displayName');
    window.location.href = '/pages/login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check if user is authenticated
export async function checkAuth() {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

// Get current user
export async function getUser() {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Get user attributes
export async function getUserAttributes() {
  try {
    const { fetchUserAttributes } = await import('aws-amplify/auth');
    const attributes = await fetchUserAttributes();
    return attributes;
  } catch (error) {
    console.error('Get attributes error:', error);
    return {};
  }
}

// Update user attributes
export async function updateUserAttributes(attributes) {
  try {
    const { updateUserAttributes } = await import('aws-amplify/auth');
    const result = await updateUserAttributes({
      userAttributes: attributes
    });
    return { success: true, result };
  } catch (error) {
    console.error('Update attributes error:', error);
    return { success: false, error: error.message };
  }
}

// Request password reset
export async function requestPasswordReset(email) {
  try {
    const output = await resetPassword({ username: email });
    const { nextStep } = output;
    
    return { 
      success: true, 
      message: 'Password reset code sent to your email',
      nextStep 
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: error.message };
  }
}

// Confirm password reset with code
export async function confirmPasswordReset(email, code, newPassword) {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: newPassword
    });
    
    return { success: true, message: 'Password reset successful' };
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return { success: false, error: error.message };
  }
}

// Initialize auth state on page load
export async function initAuthState() {
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    const user = await getUser();
    const attributes = await getUserAttributes();
    
    localStorage.setItem('loggedIn', 'true');
    if (attributes.email) {
      localStorage.setItem('userEmail', attributes.email);
    }
    if (attributes.name) {
      localStorage.setItem('displayName', attributes.name);
    }
    
    return { authenticated: true, user, attributes };
  }
  
  localStorage.setItem('loggedIn', 'false');
  return { authenticated: false };
}

// Export for global access (backward compatibility)
if (typeof window !== 'undefined') {
  window.amplifyAuth = {
    register,
    confirmSignUpCode,
    login,
    logout,
    checkAuth,
    getUser,
    getUserAttributes,
    updateUserAttributes,
    requestPasswordReset,
    confirmPasswordReset,
    initAuthState,
    validateCohortCode
  };
}

// Made with Bob


// Expose functions to window for use in HTML pages
if (typeof window !== 'undefined') {
  window.amplifyValidateCohort = validateCohortCode;
  window.amplifyRegister = register;
  window.amplifyLogin = login;
  window.amplifyLogout = logout;
  window.amplifyCheckAuth = checkAuth;
  window.amplifyGetUser = getUser;
  window.amplifyGetUserAttributes = getUserAttributes;
  window.amplifyUpdateUserAttributes = updateUserAttributes;
  window.amplifyResetPassword = requestPasswordReset;
  window.amplifyConfirmResetPassword = confirmPasswordReset;
  window.amplifyConfirmSignUp = confirmSignUp;
}
