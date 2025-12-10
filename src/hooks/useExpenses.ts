import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setExpenses, setSelectedExpense, setLoading, setError } from '../store/slices/expenseSlice';
import { expenseService } from '../services/expenseService';
import type { Expense, ExpenseFormData } from '../types/models';

export const useExpenses = () => {
  const dispatch = useAppDispatch();
  const { expenses, selectedExpense, loading, error, lastUpdated } = useAppSelector(
    (state) => state.expense
  );

  const fetchExpenses = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await expenseService.getExpenses();
      dispatch(setExpenses(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expenses';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createExpense = useCallback(async (expenseData: ExpenseFormData | Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await expenseService.createExpense(expenseData);
      // Refetch expenses to get updated list with row numbers
      const updatedExpenses = await expenseService.getExpenses();
      dispatch(setExpenses(updatedExpenses));
      dispatch(setSelectedExpense(null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateExpense = useCallback(async (row: number, expenseData: ExpenseFormData | Record<string, unknown>) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await expenseService.updateExpense(row, expenseData);
      // Refetch expenses to get updated data
      const updatedExpenses = await expenseService.getExpenses();
      dispatch(setExpenses(updatedExpenses));
      dispatch(setSelectedExpense(null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteExpense = useCallback(async (row: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await expenseService.deleteExpense(row);
      // Refetch expenses to get updated list
      const updatedExpenses = await expenseService.getExpenses();
      dispatch(setExpenses(updatedExpenses));
      dispatch(setSelectedExpense(null));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const setSelectedExpenseCallback = useCallback((expense: Expense | null) => {
    dispatch(setSelectedExpense(expense));
  }, [dispatch]);

  return {
    expenses,
    selectedExpense,
    loading,
    error,
    lastUpdated,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    setSelectedExpense: setSelectedExpenseCallback,
  };
};
