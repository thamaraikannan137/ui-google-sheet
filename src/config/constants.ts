// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

// App Configuration
export const APP_NAME = 'Your App Name';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  SESSION_ID: 'session_id',
  SPREADSHEET_ID: 'spreadsheet_id',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  USERS: '/users',
  EXPENSES: '/expenses',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    CONNECT: '/auth/connect',
    STATUS: '/auth/status',
  },
} as const;

