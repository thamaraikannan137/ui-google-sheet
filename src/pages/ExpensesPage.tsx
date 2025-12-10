import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Divider, Paper, IconButton, TextField, CircularProgress } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, AttachFile as AttachFileIcon, Download as DownloadIcon, Image as ImageIcon } from '@mui/icons-material';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { ExpenseForm, ExpenseList } from '../components/features/expenses';
import { expenseService } from '../services/expenseService';
import type { Expense, ExpenseFormData } from '../types/models';
import { MuiButton } from '../components/common';

export const ExpensesPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { expenses, loading, error, selectedExpense, fetchExpenses, createExpense, updateExpense, deleteExpense, setSelectedExpense } = useExpenses();
  const { checkAuthStatus, isAuthenticated: authIsAuthenticated, initiateGoogleAuth } = useAuth();
  const { currentProject, projects, fetchProjects, selectProject } = useProjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [previewFileId, setPreviewFileId] = useState<string>('');
  const [selectedExpenseForView, setSelectedExpenseForView] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check auth and fetch projects on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAuthStatus();
        await fetchProjects();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Validate and set project from URL
  useEffect(() => {
    if (!authIsAuthenticated) {
      navigate('/login');
      return;
    }

    if (!projectId) {
      navigate('/projects');
      return;
    }

    // If projects are loaded, validate the projectId
    if (projects.length > 0) {
      const project = projects.find(p => p.id === parseInt(projectId));
      if (!project) {
        // Invalid project ID
        navigate('/projects');
        return;
      }
      
      // Set as current project if not already
      if (!currentProject || currentProject.id !== project.id) {
        selectProject(project);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, authIsAuthenticated, projects]);

  // Fetch expenses when project is set
  useEffect(() => {
    if (currentProject && projectId && currentProject.id === parseInt(projectId)) {
      fetchExpenses().catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, projectId]);

  // Debug: Log expenses state
  useEffect(() => {
    console.log('ExpensesPage - expenses state:', expenses);
    console.log('ExpensesPage - expenses length:', expenses?.length);
    console.log('ExpensesPage - loading:', loading);
    console.log('ExpensesPage - error:', error);
  }, [expenses, loading, error]);

  const handleGoogleLogin = () => {
    initiateGoogleAuth();
  };

  const handleOpenForm = () => {
    setIsEditMode(false);
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditMode(false);
    setSelectedExpense(null);
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
    setSelectedExpense(expense);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Record<string, unknown>, file?: File) => {
    try {
      // Backend expects object with column names as keys - convert to ExpenseFormData format
      const expenseData = data as unknown as ExpenseFormData;
      
      if (isEditMode && selectedExpense?.row) {
        // Update expense first
        await updateExpense(selectedExpense.row, expenseData);
        
        // Upload file if provided
        if (file) {
          try {
            await expenseService.uploadAttachment(selectedExpense.row, file);
            setSnackbar({ open: true, message: 'Expense and file updated successfully', severity: 'success' });
          } catch (fileError) {
            console.error('File upload error:', fileError);
            setSnackbar({ open: true, message: 'Expense updated but file upload failed', severity: 'error' });
          }
        } else {
          setSnackbar({ open: true, message: 'Expense updated successfully', severity: 'success' });
        }
      } else {
        // Create expense first
        await createExpense(expenseData);
        
        // Refresh expenses to get updated list with row numbers
        await fetchExpenses();
        const updatedExpenses = expenses;
        
        // Get the new row number (last expense row)
        const newRow = updatedExpenses.length > 0 && updatedExpenses[updatedExpenses.length - 1].row 
          ? updatedExpenses[updatedExpenses.length - 1].row! 
          : updatedExpenses.length + 1; // Fallback: row = array length + 1 (since row 1 is header)
        
        // Upload file if provided
        if (file && newRow) {
          try {
            await expenseService.uploadAttachment(newRow, file);
            setSnackbar({ open: true, message: 'Expense and file added successfully', severity: 'success' });
            // Refresh again to get file ID in expense data
            await fetchExpenses();
          } catch (fileError) {
            console.error('File upload error:', fileError);
            setSnackbar({ open: true, message: 'Expense added but file upload failed', severity: 'error' });
          }
        } else {
          setSnackbar({ open: true, message: 'Expense added successfully', severity: 'success' });
        }
      }
      
      // Refresh expenses list
      await fetchExpenses();
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
        await deleteExpense(expenseToDelete);
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

  const handleOpenImagePreview = async (fileId: string, fileName: string) => {
    try {
      const imageUrl = expenseService.getAttachmentUrl(fileId);
      setPreviewImageUrl(imageUrl);
      setPreviewFileName(fileName);
      setPreviewFileId(fileId);
      setIsImagePreviewOpen(true);
    } catch (error) {
      console.error('Error opening image preview:', error);
      setSnackbar({ open: true, message: 'Failed to load image', severity: 'error' });
    }
  };

  const handleCloseImagePreview = () => {
    setIsImagePreviewOpen(false);
    setPreviewImageUrl(null);
    setPreviewFileName('');
    setPreviewFileId('');
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const downloadUrl = expenseService.getAttachmentUrl(fileId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setSnackbar({ open: true, message: 'Failed to download file', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show login prompt if not authenticated
  if (!authIsAuthenticated) {
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

  // Show project selection prompt
  if (!currentProject) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          No Project Selected
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please select or create a project to view expenses
        </Typography>
        <MuiButton onClick={() => navigate('/projects')} variant="contained" size="large">
          Go to Projects
        </MuiButton>
      </Box>
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
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
            expenseRow={isEditMode && selectedExpense?.row ? selectedExpense.row : undefined}
            existingFileId={isEditMode && selectedExpense ? 
              (selectedExpense['Attachment Path'] as string) || 
              (selectedExpense['attachment'] as string) || 
              null : null}
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
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.keys(selectedExpenseForView)
                  .filter(key => key !== 'row' && 
                    !key.toLowerCase().includes('attachment') && 
                    !key.toLowerCase().includes('file'))
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
              
              {/* Attachment Section */}
              {(() => {
                const attachmentKey = Object.keys(selectedExpenseForView).find(key => 
                  key.toLowerCase().includes('attachment') || key.toLowerCase().includes('file')
                );
                const fileId = attachmentKey ? (selectedExpenseForView[attachmentKey] as string) : null;
                
                if (fileId && fileId.trim() !== '') {
                  const fileName = 'Attachment';
                  
                  return (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Attachment
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <AttachFileIcon />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          File attached
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ImageIcon />}
                            onClick={() => handleOpenImagePreview(fileId, fileName)}
                          >
                            Preview
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadFile(fileId, fileName)}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  );
                }
                return null;
              })()}
            </>
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

      {/* Image Preview Dialog */}
      <Dialog 
        open={isImagePreviewOpen} 
        onClose={handleCloseImagePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {previewFileName || 'Image Preview'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {previewFileId && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadFile(previewFileId, previewFileName || 'image')}
              >
                Download
              </Button>
            )}
            <IconButton onClick={handleCloseImagePreview} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          {previewImageUrl ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <img
                src={previewImageUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // Open in new tab for full size
                  window.open(previewImageUrl, '_blank');
                }}
                onError={(e) => {
                  // If image fails to load, show error message
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const errorBox = document.createElement('div');
                  errorBox.textContent = 'Failed to load image. Click Download to view.';
                  errorBox.style.padding = '20px';
                  errorBox.style.textAlign = 'center';
                  target.parentElement?.appendChild(errorBox);
                }}
              />
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Loading image...</Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseImagePreview} variant="outlined">
            Close
          </Button>
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
