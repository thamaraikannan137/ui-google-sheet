import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
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
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(`Authentication failed: ${errorParam}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        return;
      }

      try {
        const response = await authService.handleGoogleCallback(code);
        setStatus('success');
        setMessage(`Successfully authenticated as ${response.email || 'user'}`);
        
        // Redirect to expenses page after a short delay
        setTimeout(() => {
          navigate('/expenses');
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Failed to complete authentication');
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

