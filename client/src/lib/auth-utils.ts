// Simple auth utility for storing and retrieving JWT tokens
// In a real application, this would be integrated with your auth system

export const authUtils = {
    // Store token in localStorage
    setToken: (token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    },

    // Get token from localStorage
    getToken: (): string | null => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    },

    // Remove token
    removeToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!authUtils.getToken();
    }
};

// For testing purposes, you can manually set a token like this:
// authUtils.setToken('your-jwt-token-here');
