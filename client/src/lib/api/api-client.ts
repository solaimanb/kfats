import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, removeAccessToken, setAccessToken } from "../utils/token";
import { ApiResponse, ApiError } from "@/types";
import { RBAC_VERSION } from "@/config/rbac/types";

interface ApiResponseData<T> extends ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
  rbacVersion?: string;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private static instance: ApiClient;
  public axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });

    this.failedQueue = [];
  }

  private async refreshTokenAndRetry(error: AxiosError): Promise<AxiosResponse> {
    try {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        const response = await this.axiosInstance.post("/auth/refresh-token");
        const { accessToken } = response.data.data;
        setAccessToken(accessToken);
        this.isRefreshing = false;
        this.processQueue(null, accessToken);
        return this.axiosInstance(error.config as RetryableRequest);
      }

      // If refresh is already in progress, wait for it to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then((token) => {
        const config = error.config as RetryableRequest;
        config.headers.Authorization = `Bearer ${token}`;
        return this.axiosInstance(config);
      });
    } catch (err) {
      this.isRefreshing = false;
      this.processQueue(err instanceof Error ? err : new Error("Token refresh failed"), null);
      removeAccessToken();
      window.location.href = "/login";
      return Promise.reject(err);
    }
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Check RBAC version compatibility
        if (
          response.data?.rbacVersion &&
          response.data.rbacVersion !== RBAC_VERSION.toString()
        ) {
          console.warn(
            "RBAC version mismatch. Please refresh the application."
          );
          // Optionally force refresh: window.location.reload();
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          return this.refreshTokenAndRetry(error);
        }

        return Promise.reject(error);
      }
    );
  }

  // Base HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(
      url,
      config
    );
    return response.data;
  }

  public async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(
      url,
      data,
      config
    );
    return response.data;
  }

  public async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(
      url,
      data,
      config
    );
    return response.data;
  }

  public async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(
      url,
      config
    );
    return response.data;
  }
}

export const apiClient = ApiClient.getInstance();

// Response interceptor to transform all responses to ApiResponse format
apiClient.axiosInstance.interceptors.response.use(
  (
    response: AxiosResponse<ApiResponseData<unknown>>
  ): Promise<AxiosResponse> => {
    const transformedResponse: AxiosResponse = {
      ...response,
      data: {
        status: "success",
        data: response.data.data || response.data,
        message: response.data.message,
      },
    };
    return Promise.resolve(transformedResponse);
  },
  (error): Promise<never> => {
    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            status: "error",
            error: {
              message: "Network error - please check your connection",
              code: "NETWORK_ERROR",
              status: 0,
            },
          },
        },
      });
    }

    const transformedError: ApiError = {
      message: error.response?.data?.message || "An unexpected error occurred",
      code: error.response?.data?.code || error.response?.status?.toString(),
      status: error.response?.status,
    };

    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: {
          status: "error",
          error: transformedError,
        },
      },
    });
  }
);

// Type-safe API client
export const api = {
  async get<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponseData<T>>(url, config);
    return response;
  },

  async post<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponseData<T>>(
      url,
      data,
      config
    );
    return response;
  },

  async put<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponseData<T>>(url, data, config);
    return response;
  },

  async patch<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponseData<T>>(
      url,
      data,
      config
    );
    return response;
  },

  async delete<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponseData<T>>(url, config);
    return response;
  },
};
