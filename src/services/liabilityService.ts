import { apiClient } from './api';
import { API_ENDPOINTS, API_BASE_URL } from '../config/constants';
import type { Liability, LiabilityFormData } from '../types/models';

export const liabilityService = {
  /**
   * Get all liabilities from Google Sheet
   * Backend handles spreadsheet ID from user's stored data
   * Backend returns array of liability objects (first row is headers, converted to object keys)
   */
  getLiabilities: async (): Promise<Liability[]> => {
    const liabilities = await apiClient.get<Liability[]>(API_ENDPOINTS.LIABILITIES);
    
    // Log for debugging
    console.log('Fetched liabilities:', liabilities);
    console.log('Number of liabilities:', liabilities?.length);
    
    // Ensure we return an array
    if (!Array.isArray(liabilities)) {
      console.warn('Liabilities is not an array:', liabilities);
      return [];
    }
    
    // Add row numbers to liabilities (for update/delete operations)
    // Row 1 is headers, so data starts at row 2
    return liabilities.map((liability, index) => ({
      ...liability,
      row: index + 2, // Row 1 is headers, so first liability is row 2
    }));
  },

  /**
   * Create a new liability
   * Backend expects object with column names as keys (will convert to array values)
   */
  createLiability: async (liabilityData: LiabilityFormData | Record<string, unknown>): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.LIABILITIES, liabilityData);
  },

  /**
   * Update an existing liability by row number
   * Backend expects object with column names as keys (will convert to array values)
   */
  updateLiability: async (row: number, liabilityData: LiabilityFormData | Record<string, unknown>): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`${API_ENDPOINTS.LIABILITIES}/${row}`, liabilityData);
  },

  /**
   * Delete a liability by row number
   */
  deleteLiability: async (row: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`${API_ENDPOINTS.LIABILITIES}/${row}`);
  },

  /**
   * Upload file attachment for a liability
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

    const projectId = localStorage.getItem('currentProjectId');
    if (!projectId) {
      throw new Error('No project selected. Please select a project first.');
    }

    console.log(`Uploading attachment for row ${row}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      projectId: projectId,
      url: `${API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS.UPLOAD(row)}`,
    });

    const headers: Record<string, string> = {
      'x-session-id': sessionId,
      'x-project-id': projectId,
    };

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS.UPLOAD(row)}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to upload file';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error('Upload failed:', { status: response.status, error: errorMessage });
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Get attachment info for a liability
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
   * Get attachment download URL with session ID and project ID
   */
  getAttachmentUrl: (fileId: string): string => {
    const sessionId = localStorage.getItem('auth_token');
    const projectId = localStorage.getItem('currentProjectId');
    const baseUrl = `${API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS.DOWNLOAD(fileId)}`;
    
    // Add both sessionId and projectId as query parameters
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (projectId) params.append('projectId', projectId);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },

  /**
   * Delete attachment
   */
  deleteAttachment: async (fileId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.ATTACHMENTS.DELETE(fileId));
  },
};
