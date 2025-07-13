import { getCookie } from "@/lib/utils/cookie";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import { authService } from "@/lib/api/services/auth.service";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function setupAuthInterceptor(axiosInstance: AxiosInstance) {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getCookie("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as ExtendedInternalAxiosRequestConfig;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // If the error is 401 and we haven't retried yet
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== "/auth/refresh-token" &&
        originalRequest.url !== "/auth/login"
      ) {
        if (isRefreshing) {
          try {
            // Wait for the other refresh request
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await authService.refreshToken();

          if (response.status === "success" && response.data?.accessToken) {
            const { accessToken } = response.data;
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            return axiosInstance(originalRequest);
          } else {
            processQueue(new Error("Failed to refresh token"));
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError as Error);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
