import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FolderOpen as FolderOpenIcon,
  CalendarToday as CalendarTodayIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useProjects } from '../../../hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { MuiButton } from '../../common';
import type { Project } from '../../../services/projectService';
import CreateProjectDialog from './CreateProjectDialog';

export const ProjectSelector = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    selectProject,
    deleteProject,
  } = useProjects();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const handleSelectProject = (project: Project) => {
    selectProject(project);
    navigate(`/projects/${project.id}/expenses`);
  };

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      setDeletingId(id);
      try {
        await deleteProject(id);
      } catch (err) {
        console.error('Failed to delete project:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    // The createProject hook already sets the currentProject
    // Just navigate after closing the dialog
    setTimeout(() => {
      if (currentProject) {
        navigate(`/projects/${currentProject.id}/expenses`);
      }
    }, 100);
  };

  if (loading && projects.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography>Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          My Projects
        </Typography>
        <MuiButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
          size={isMobile ? 'medium' : 'large'}
        >
          Create Project
        </MuiButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Box
          textAlign="center"
          py={8}
          px={2}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom color="text.secondary">
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first project to get started
          </Typography>
          <MuiButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
            size="large"
          >
            Create Your First Project
          </MuiButton>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => handleSelectProject(project)}
              >
                {/* Card Header with Icon */}
                <Box
                  sx={{
                    p: 2.5,
                    pb: 1.5,
                  }}
                >
                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FolderOpenIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="h6"
                        component="h2"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Card Content */}
                <CardContent sx={{ flexGrow: 1, pt: 1.5, pb: 1 }}>
                  {/* Project Info */}
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Created {new Date(project.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>

                  {/* Spreadsheet ID */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Spreadsheet ID
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'text.primary',
                      }}
                    >
                      {project.spreadsheetId}
                    </Typography>
                  </Box>
                </CardContent>

                {/* Card Actions */}
                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 0,
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProject(project);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      py: 0.75,
                    }}
                  >
                    Open Project
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    disabled={deletingId === project.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'error.main',
                        bgcolor: 'error.lighter',
                      },
                    }}
                  >
                    {deletingId === project.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
};

export default ProjectSelector;
