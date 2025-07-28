/**
 * Toast notification IDs for consistent management across the application
 */
export const TOAST_IDS = {
  AUTH: {
    LOGIN: 'auth-login',
    SIGNUP: 'auth-signup',
    LOGOUT: 'auth-logout',
    PASSWORD_RESET: 'auth-password-reset',
  },
  // Add more categories as needed
  API: {
    GENERIC: 'api-generic',
  },
} as const

/**
 * Common toast messages used across the application
 */
export const TOAST_MESSAGES = {
  AUTH: {
    LOGIN: {
      LOADING: 'Signing in...',
      SUCCESS: 'Welcome back!',
      ERROR: 'Login failed',
    },
    SIGNUP: {
      LOADING: 'Creating your account...',
      SUCCESS: 'Account created successfully!',
      ERROR: 'Registration failed',
    },
    LOGOUT: {
      LOADING: 'Signing out...',
      SUCCESS: 'Signed out successfully',
      ERROR: 'Sign out failed',
    },
  },
} as const
