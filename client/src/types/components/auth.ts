import { LoginRequest, RegisterRequest } from "../api/requests";

export interface LoginFormProps {
  onSubmit: (data: LoginRequest) => Promise<void>;
  isLoading?: boolean;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterRequest) => Promise<void>;
  isLoading?: boolean;
}

export interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}
