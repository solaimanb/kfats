import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// Types
interface ErrorResponse {
  status: "error" | "fail";
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<ErrorResponse>) => {
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(new Error("Network error"));
    }

    const { status, data } = error.response;

    // Handle token expiration
    if (status === 401 && data?.code === "TOKEN_EXPIRED") {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    }

    // Handle validation errors
    if (status === 400 && data?.errors) {
      const validationErrors = Object.values(data.errors).flat();
      validationErrors.forEach((error) => toast.error(error));
      return Promise.reject(new Error("Validation failed"));
    }

    // Handle other errors
    const errorMessage = data?.message || "Something went wrong";
    toast.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
