/**
 * Amplify Authentication Module (UMD Version)
 * Replaces Firebase authentication with AWS Amplify Cognito
 * Uses global window.AmplifyAuth and window.AmplifyData objects
 */

// Wait for Amplify to be initialized
function waitForAmplify() {
  return new Promise((resolve) => {
    if (window.AmplifyAuth && window.AmplifyData) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.AmplifyAuth && window.AmplifyData) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
}

// Validate cohort code against DynamoDB
async function validateCohortCode(cohortCode) {
  await waitForAmplify();
  
  try {
    const client = window.AmplifyData.generateClient();
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

// Sign up new user
async function amplifySignUp(email, password, displayName, cohortCode = null) {
  await waitForAmplify();
  
  try {
    // Validate cohort code if provided
    if (cohortCode) {
      const validation = await validateCohortCode(cohortCode);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }
    
    const { userId } = await window.AmplifyAuth.signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email,
          name: displayName
        }
      }
    });
    
    console.log('User registered:', userId);
    return { success: true, userId, requiresConfirmation: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Confirm sign up with code
async function amplifyConfirmSignUp(email, code) {
  await waitForAmplify();
  
  try {
    await window.AmplifyAuth.confirmSignUp({
      username: email,
      confirmationCode: code
    });
    return { success: true };
  } catch (error) {
    console.error('Confirmation error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in user
async function amplifySignIn(email, password) {
  await waitForAmplify();
  
  try {
    const { isSignedIn } = await window.AmplifyAuth.signIn({
      username: email,
      password: password
    });
    
    if (isSignedIn) {
      const user = await window.AmplifyAuth.getCurrentUser();
      const attributes = await window.AmplifyAuth.fetchUserAttributes();
      
      const displayName = attributes.name || attributes.email || email;
      
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('displayName', displayName);
      
      return { success: true, user, displayName };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out user
async function amplifySignOut() {
  await waitForAmplify();
  
  try {
    await window.AmplifyAuth.signOut();
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('displayName');
    localStorage.removeItem('userId');
    localStorage.removeItem('profilePicUrl');
    localStorage.removeItem('profilePicUrlExpiry');
    localStorage.removeItem('isTeacher');
    localStorage.removeItem('isTutor');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('schoolPrefix');
    window.location.href = '/pages/login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check if user is authenticated
async function checkAuth() {
  await waitForAmplify();
  
  try {
    const user = await window.AmplifyAuth.getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

// Get current user
async function getCurrentAuthUser() {
  await waitForAmplify();
  
  try {
    const user = await window.AmplifyAuth.getCurrentUser();
    const attributes = await window.AmplifyAuth.fetchUserAttributes();
    return { user, attributes };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Reset password
async function amplifyResetPassword(email) {
  await waitForAmplify();
  
  try {
    await window.AmplifyAuth.resetPassword({ username: email });
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message };
  }
}

// Confirm reset password
async function amplifyConfirmResetPassword(email, code, newPassword) {
  await waitForAmplify();
  
  try {
    await window.AmplifyAuth.confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: newPassword
    });
    return { success: true };
  } catch (error) {
    console.error('Confirm reset password error:', error);
    return { success: false, error: error.message };
  }
}

// Make functions available globally
window.amplifyAuth = {
  validateCohortCode,
  signUp: amplifySignUp,
  confirmSignUp: amplifyConfirmSignUp,
  signIn: amplifySignIn,
  signOut: amplifySignOut,
  checkAuth,
  getCurrentUser: getCurrentAuthUser,
  resetPassword: amplifyResetPassword,
  confirmResetPassword: amplifyConfirmResetPassword
};

console.log('✅ Amplify Auth helpers loaded (UMD)');

// Made with Bob
