import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Expense, ExpenseFormData } from '../../types/models';
import { expenseService } from '../../services/expenseService';

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

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expense/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const expenses = await expenseService.getExpenses();
      return expenses;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch expenses');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expense/createExpense',
  async (expenseData: ExpenseFormData, { rejectWithValue }) => {
    try {
      await expenseService.createExpense(expenseData);
      // Refetch expenses to get updated list with row numbers
      const expenses = await expenseService.getExpenses();
      return expenses;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expense/updateExpense',
  async (
    { row, expenseData }: { row: number; expenseData: ExpenseFormData },
    { rejectWithValue }
  ) => {
    try {
      await expenseService.updateExpense(row, expenseData);
      // Refetch expenses to get updated data
      const expenses = await expenseService.getExpenses();
      return expenses;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expense/deleteExpense',
  async (row: number, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(row);
      // Refetch expenses to get updated list
      const expenses = await expenseService.getExpenses();
      return expenses;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
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
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.lastUpdated = Date.now();
        state.selectedExpense = null; // Clear selection after create
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.lastUpdated = Date.now();
        state.selectedExpense = null; // Clear selection after update
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
        state.lastUpdated = Date.now();
        state.selectedExpense = null; // Clear selection after delete
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedExpense,
  clearSelectedExpense,
  clearError,
  clearExpenses,
} = expenseSlice.actions;

export default expenseSlice.reducer;

