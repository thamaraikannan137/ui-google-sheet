import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';
import type { Expense, ExpenseFormData } from '../types/models';

export const expenseService = {
  /**
   * Get all expenses from Google Sheet
   */
  getExpenses: async (): Promise<Expense[]> => {
    const expenses = await apiClient.get<Expense[]>(API_ENDPOINTS.EXPENSES);
    
    // Add row numbers to expenses (row 1 is headers, so data starts at row 2)
    return expenses.map((expense, index) => ({
      ...expense,
      row: index + 2, // Row 1 is headers, so first expense is row 2
    }));
  },

  /**
   * Create a new expense
   */
  createExpense: async (expenseData: ExpenseFormData): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(API_ENDPOINTS.EXPENSES, expenseData);
  },

  /**
   * Update an existing expense by row number
   */
  updateExpense: async (row: number, expenseData: ExpenseFormData): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>(`${API_ENDPOINTS.EXPENSES}/${row}`, expenseData);
  },

  /**
   * Delete an expense by row number
   * Note: Backend doesn't have DELETE endpoint yet, but we'll prepare for it
   */
  deleteExpense: async (row: number): Promise<{ message: string }> => {
    // For now, we'll need to add this endpoint to backend
    // Using a workaround: update row with empty values or mark as deleted
    // TODO: Add DELETE /expenses/:row endpoint to backend
    throw new Error('Delete endpoint not implemented in backend yet');
  },
};

