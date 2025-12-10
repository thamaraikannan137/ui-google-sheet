import { apiClient } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants';
import type { AuthStatusResponse } from '../types/models';

export const authService = {
  /**
   * Initiate Google OAuth flow
   * Redirects user to Google OAuth consent screen
   */
  initiateGoogleAuth: (): void => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    window.location.href = `${apiBaseUrl}${API_ENDPOINTS.AUTH.GOOGLE}`;
  },

  /**
   * Handle OAuth callback success - backend already processed the code
   * Backend redirects with sessionId and email in query params
   */
  handleCallbackSuccess: (sessionId: string, email: string): void => {
    // Store sessionId for API calls (backend uses session-based auth)
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, sessionId);
    localStorage.setItem('user_email', email);
  },

  /**
   * Connect user's Google Spreadsheet
   */
  connectSpreadsheet: async (spreadsheetId: string): Promise<{ message: string; spreadsheetId: string; sessionId: string }> => {
    const sessionId = authService.getToken();
    if (!sessionId) {
      throw new Error('Not authenticated. Please login again.');
    }
    
    // Send sessionId both in header (via interceptor) and as query param (fallback)
    return apiClient.post<{ message: string; spreadsheetId: string; sessionId: string }>(
      `${API_ENDPOINTS.AUTH.CONNECT}?sessionId=${sessionId}`,
      { spreadsheetId }
    );
  },

  /**
   * Check authentication status
   */
  checkAuthStatus: async (): Promise<AuthStatusResponse> => {
    return apiClient.get<AuthStatusResponse>(API_ENDPOINTS.AUTH.STATUS);
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth-related data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem('user_email');
      localStorage.removeItem('projectId');
      // Redirect to login page
      window.location.href = '/login';
    }
  },

  /**
   * Get stored JWT token
   */
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Check if user is authenticated (local check)
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
