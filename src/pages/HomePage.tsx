import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Typography,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  useEffect(() => {
    // Only redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
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
      </Box>
    );
  }

  // Show simple welcome message
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      textAlign="center"
    >
      <Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" mt={2}>
          Your workspace is ready
        </Typography>
      </Box>
    </Box>
  );
};

