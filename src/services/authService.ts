import { apiClient } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants';
import type { GoogleAuthResponse, AuthStatusResponse } from '../types/models';

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
   * Handle OAuth callback - exchange code for tokens
   * This is typically called from the callback page
   */
  handleGoogleCallback: async (code: string): Promise<GoogleAuthResponse> => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${apiBaseUrl}${API_ENDPOINTS.AUTH.GOOGLE_CALLBACK}?code=${code}`,
      {
        method: 'GET',
        credentials: 'include', // Include cookies for session
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Authentication failed');
    }
    
    const data: GoogleAuthResponse = await response.json();
    
    // Store session ID in localStorage
    if (data.sessionId) {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, data.sessionId);
    }
    
    return data;
  },

  /**
   * Connect user's Google Spreadsheet
   */
  connectSpreadsheet: async (spreadsheetId: string): Promise<{ message: string; spreadsheetId: string; sessionId: string }> => {
    const response = await apiClient.post<{ message: string; spreadsheetId: string; sessionId: string }>(
      API_ENDPOINTS.AUTH.CONNECT,
      { spreadsheetId }
    );
    
    // Store spreadsheet ID
    if (response.spreadsheetId) {
      localStorage.setItem(STORAGE_KEYS.SPREADSHEET_ID, response.spreadsheetId);
    }
    
    return response;
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
      // Clear local storage regardless of API call success
      localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      localStorage.removeItem(STORAGE_KEYS.SPREADSHEET_ID);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  /**
   * Get stored session ID
   */
  getSessionId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  },

  /**
   * Get stored spreadsheet ID
   */
  getSpreadsheetId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SPREADSHEET_ID);
  },

  /**
   * Check if user is authenticated (local check)
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  },
};

