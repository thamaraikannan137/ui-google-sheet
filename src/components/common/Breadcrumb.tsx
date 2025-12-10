import { Breadcrumbs, Link, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useProjects } from '../../hooks/useProjects';

export const Breadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject } = useProjects();

  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on projects page or home
  if (pathSegments[0] !== 'projects' || pathSegments.length === 1) {
    return null;
  }

  const getBreadcrumbName = (segment: string, index: number): string => {
    // If it's the project ID segment
    if (index === 1 && currentProject) {
      return currentProject.name;
    }
    
    // Capitalize and format segment names
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component="button"
        variant="body2"
        onClick={() => navigate('/projects')}
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        Projects
      </Link>
      
      {pathSegments.slice(1).map((segment, index) => {
        const isLast = index === pathSegments.length - 2;
        const path = `/${pathSegments.slice(0, index + 2).join('/')}`;
        const name = getBreadcrumbName(segment, index);

        if (isLast) {
          return (
            <Typography key={path} color="text.primary" variant="body2">
              {name}
            </Typography>
          );
        }

        return (
          <Link
            key={path}
            component="button"
            variant="body2"
            onClick={() => navigate(path)}
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': {
                textDecoration: 'underline',
                color: 'primary.main',
              },
            }}
          >
            {name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
