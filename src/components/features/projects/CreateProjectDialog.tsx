import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useProjects } from '../../../hooks/useProjects';
import { MuiButton } from '../../common';
import type { Template } from '../../../services/projectService';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectDialog({ open, onClose, onSuccess }: CreateProjectDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { templates, templatesLoading, fetchTemplates, createProject } = useProjects();
  
  const [projectName, setProjectName] = useState('');
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [sheetMode, setSheetMode] = useState<'template' | 'scratch'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      // Reset form
      setProjectName('');
      setMode('new');
      setSheetMode('template');
      setSelectedTemplateId(null);
      setSpreadsheetUrl('');
      setUrlError('');
      setError(null);
      setTabValue(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only depend on open state, not fetchTemplates function

  const extractSpreadsheetId = (url: string): string | null => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleUrlChange = (value: string) => {
    setSpreadsheetUrl(value);
    setUrlError('');
    
    if (value.trim() && !extractSpreadsheetId(value)) {
      setUrlError('Invalid Google Sheets URL');
    }
  };

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (mode === 'existing') {
      if (!spreadsheetUrl.trim()) {
        setError('Please enter a Google Sheets URL');
        return;
      }
      
      const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
      if (!spreadsheetId) {
        setError('Invalid Google Sheets URL');
        return;
      }
    } else if (sheetMode === 'template' && !selectedTemplateId) {
      setError('Please select a template');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await createProject({
        name: projectName.trim(),
        mode: mode === 'existing' ? 'existing' : sheetMode,
        templateId: mode === 'new' && sheetMode === 'template' ? selectedTemplateId! : undefined,
        spreadsheetUrl: mode === 'existing' ? spreadsheetUrl : undefined,
      });
      
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Create New Project
          </Typography>
          <Button
            onClick={onClose}
            sx={{ minWidth: 'auto', p: 1 }}
            disabled={creating}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Expense Tracker 2024"
            required
            disabled={creating}
            autoFocus
            helperText="Enter a name for your project"
            sx={{ mb: 3 }}
          />

          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Project Type</FormLabel>
            <RadioGroup
              row={!isMobile}
              value={mode}
              onChange={(e) => {
                setMode(e.target.value as 'new' | 'existing');
                setTabValue(0);
              }}
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="Create New Sheet"
                disabled={creating}
              />
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label="Connect Existing Sheet"
                disabled={creating}
              />
            </RadioGroup>
          </FormControl>

          {mode === 'new' && (
            <Box>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => {
                  setTabValue(newValue);
                  setSheetMode(newValue === 0 ? 'template' : 'scratch');
                }}
                sx={{ mb: 3 }}
              >
                <Tab label="Use Template" disabled={creating} />
                <Tab label="Start from Scratch" disabled={creating} />
              </Tabs>

              {tabValue === 0 && (
                <Box>
                  {templatesLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : templates.length === 0 ? (
                    <Alert severity="info">No templates available</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {templates.map((template) => (
                        <Grid item xs={12} sm={6} key={template.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              border: selectedTemplateId === template.id ? 2 : 1,
                              borderColor:
                                selectedTemplateId === template.id
                                  ? 'primary.main'
                                  : 'divider',
                              '&:hover': {
                                borderColor: 'primary.main',
                              },
                            }}
                            onClick={() => setSelectedTemplateId(template.id)}
                          >
                            <CardContent>
                              <Typography variant="h6" gutterBottom fontWeight="bold">
                                {template.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {template.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Columns: {template.headers.join(', ')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {tabValue === 1 && (
                <Alert severity="info">
                  An empty Google Sheet will be created with your project name.
                </Alert>
              )}
            </Box>
          )}

          {mode === 'existing' && (
            <Box>
              <TextField
                fullWidth
                label="Google Sheets URL"
                value={spreadsheetUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
                error={!!urlError}
                helperText={urlError || 'Paste the full URL from your Google Sheets'}
                disabled={creating}
                sx={{ mb: 2 }}
              />
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                <Typography variant="body2">
                  <strong>How to get the URL:</strong>
                  <br />
                  1. Open your Google Sheet
                  <br />
                  2. Copy the URL from your browser's address bar
                  <br />
                  3. Paste it above
                </Typography>
              </Alert>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
        {!projectName.trim() && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Please enter a project name
          </Typography>
        )}
        {projectName.trim() && mode === 'new' && sheetMode === 'template' && !selectedTemplateId && !templatesLoading && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Please select a template
          </Typography>
        )}
        {projectName.trim() && mode === 'existing' && !spreadsheetUrl.trim() && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Please enter a Google Sheets URL
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, width: '100%' }}>
          <Button onClick={onClose} disabled={creating}>
            Cancel
          </Button>
          <MuiButton
            variant="contained"
            onClick={handleCreate}
            loading={creating}
            disabled={
              creating ||
              !projectName.trim() ||
              (mode === 'existing' && (!spreadsheetUrl.trim() || !!urlError)) ||
              (mode === 'new' && sheetMode === 'template' && !selectedTemplateId) ||
              (mode === 'new' && sheetMode === 'template' && templatesLoading)
            }
          >
            Create & Connect
          </MuiButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
