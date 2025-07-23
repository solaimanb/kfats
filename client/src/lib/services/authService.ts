import TokenService from './tokenService';
import HttpClient from './httpClient';

interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupData {
    name: string;
    email: string;
    password: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

// interface AuthResponse {
//     tokens: {
//         accessToken: string;
//         expiresIn: number;
//     };
//     user: User;
// }

class AuthService {
    static async handleResponse(response: Response) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    static async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response = await HttpClient.post('/auth/login', credentials, {
                skipAuth: true,
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            TokenService.setAccessToken(data.tokens.accessToken, data.tokens.expiresIn);
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error instanceof Error ? error : new Error('Login failed');
        }
    }

    static async signup(data: SignupData): Promise<void> {
        try {
            const response = await HttpClient.post('/auth/signup', data);
            await this.handleResponse(response);
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    static async logout(): Promise<void> {
        try {
            const response = await HttpClient.post('/auth/logout', {}, {
                credentials: 'include'
            });
            await this.handleResponse(response);
            TokenService.clearTokens();
        } catch (error) {
            console.error('Logout error:', error);
            // Always clear tokens on logout attempt
            TokenService.clearTokens();
            throw error;
        }
    }

    static async refreshToken(): Promise<void> {
        try {
            const response = await HttpClient.post('/auth/refresh-token', {}, {
                skipAuth: true,
                credentials: 'include'
            });
            const data = await this.handleResponse(response);
            TokenService.setAccessToken(data.tokens.accessToken, data.tokens.expiresIn);
        } catch (error) {
            console.error('Token refresh error:', error);
            TokenService.clearTokens();
            throw error;
        }
    }

    static async getCurrentUser(): Promise<User | null> {
        try {
            if (!TokenService.getAccessToken()) {
                return null;
            }
            const response = await HttpClient.get('/auth/me', {
                credentials: 'include'
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }
}

export default AuthService;
export type { User, LoginCredentials, SignupData }; 