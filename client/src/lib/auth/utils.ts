import { User } from '@/types/domain/user/types';

const USER_KEY = 'auth_user';

export class AuthStorage {
  static getUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static setUser(user: User): void {
    const safeUser = {
      _id: user._id,
      email: user.email,
      profile: user.profile ? {
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        avatar: user.profile.avatar
      } : null,
      roles: user.roles || ['user'],
      permissions: user.permissions || [],
      status: user.status,
      emailVerified: user.emailVerified
    };
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
  }

  static removeUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  static clearAuth(): void {
    this.removeUser();
  }
}

// Error types
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
} 