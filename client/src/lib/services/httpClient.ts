import TokenService from './tokenService';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
    skipRefresh?: boolean;
}

class HttpClient {
    private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    private static isRefreshing = false;
    private static refreshSubscribers: ((token: string) => void)[] = [];
    private static readonly AUTH_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/refresh-token'];

    private static getDefaultHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    private static async handleRefreshToken(): Promise<string> {
        try {
            const response = await fetch(`${this.API_URL}/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include',
                headers: this.getDefaultHeaders()
            });

            if (!response.ok) {
                throw new Error('Refresh failed');
            }

            const data = await response.json();
            const newToken = data.tokens.accessToken;

            if (!newToken) {
                throw new Error('No token received');
            }

            TokenService.setAccessToken(newToken, data.tokens.expiresIn);
            return newToken;
        } catch (error) {
            TokenService.clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw error;
        }
    }

    private static subscribeTokenRefresh(callback: (token: string) => void) {
        this.refreshSubscribers.push(callback);
    }

    private static onTokenRefreshed(token: string) {
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
    }

    static async fetch(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<Response> {
        const { skipAuth, skipRefresh, ...fetchOptions } = options;
        const url = endpoint.startsWith('http') ? endpoint : `${this.API_URL}${endpoint}`;
        const isAuthEndpoint = this.AUTH_ENDPOINTS.some(authPath => endpoint.includes(authPath));

        // Initialize headers with defaults
        fetchOptions.headers = {
            ...this.getDefaultHeaders(),
            ...fetchOptions.headers,
        };

        // Always include credentials for cookies
        fetchOptions.credentials = 'include';
        fetchOptions.mode = 'cors';

        // Add Authorization header if needed
        if (!skipAuth && !isAuthEndpoint) {
            let token = TokenService.getAccessToken();

            // Check if token is expired or missing
            if ((!token || TokenService.isTokenExpired()) && !skipRefresh) {
                // If we're already refreshing, wait for it to complete
                if (this.isRefreshing) {
                    try {
                        const newToken = await new Promise<string>(resolve => {
                            this.subscribeTokenRefresh(token => resolve(token));
                        });
                        fetchOptions.headers = {
                            ...fetchOptions.headers,
                            'Authorization': `Bearer ${newToken}`,
                        };
                        return this.fetch(endpoint, { ...options, skipRefresh: true });
                    } catch (error) {
                        console.error('Error waiting for token refresh:', error);
                        throw error;
                    }
                }

                // Start refresh process
                this.isRefreshing = true;
                try {
                    token = await this.handleRefreshToken();
                    this.onTokenRefreshed(token);
                } finally {
                    this.isRefreshing = false;
                }
            }

            if (token) {
                fetchOptions.headers = {
                    ...fetchOptions.headers,
                    'Authorization': `Bearer ${token}`,
                };
            }
        }

        // Handle JSON body
        if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
            if (typeof fetchOptions.body !== 'string') {
                fetchOptions.body = JSON.stringify(fetchOptions.body);
            }
        }

        try {
            const response = await fetch(url, fetchOptions);

            // Handle 401 errors
            if (response.status === 401 && !skipRefresh && !isAuthEndpoint && !this.isRefreshing) {
                // Token might have expired during request
                this.isRefreshing = true;
                try {
                    const newToken = await this.handleRefreshToken();
                    this.onTokenRefreshed(newToken);

                    // Retry the original request with new token
                    return this.fetch(endpoint, {
                        ...options,
                        headers: {
                            ...fetchOptions.headers,
                            'Authorization': `Bearer ${newToken}`,
                        },
                        skipRefresh: true,
                    });
                } finally {
                    this.isRefreshing = false;
                }
            }

            return response;
        } catch (error) {
            console.error('Network error:', error);
            throw error;
        }
    }

    // Convenience methods
    static async get(endpoint: string, options?: RequestOptions) {
        return this.fetch(endpoint, { ...options, method: 'GET' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async post(endpoint: string, data?: any, options?: RequestOptions) {
        return this.fetch(endpoint, {
            ...options,
            method: 'POST',
            body: data,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async put(endpoint: string, data?: any, options?: RequestOptions) {
        return this.fetch(endpoint, {
            ...options,
            method: 'PUT',
            body: data,
        });
    }

    static async delete(endpoint: string, options?: RequestOptions) {
        return this.fetch(endpoint, { ...options, method: 'DELETE' });
    }
}

export default HttpClient; 