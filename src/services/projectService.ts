import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

export interface Project {
  id: number;
  userId: number;
  name: string;
  spreadsheetId: string;
  templateId?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  headers: string[];
  sampleRows?: any[][];
}

export interface CreateProjectData {
  name: string;
  mode: 'template' | 'scratch' | 'existing';
  templateId?: number;
  spreadsheetUrl?: string;
}

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>(API_ENDPOINTS.PROJECTS.BASE);
  },

  getTemplates: async (): Promise<Template[]> => {
    return apiClient.get<Template[]>(API_ENDPOINTS.PROJECTS.TEMPLATES);
  },

  createProject: async (data: CreateProjectData): Promise<{ message: string; project: Project }> => {
    return apiClient.post<{ message: string; project: Project }>(API_ENDPOINTS.PROJECTS.BASE, data);
  },

  setDefaultProject: async (id: number): Promise<{ message: string; project: Project }> => {
    return apiClient.put<{ message: string; project: Project }>(`${API_ENDPOINTS.PROJECTS.BASE}/${id}/default`);
  },

  deleteProject: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`);
  },
};
