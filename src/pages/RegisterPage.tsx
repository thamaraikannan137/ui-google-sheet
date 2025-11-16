import { RegisterForm } from '../components/forms';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

const RegisterIllustration = styled('img')(({ theme }) => ({
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

export const RegisterPage = () => {
  const theme = useTheme();

  return (
    <Box className='flex min-h-screen'>
      <Box
        className='flex items-center justify-center flex-1 min-h-screen relative p-6 hidden md:flex'
        sx={{
          borderRight: theme => theme.palette.divider
        }}
      >
        <RegisterIllustration
          src='/images/illustrations/login.png'
          alt='register-illustration'
          className={theme.direction === 'rtl' ? 'scale-x-[-1]' : ''}
        />
      </Box>
      <Box className='flex justify-center items-center min-h-screen bg-background-paper w-full p-6 md:w-[480px]'>
        <Box className='absolute top-6 left-6'>
          <Typography variant='h4' color='primary'>LOGO</Typography>
        </Box>
        <Box className='w-full max-w-[400px] mt-11 md:mt-0'>
          <Box className='mb-6'>
            <Typography variant='h4'>Create Account</Typography>
            <Typography>Join us by creating your account below</Typography>
          </Box>
          <RegisterForm />
        </Box>
      </Box>
    </Box>
  );
};

