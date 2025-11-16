import { apiClient } from './api';
import { API_ENDPOINTS, API_BASE_URL } from '../config/constants';
import type { Expense, ExpenseFormData } from '../types/models';

export const expenseService = {
  /**
   * Get all expenses from Google Sheet
   * Backend handles spreadsheet ID from user's stored data
   * Backend returns array of expense objects (first row is headers, converted to object keys)
   */
  getExpenses: async (): Promise<Expense[]> => {
    const expenses = await apiClient.get<Expense[]>(API_ENDPOINTS.EXPENSES);
    
    // Log for debugging
    console.log('Fetched expenses:', expenses);
    console.log('Number of expenses:', expenses?.length);
    
    // Ensure we return an array
    if (!Array.isArray(expenses)) {
      console.warn('Expenses is not an array:', expenses);
      return [];
    }
    
    // Add row numbers to expenses (for update/delete operations)
    // Row 1 is headers, so data starts at row 2
    return expenses.map((expense, index) => ({
      ...expense,
      row: index + 2, // Row 1 is headers, so first expense is row 2
    }));
  },

  /**
   * Create a new expense
   * Backend expects object with column names as keys (will convert to array values)
   */
  createExpense: async (expenseData: ExpenseFormData | Record<string, unknown>): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.EXPENSES, expenseData);
  },

  /**
   * Update an existing expense by row number
   * Backend expects object with column names as keys (will convert to array values)
   */
  updateExpense: async (row: number, expenseData: ExpenseFormData | Record<string, unknown>): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`${API_ENDPOINTS.EXPENSES}/${row}`, expenseData);
  },

  /**
   * Delete an expense by row number
   */
  deleteExpense: async (row: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`${API_ENDPOINTS.EXPENSES}/${row}`);
  },

  /**
   * Upload file attachment for an expense
   */
  uploadAttachment: async (row: number, file: File): Promise<{ 
    message: string; 
    fileId: string; 
    webViewLink: string; 
    webContentLink: string; 
    fileName: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const sessionId = localStorage.getItem('auth_token');
    if (!sessionId) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS.UPLOAD(row)}`, {
      method: 'POST',
      headers: {
        'x-session-id': sessionId,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  },

  /**
   * Get attachment info for an expense
   */
  getAttachment: async (row: number): Promise<{ 
    hasAttachment: boolean; 
    fileId: string | null; 
    fileName?: string;
    mimeType?: string;
    isImage?: boolean;
    downloadUrl: string | null;
    webViewLink?: string;
  }> => {
    return apiClient.get<{ 
      hasAttachment: boolean; 
      fileId: string | null; 
      fileName?: string;
      mimeType?: string;
      isImage?: boolean;
      downloadUrl: string | null;
      webViewLink?: string;
    }>(API_ENDPOINTS.ATTACHMENTS.GET(row));
  },

  /**
   * Get attachment download URL with session ID
   */
  getAttachmentUrl: (fileId: string): string => {
    const sessionId = localStorage.getItem('auth_token');
    const baseUrl = `${API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS.DOWNLOAD(fileId)}`;
    return sessionId ? `${baseUrl}?sessionId=${sessionId}` : baseUrl;
  },

  /**
   * Delete attachment
   */
  deleteAttachment: async (fileId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.ATTACHMENTS.DELETE(fileId));
  },
};

