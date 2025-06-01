// Auth Responses
export interface LoginResponse {
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
    roles: string[];
    status: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Role Application Responses
export interface RoleApplicationResponse {
  applicationId: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  submittedAt: string;
}
