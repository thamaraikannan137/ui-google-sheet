import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Generic API client using Axios
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable cookie-based sessions
    });

    // Request interceptor (add auth tokens, session IDs, etc.)
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authentication token if available (for traditional auth)
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add session ID header for Google Sheets OAuth (backend supports X-Session-Id header)
        const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
        if (sessionId) {
          config.headers['X-Session-Id'] = sessionId;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor (handle errors globally)
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle common errors
        if (error.response) {
          // Server responded with error status
          console.error('API Error:', error.response.status, error.response.data);
          
          // Handle specific status codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - check if it's a Google Sheets auth issue
              const errorData = error.response.data as any;
              if (errorData?.authUrl?.includes('/auth/google')) {
                // Google Sheets authentication required
                localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
                localStorage.removeItem(STORAGE_KEYS.SPREADSHEET_ID);
                // Don't redirect automatically, let components handle it
              } else {
                // Traditional auth - clear token and redirect to login
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                window.location.href = '/login';
              }
              break;
            case 403:
              console.error('Forbidden access');
              break;
            case 404:
              console.error('Resource not found');
              break;
            case 500:
              console.error('Internal server error');
              break;
          }
        } else if (error.request) {
          // Request made but no response
          console.error('No response from server');
        } else {
          // Error setting up request
          console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint, config);
    return response.data;
  }

  // Get the axios instance if you need direct access
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Initialize with API_BASE_URL from constants (which handles env variable)
export const apiClient = new ApiClient(API_BASE_URL);

