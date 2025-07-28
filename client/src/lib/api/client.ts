import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
const API_VERSION = '/api/v1'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('kfats_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      Cookies.remove('kfats_token')
      Cookies.remove('kfats_user')
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    
    // Handle other errors
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error_code?: string
  details?: unknown
}

// Generic API request function
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.request<T>(config)
    return response.data
  } catch (error) {
    throw error
  }
}
