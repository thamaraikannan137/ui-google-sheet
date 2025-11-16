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
        if (status.authenticated && status.spreadsheetConnected) {
          navigate('/expenses');
        } else if (status.authenticated) {
          // Authenticated but spreadsheet not connected
          navigate('/expenses');
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  const handleGoogleLogin = () => {
    authService.initiateGoogleAuth();
  };

  return (
    <Box className='flex min-h-screen'>
      <Box
        className='flex items-center justify-center flex-1 min-h-screen relative p-6 hidden md:flex'
        sx={{
          borderRight: theme => theme.palette.divider
        }}
      >
        <LoginIllustration
          src={loginIllustration}
          alt='login-illustration'
          className={theme.direction === 'rtl' ? 'scale-x-[-1]' : ''}
        />
      </Box>
      <Box className='flex justify-center items-center min-h-screen bg-background-paper w-full p-6 md:w-[480px]'>
        <Box className='absolute top-6 left-6'>
          <Typography variant='h4' color='primary'>LOGO</Typography>
        </Box>
        <Box className='w-full max-w-[400px] mt-11 md:mt-0'>
          <Box className='mb-6'>
            <Typography variant='h4'>Welcome! 👋🏻</Typography>
            <Typography>Sign in with Google to manage your expenses</Typography>
          </Box>
          <Box className='flex flex-col gap-5'>
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
              }}
            >
              Continue with Google
            </Button>
            <Box className='mt-4'>
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

