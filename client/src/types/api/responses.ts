// Auth Responses
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
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
