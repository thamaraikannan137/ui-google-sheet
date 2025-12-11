import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Divider, Paper, IconButton, TextField, CircularProgress } from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, AttachFile as AttachFileIcon, Download as DownloadIcon, Image as ImageIcon } from '@mui/icons-material';
import { useLiabilities } from '../hooks/useLiabilities';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useToast } from '../contexts/ToastContext';
import { LiabilityForm, LiabilityList } from '../components/features/liabilities';
import { liabilityService } from '../services/liabilityService';
import type { Liability, LiabilityFormData } from '../types/models';
import { MuiButton } from '../components/common';

export const LiabilitiesPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { liabilities, loading, error, selectedLiability, fetchLiabilities, createLiability, updateLiability, deleteLiability, setSelectedLiability } = useLiabilities();
  const { checkAuthStatus, isAuthenticated: authIsAuthenticated, initiateGoogleAuth } = useAuth();
  const { currentProject, projects, fetchProjects, selectProject } = useProjects();
  const { showSuccess, showError } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');
  const [previewFileId, setPreviewFileId] = useState<string>('');
  const [selectedLiabilityForView, setSelectedLiabilityForView] = useState<Liability | null>(null);
  const [liabilityToDelete, setLiabilityToDelete] = useState<number | null>(null);

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

  // Fetch liabilities when project is set
  useEffect(() => {
    if (currentProject && projectId && currentProject.id === parseInt(projectId)) {
      fetchLiabilities().catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, projectId]);


  const handleGoogleLogin = () => {
    initiateGoogleAuth();
  };

  const handleOpenForm = () => {
    setIsEditMode(false);
    setSelectedLiability(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditMode(false);
    setSelectedLiability(null);
  };

  // Get all unique column names from liabilities
  const getColumns = (): string[] => {
    if (liabilities.length === 0) {
      // Default columns if no liabilities
      return ['date', 'description', 'amount', 'category', 'notes'];
    }
    const columnSet = new Set<string>();
    liabilities.forEach((liability) => {
      Object.keys(liability).forEach((key) => {
        if (key !== 'row') {
          columnSet.add(key);
        }
      });
    });
    return Array.from(columnSet);
  };

  const handleEdit = (liability: Liability) => {
    setSelectedLiability(liability);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: Record<string, unknown>, file?: File) => {
    try {
      // Backend expects object with column names as keys - convert to LiabilityFormData format
      const liabilityData = data as unknown as LiabilityFormData;
      
      if (isEditMode && selectedLiability?.row) {
        // Update liability first
        await updateLiability(selectedLiability.row, liabilityData);
        
        // Upload file if provided
        if (file) {
          try {
            await liabilityService.uploadAttachment(selectedLiability.row, file);
            showSuccess('Liability and file updated successfully');
          } catch (fileError) {
            console.error('File upload error:', fileError);
            showError('Liability updated but file upload failed');
          }
        } else {
          showSuccess('Liability updated successfully');
        }
      } else {
        // Create liability first
        await createLiability(liabilityData);
        
        // Upload file if provided
        if (file) {
          try {
            // Refresh liabilities to get updated list with row numbers
            await fetchLiabilities();
            
            // Get the newly created liability from the API directly
            const updatedLiabilities = await liabilityService.getLiabilities();
            
            // Get the new row number (last liability row)
            const newRow = updatedLiabilities.length > 0 && updatedLiabilities[updatedLiabilities.length - 1].row 
              ? updatedLiabilities[updatedLiabilities.length - 1].row! 
              : updatedLiabilities.length + 1; // Fallback: row = array length + 1 (since row 1 is header)
            
            // Upload the file
            await liabilityService.uploadAttachment(newRow, file);
            showSuccess('Liability and file added successfully');
            // Refresh again to get file ID in liability data
            await fetchLiabilities();
          } catch (fileError) {
            console.error('File upload error:', fileError);
            showError('Liability added but file upload failed');
          }
        } else {
          showSuccess('Liability added successfully');
        }
      }
      
      // Refresh liabilities list
      await fetchLiabilities();
      handleCloseForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save liability';
      showError(errorMessage);
    }
  };

  const handleDeleteClick = (row: number) => {
    setLiabilityToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (liabilityToDelete) {
      try {
        await deleteLiability(liabilityToDelete);
        showSuccess('Liability deleted successfully');
        setIsDeleteDialogOpen(false);
        setLiabilityToDelete(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete liability';
        showError(errorMessage);
        setIsDeleteDialogOpen(false);
        setLiabilityToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setLiabilityToDelete(null);
  };

  const handleViewLiability = (liability: Liability) => {
    setSelectedLiabilityForView(liability);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedLiabilityForView(null);
  };

  const handleOpenImagePreview = async (fileId: string, fileName: string) => {
    try {
      const imageUrl = liabilityService.getAttachmentUrl(fileId);
      console.log('Opening image preview:', {
        fileId,
        fileName,
        imageUrl,
        projectId: localStorage.getItem('currentProjectId'),
        sessionId: localStorage.getItem('auth_token')?.substring(0, 10) + '...'
      });
      setPreviewImageUrl(imageUrl);
      setPreviewFileName(fileName);
      setPreviewFileId(fileId);
      setIsImagePreviewOpen(true);
    } catch (error) {
      console.error('Error opening image preview:', error);
      showError('Failed to load image');
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
      const downloadUrl = liabilityService.getAttachmentUrl(fileId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      showError('Failed to download file');
    }
  };

  // Show login prompt if not authenticated
  if (!authIsAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Connect Your Google Account
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please sign in with Google to access your liabilities
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
          Please select or create a project to view liabilities
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
          Liabilities {liabilities.length > 0 && `(${liabilities.length})`}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          disabled={loading}
        >
          Add Liability
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      <LiabilityList
        liabilities={liabilities}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleViewLiability}
      />

      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Liability' : 'Add New Liability'}</DialogTitle>
        <DialogContent>
          <LiabilityForm
            key={isEditMode && selectedLiability?.row ? `edit-${selectedLiability.row}` : 'add-new'}
            defaultValues={isEditMode && selectedLiability ? selectedLiability : undefined}
            columns={getColumns()}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={loading}
            liabilityRow={isEditMode && selectedLiability?.row ? selectedLiability.row : undefined}
            existingFileId={isEditMode && selectedLiability ? 
              (selectedLiability['Attachment Path'] as string) || 
              (selectedLiability['attachment'] as string) || 
              null : null}
          />
        </DialogContent>
      </Dialog>

      {/* Liability Detail Dialog */}
      <Dialog 
        open={isDetailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="span">
            Liability Details
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
          {selectedLiabilityForView && (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.keys(selectedLiabilityForView)
                  .filter(key => key !== 'row' && 
                    !key.toLowerCase().includes('attachment') && 
                    !key.toLowerCase().includes('file'))
                  .map((key) => {
                    const value = selectedLiabilityForView[key];
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
                const attachmentKey = Object.keys(selectedLiabilityForView).find(key => 
                  key.toLowerCase().includes('attachment') || key.toLowerCase().includes('file')
                );
                const fileId = attachmentKey ? (selectedLiabilityForView[attachmentKey] as string) : null;
                
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
          {selectedLiabilityForView && (
            <Button 
              onClick={() => {
                handleCloseDetailDialog();
                handleEdit(selectedLiabilityForView);
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
                onLoad={() => {
                  console.log('Image loaded successfully:', previewImageUrl);
                }}
                onError={(e) => {
                  // If image fails to load, show error message
                  console.error('Image failed to load:', {
                    url: previewImageUrl,
                    fileId: previewFileId,
                    fileName: previewFileName
                  });
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const errorBox = document.createElement('div');
                  errorBox.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                      <p style="color: #d32f2f; font-weight: 600; margin-bottom: 10px;">Failed to load image</p>
                      <p style="color: #666; font-size: 14px;">Please check the browser console for details</p>
                      <p style="color: #666; font-size: 12px; margin-top: 10px;">URL: ${previewImageUrl}</p>
                    </div>
                  `;
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
        <DialogTitle>Delete Liability</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this liability? This action cannot be undone.
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
    </Box>
  );
};
