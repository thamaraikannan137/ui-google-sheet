import { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, Alert, Snackbar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  setSelectedExpense,
  clearSelectedExpense,
  clearError,
} from '../store/slices/expenseSlice';
import { ExpenseForm, ExpenseList } from '../components/features/expenses';
import { authService } from '../services/authService';
import type { Expense, ExpenseFormData } from '../types/models';
import { MuiButton } from '../components/common';

export const ExpensesPage = () => {
  const dispatch = useAppDispatch();
  const { expenses, loading, error, selectedExpense } = useAppSelector((state) => state.expense);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [authStatus, setAuthStatus] = useState<{ authenticated: boolean; spreadsheetConnected: boolean }>({
    authenticated: false,
    spreadsheetConnected: false,
  });

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch expenses when authenticated and spreadsheet is connected
  useEffect(() => {
    if (authStatus.authenticated && authStatus.spreadsheetConnected) {
      dispatch(fetchExpenses());
    }
  }, [authStatus, dispatch]);

  const checkAuthStatus = async () => {
    try {
      const status = await authService.checkAuthStatus();
      setAuthStatus({
        authenticated: status.authenticated,
        spreadsheetConnected: status.spreadsheetConnected || false,
      });
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthStatus({ authenticated: false, spreadsheetConnected: false });
    }
  };

  const handleOpenForm = () => {
    setIsEditMode(false);
    dispatch(clearSelectedExpense());
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditMode(false);
    dispatch(clearSelectedExpense());
  };

  const handleEdit = (expense: Expense) => {
    dispatch(setSelectedExpense(expense));
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      if (isEditMode && selectedExpense?.row) {
        await dispatch(updateExpense({ row: selectedExpense.row, expenseData: data })).unwrap();
        setSnackbar({ open: true, message: 'Expense updated successfully', severity: 'success' });
      } else {
        await dispatch(createExpense(data)).unwrap();
        setSnackbar({ open: true, message: 'Expense added successfully', severity: 'success' });
      }
      handleCloseForm();
    } catch (error: any) {
      setSnackbar({ open: true, message: error || 'Failed to save expense', severity: 'error' });
    }
  };

  const handleDelete = async (row: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await dispatch(deleteExpense(row)).unwrap();
        setSnackbar({ open: true, message: 'Expense deleted successfully', severity: 'success' });
      } catch (error: any) {
        setSnackbar({ open: true, message: error || 'Failed to delete expense', severity: 'error' });
      }
    }
  };

  const handleConnectGoogle = () => {
    authService.initiateGoogleAuth();
  };

  const handleConnectSpreadsheet = async () => {
    const spreadsheetId = prompt('Enter your Google Spreadsheet ID:');
    if (spreadsheetId) {
      try {
        await authService.connectSpreadsheet(spreadsheetId);
        setSnackbar({ open: true, message: 'Spreadsheet connected successfully', severity: 'success' });
        await checkAuthStatus();
      } catch (error: any) {
        setSnackbar({ open: true, message: error.message || 'Failed to connect spreadsheet', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show auth prompt if not authenticated
  if (!authStatus.authenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Connect Your Google Account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please authenticate with Google to access your expense sheets
        </Typography>
        <MuiButton onClick={handleConnectGoogle} variant="contained" size="large">
          Connect Google Account
        </MuiButton>
      </Box>
    );
  }

  // Show spreadsheet connection prompt
  if (!authStatus.spreadsheetConnected) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Connect Your Spreadsheet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your Google Spreadsheet ID to continue
        </Typography>
        <MuiButton onClick={handleConnectSpreadsheet} variant="contained" size="large">
          Connect Spreadsheet
        </MuiButton>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          You can find the Spreadsheet ID in your Google Sheets URL:
          <br />
          <code style={{ fontSize: '0.9em' }}>
            https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
          </code>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          disabled={loading}
        >
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <ExpenseForm
            defaultValues={isEditMode && selectedExpense ? {
              date: selectedExpense.date || '',
              description: selectedExpense.description || '',
              amount: typeof selectedExpense.amount === 'string' 
                ? parseFloat(selectedExpense.amount) || 0 
                : selectedExpense.amount || 0,
              category: selectedExpense.category || '',
              notes: selectedExpense.notes || '',
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

