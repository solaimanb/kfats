import { RBAC_VERSION } from "@/config/rbac/types";
import { ApiResponse } from "@/types";
import type { ApiErrorResponse } from "@/types/api/common/types";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor";
import { NetworkError } from "@/lib/auth/utils";

interface ApiResponseData<T> {
  status: "success" | "error" | "fail";
  data?: T;
  message?: string;
  error?: ApiErrorResponse;
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
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }> = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL!,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(null);
      }
    });

    this.failedQueue = [];
  }

  private async refreshTokenAndRetry(error: AxiosError): Promise<AxiosResponse> {
    try {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        await this.axiosInstance.post("/auth/refresh-token");
        this.isRefreshing = false;
        this.processQueue(null);
        return this.axiosInstance(error.config as RetryableRequest);
      }

      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        return this.axiosInstance(error.config as RetryableRequest);
      });
    } catch (err) {
      this.isRefreshing = false;
      this.processQueue(err instanceof Error ? err : new Error("Token refresh failed"));
      window.location.href = "/login";
      return Promise.reject(err);
    }
  }

  private setupInterceptors(): void {
    setupAuthInterceptor(this.axiosInstance);

    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (
          response.data?.rbacVersion &&
          response.data.rbacVersion !== RBAC_VERSION.toString()
        ) {
          console.warn(
            "RBAC version mismatch. Please refresh the application."
          );
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest;

        if (error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          originalRequest.url !== "/auth/login") {
          originalRequest._retry = true;
          return this.refreshTokenAndRetry(error);
        }

        return Promise.reject(error);
      }
    );
  }

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

export const api = {
  async get<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponseData<T>>(url, config);
      if (!response.data) {
        throw new Error('No data received');
      }
      return {
        status: "success",
        data: response.data as T,
        message: response.message
      };
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      return {
        status: "error",
        message: apiError.response?.data?.message || "An error occurred",
      };
    }
  },

  async post<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponseData<T>>(url, data, config);
      console.log("[ApiClient] Raw response:", response);

      if (response && typeof response === 'object' && 'status' in response) {
        return response as unknown as ApiResponse<T>;
      }

      const responseData = response as unknown as ApiResponseData<T>;
      console.log("[ApiClient] Response data:", responseData);

      if (responseData.status === 'success' && responseData.data) {
        return {
          status: 'success',
          data: responseData.data,
          message: responseData.message
        };
      }

      if (responseData.status === 'fail') {
        return {
          status: 'fail',
          message: responseData.message || 'Operation failed'
        };
      }

      return {
        status: 'error',
        message: responseData.message || 'An error occurred',
        error: responseData.error
      };
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      console.log("[ApiClient] Error:", apiError);

      if (apiError.response?.data) {
        return {
          status: 'error',
          message: apiError.response.data.message || 'An error occurred',
          error: apiError.response.data.error
        };
      }

      if (!apiError.response) {
        throw new NetworkError('Network error. Please check your connection.');
      }

      return {
        status: 'error',
        message: apiError.message || 'An unexpected error occurred'
      };
    }
  },

  async put<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponseData<T>>(url, data, config);
      if (!response.data) {
        throw new Error('No data received');
      }
      return {
        status: "success",
        data: response.data as T,
        message: response.message
      };
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      return {
        status: "error",
        message: apiError.response?.data?.message || "An error occurred",
      };
    }
  },

  async patch<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch<ApiResponseData<T>>(url, data, config);
      if (!response.data) {
        throw new Error('No data received');
      }
      return {
        status: "success",
        data: response.data as T,
        message: response.message
      };
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      return {
        status: "error",
        message: apiError.response?.data?.message || "An error occurred",
      };
    }
  },

  async delete<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponseData<T>>(url, config);
      if (!response.data) {
        throw new Error('No data received');
      }
      return {
        status: "success",
        data: response.data as T,
        message: response.message
      };
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      return {
        status: "error",
        message: apiError.response?.data?.message || "An error occurred",
      };
    }
  }
};
