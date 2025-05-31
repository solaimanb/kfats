import { ApiResponse } from "@/types/api/common";
import { RegisterRequest } from "@/types/api/requests";
import { IUser } from "@/types/auth/roles";

interface AuthResponse {
  user: IUser;
  token: string;
}

class AuthService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  async validateToken(token: string): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${this.API_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }
}

export const authService = new AuthService(); 