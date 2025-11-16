import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';
import type { User } from '../types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>(API_ENDPOINTS.USERS);
  },

  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    return apiClient.post<User>(API_ENDPOINTS.USERS, userData);
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    return apiClient.put<User>(`${API_ENDPOINTS.USERS}/${id}`, userData);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/${id}`);
  },
};

