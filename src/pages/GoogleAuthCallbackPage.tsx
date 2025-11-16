import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { authService } from '../services/authService';
import { MuiButton } from '../components/common';

export const GoogleAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const sessionId = searchParams.get('sessionId');
      const email = searchParams.get('email');
      const success = searchParams.get('success');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(`Authentication failed: ${errorParam}`);
        return;
      }

      if (success === 'true' && sessionId && email) {
        try {
          // Store sessionId for API calls
          authService.handleCallbackSuccess(sessionId, email);
          setStatus('success');
          setMessage(`Successfully authenticated as ${email}`);
          
          // Redirect to expenses page after a short delay
          setTimeout(() => {
            navigate('/expenses');
          }, 2000);
        } catch (err) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        }
      } else {
        setStatus('error');
        setError('Authentication failed: Missing session information');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Completing authentication...
        </Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 3,
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <MuiButton variant="outlined" onClick={() => navigate('/')}>
            Go Home
          </MuiButton>
          <MuiButton variant="contained" onClick={() => authService.initiateGoogleAuth()}>
            Try Again
          </MuiButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        p: 3,
      }}
    >
      <Alert severity="success" sx={{ maxWidth: 500 }}>
        {message}
      </Alert>
      <Typography variant="body2" color="text.secondary">
        Redirecting to expenses page...
      </Typography>
      <CircularProgress size={24} />
    </Box>
  );
};

