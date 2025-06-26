import { getCookie } from "@/lib/utils/cookie";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

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
}
