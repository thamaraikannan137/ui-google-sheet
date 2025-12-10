import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Expense } from '../../types/models';

interface ExpenseState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: ExpenseState = {
  expenses: [],
  selectedExpense: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
      state.lastUpdated = Date.now();
    },
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.selectedExpense = null;
      state.error = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setExpenses,
  setSelectedExpense,
  clearSelectedExpense,
  setLoading,
  setError,
  clearError,
  clearExpenses,
} = expenseSlice.actions;

export default expenseSlice.reducer;

