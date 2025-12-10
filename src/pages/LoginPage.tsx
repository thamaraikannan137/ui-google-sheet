// React Imports
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import loginIllustration from '../assets/images/auth-v2-mask-light.png';
import { authService } from '../services/authService';

// Icons - using RemixIcon

// Styled Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}));


export const LoginPage = () => {
  // Hooks
  const navigate = useNavigate();
  const theme = useTheme();

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await authService.checkAuthStatus();
        if (status.authenticated) {
          navigate('/expenses');
        }
      } catch {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = () => {
    authService.initiateGoogleAuth();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Image */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          position: 'relative',
          p: 3,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <LoginIllustration
          src={loginIllustration}
          alt='login-illustration'
          className={theme.direction === 'rtl' ? 'scale-x-[-1]' : ''}
        />
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: { xs: '100%', md: '50%' },
          p: { xs: 3, md: 6 },
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Logo */}
        <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
          <Typography variant='h4' color='primary' sx={{ fontWeight: 600 }}>
            Expense Tracker
          </Typography>
        </Box>

        {/* Login Content */}
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
              Welcome! 👋🏻
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Sign in with Google to manage your expenses
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Button
              fullWidth
              variant='contained'
              size='large'
              onClick={handleGoogleLogin}
              startIcon={<i className="ri-google-fill" style={{ fontSize: '1.5rem' }} />}
              sx={{
                py: 1.5,
                backgroundColor: '#4285F4',
                '&:hover': {
                  backgroundColor: '#357AE8',
                },
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' align='center'>
                By continuing, you agree to connect your Google account to access your expense sheets.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

