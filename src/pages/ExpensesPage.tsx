import { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Divider, Paper, IconButton, TextField } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSpreadsheetDialogOpen, setIsSpreadsheetDialogOpen] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [spreadsheetUrlError, setSpreadsheetUrlError] = useState('');
  const [selectedExpenseForView, setSelectedExpenseForView] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [spreadsheetConnected, setSpreadsheetConnected] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check auth and fetch expenses on mount
  useEffect(() => {
    checkAuthAndFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debug: Log expenses state
  useEffect(() => {
    console.log('ExpensesPage - expenses state:', expenses);
    console.log('ExpensesPage - expenses length:', expenses?.length);
    console.log('ExpensesPage - loading:', loading);
    console.log('ExpensesPage - error:', error);
  }, [expenses, loading, error]);

  const checkAuthAndFetch = async () => {
    try {
      const status = await authService.checkAuthStatus();
      setIsAuthenticated(status.authenticated || false);
      setSpreadsheetConnected(status.spreadsheetConnected || false);
      if (status.authenticated && status.spreadsheetConnected) {
        dispatch(fetchExpenses()).then((result) => {
          // Log for debugging
          if (fetchExpenses.fulfilled.match(result)) {
            console.log('Expenses fetched successfully:', result.payload);
          } else if (fetchExpenses.rejected.match(result)) {
            console.error('Failed to fetch expenses:', result.error);
          }
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setSpreadsheetConnected(false);
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

  // Get all unique column names from expenses
  const getColumns = (): string[] => {
    if (expenses.length === 0) {
      // Default columns if no expenses
      return ['date', 'description', 'amount', 'category', 'notes'];
    }
    const columnSet = new Set<string>();
    expenses.forEach((expense) => {
      Object.keys(expense).forEach((key) => {
        if (key !== 'row') {
          columnSet.add(key);
        }
      });
    });
    return Array.from(columnSet);
  };

  const handleEdit = (expense: Expense) => {
    dispatch(setSelectedExpense(expense));
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      // Backend expects object with column names as keys - convert to ExpenseFormData format
      const expenseData = data as unknown as ExpenseFormData;
      
      if (isEditMode && selectedExpense?.row) {
        await dispatch(updateExpense({ row: selectedExpense.row, expenseData })).unwrap();
        setSnackbar({ open: true, message: 'Expense updated successfully', severity: 'success' });
      } else {
        await dispatch(createExpense(expenseData)).unwrap();
        setSnackbar({ open: true, message: 'Expense added successfully', severity: 'success' });
      }
      handleCloseForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save expense';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleDeleteClick = (row: number) => {
    setExpenseToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      try {
        await dispatch(deleteExpense(expenseToDelete)).unwrap();
        setSnackbar({ open: true, message: 'Expense deleted successfully', severity: 'success' });
        setIsDeleteDialogOpen(false);
        setExpenseToDelete(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        setIsDeleteDialogOpen(false);
        setExpenseToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpenseForView(expense);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedExpenseForView(null);
  };

  const handleGoogleLogin = () => {
    authService.initiateGoogleAuth();
  };

  // Extract spreadsheet ID from Google Sheets URL
  const extractSpreadsheetId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    // Remove whitespace
    url = url.trim();
    
    // Pattern 1: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
    // Pattern 2: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=0
    // Pattern 3: Just the ID itself (if user pastes only the ID)
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const handleOpenSpreadsheetDialog = () => {
    setIsSpreadsheetDialogOpen(true);
    setSpreadsheetUrl('');
    setSpreadsheetUrlError('');
  };

  const handleCloseSpreadsheetDialog = () => {
    setIsSpreadsheetDialogOpen(false);
    setSpreadsheetUrl('');
    setSpreadsheetUrlError('');
  };

  const handleConnectSpreadsheet = async () => {
    if (!spreadsheetUrl.trim()) {
      setSpreadsheetUrlError('Please enter a Google Sheets URL');
      return;
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    
    if (!spreadsheetId) {
      setSpreadsheetUrlError('Invalid Google Sheets URL. Please paste the full URL from your browser.');
      return;
    }

    try {
      // Check if sessionId exists before making request
      const sessionId = authService.getToken();
      if (!sessionId) {
        setSnackbar({ open: true, message: 'Not authenticated. Please login again.', severity: 'error' });
        return;
      }
      
      await authService.connectSpreadsheet(spreadsheetId);
      setSnackbar({ open: true, message: 'Spreadsheet connected successfully', severity: 'success' });
      handleCloseSpreadsheetDialog();
      await checkAuthAndFetch();
    } catch (err) {
      console.error('Connect spreadsheet error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to connect spreadsheet';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Connect Your Google Account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please sign in with Google to access your expenses
        </Typography>
        <MuiButton onClick={handleGoogleLogin} variant="contained" size="large">
          Continue with Google
        </MuiButton>
      </Box>
    );
  }

  // Show spreadsheet connection prompt
  if (!spreadsheetConnected) {
    return (
      <>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Connect Your Spreadsheet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Paste your Google Sheets URL to connect
          </Typography>
          <MuiButton onClick={handleOpenSpreadsheetDialog} variant="contained" size="large">
            Connect Spreadsheet
          </MuiButton>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Example URL:
            <br />
            <code style={{ fontSize: '0.9em' }}>
              https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
            </code>
          </Typography>
        </Box>

        {/* Spreadsheet Connection Dialog */}
        <Dialog open={isSpreadsheetDialogOpen} onClose={handleCloseSpreadsheetDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Connect Google Spreadsheet</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Google Sheets URL"
                placeholder="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
                value={spreadsheetUrl}
                onChange={(e) => {
                  setSpreadsheetUrl(e.target.value);
                  setSpreadsheetUrlError('');
                }}
                error={!!spreadsheetUrlError}
                helperText={spreadsheetUrlError || 'Paste the full URL from your Google Sheets'}
                sx={{ mb: 2 }}
              />
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>How to find your URL:</strong>
                  <br />
                  1. Open your Google Sheet
                  <br />
                  2. Copy the URL from your browser's address bar
                  <br />
                  3. Paste it above
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseSpreadsheetDialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleConnectSpreadsheet} variant="contained" color="primary">
              Connect
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Expenses {expenses.length > 0 && `(${expenses.length})`}
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

      {/* Debug info - remove in production */}
      {import.meta.env.DEV && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Debug: Expenses count: {expenses.length} | Loading: {loading ? 'Yes' : 'No'} | 
            First expense: {expenses[0] ? JSON.stringify(expenses[0]) : 'None'}
          </Typography>
        </Alert>
      )}

      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleViewExpense}
      />

      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <ExpenseForm
            key={isEditMode && selectedExpense?.row ? `edit-${selectedExpense.row}` : 'add-new'}
            defaultValues={isEditMode && selectedExpense ? selectedExpense : undefined}
            columns={getColumns()}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Expense Detail Dialog */}
      <Dialog 
        open={isDetailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="span">
            Expense Details
          </Typography>
          <IconButton
            onClick={handleCloseDetailDialog}
            size="small"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          {selectedExpenseForView && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.keys(selectedExpenseForView)
                .filter(key => key !== 'row')
                .map((key) => {
                  const value = selectedExpenseForView[key];
                  const isDate = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
                  const isAmount = value !== '' && value !== null && value !== undefined && 
                    /^[\d,]+\.?\d*$/.test(String(value).replace(/[$,]/g, ''));
                  
                  let displayValue = '-';
                  if (value === '' || value === null || value === undefined) {
                    displayValue = '-';
                  } else if (isDate) {
                    try {
                      const date = new Date(String(value));
                      displayValue = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    } catch {
                      displayValue = String(value);
                    }
                  } else if (isAmount) {
                    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
                    displayValue = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(numValue);
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <Paper 
                      key={key}
                      sx={{ 
                        p: 2, 
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' },
                        minWidth: { xs: '100%', sm: '200px' }
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        {key}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mt: 1, 
                          fontWeight: isAmount ? 600 : 400,
                          color: isAmount ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {displayValue}
                      </Typography>
                    </Paper>
                  );
                })}
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetailDialog} variant="outlined">
            Close
          </Button>
          {selectedExpenseForView && (
            <Button 
              onClick={() => {
                handleCloseDetailDialog();
                handleEdit(selectedExpenseForView);
              }} 
              variant="contained"
              color="primary"
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this expense? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
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
