import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';

/**
 * Amplify Authentication Module
 * Replaces Firebase authentication with AWS Amplify
 */

// Sign up a new user
export async function register(email, password, displayName) {
  try {
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
    
    console.log('User registered:', userId);
    
    // Check if confirmation is needed
    if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      return { 
        success: true, 
        userId, 
        needsConfirmation: true,
        message: 'Please check your email for confirmation code'
      };
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

// Sign in
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
      
      // Get user attributes
      const attributes = await getUserAttributes();
      if (attributes.name) {
        localStorage.setItem('displayName', attributes.name);
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
    initAuthState
  };
}

// Made with Bob
