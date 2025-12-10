// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// App Configuration
export const APP_NAME = 'Your App Name';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  EXPENSES: '/expenses',
  AUTH: {
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    CONNECT: '/auth/connect',
    STATUS: '/auth/status',
    LOGOUT: '/auth/logout',
  },
  ATTACHMENTS: {
    UPLOAD: (row: number) => `/expenses/${row}/attachments`,
    GET: (row: number) => `/expenses/${row}/attachments`,
    DOWNLOAD: (fileId: string) => `/attachments/${fileId}`,
    DELETE: (fileId: string) => `/attachments/${fileId}`,
  },
  PROJECTS: {
    BASE: '/projects',
    TEMPLATES: '/projects/templates',
  },
} as const;

