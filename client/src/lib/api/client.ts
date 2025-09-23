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
    // Only handle auth errors from specific endpoints, not general 401s
    if (error.response?.status === 401) {
      try {
        const url: string | undefined = error.config?.url
        // Only clear tokens for explicit auth verification endpoints
        // Avoid clearing on 404s or other route errors
        const isAuthVerification = url?.includes('/users/me') && error.response?.data?.detail?.includes('Unauthorized')
        const isFromBrowser = typeof window !== 'undefined'
        
        if (isAuthVerification && isFromBrowser) {
          console.log('Auth verification failed, clearing tokens')
          // Only clear tokens, don't force redirect here
          // Let the AuthProvider handle the logout flow
          Cookies.remove('kfats_token', { path: '/' })
          Cookies.remove('kfats_user', { path: '/' })
          Cookies.remove('kfats_role', { path: '/' })
        } else {
          console.warn('401 error but not clearing auth:', url, error.response?.data)
        }
      } catch (interceptorError) {
        console.error('Error in response interceptor:', interceptorError)
      }
    }

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
