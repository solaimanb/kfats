// interface TokenPair {
//     accessToken: string;
//     refreshToken: string;
//     expiresIn: number;
// }

// interface StoredToken {
//     token: string;
//     expiresAt: number;
// }

class TokenService {
    private static readonly ACCESS_TOKEN_KEY = 'accessToken';
    private static readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
    private static readonly EXPIRY_BUFFER = 60;

    static setAccessToken(token: string, expiresIn: number): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
            localStorage.setItem(this.TOKEN_EXPIRY_KEY, (Date.now() + expiresIn * 1000).toString());
        }
    }

    static getAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
            if (!token || this.isTokenExpired()) {
                this.clearTokens();
                return null;
            }
            return token;
        }
        return null;
    }

    static clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
            localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        }
    }

    static isTokenExpired(): boolean {
        if (typeof window !== 'undefined') {
            const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
            if (!expiry) return true;

            // Consider token expired if within buffer period
            return Date.now() + (this.EXPIRY_BUFFER * 1000) >= parseInt(expiry);
        }
        return true;
    }

    static getTokenExpiryTime(): number | null {
        if (typeof window !== 'undefined') {
            const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
            return expiry ? parseInt(expiry) : null;
        }
        return null;
    }
}

export default TokenService; 