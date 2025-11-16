import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MuiButton, MuiInput } from '../common';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agree: z.boolean().refine(v => v, { message: 'You must agree to privacy policy & terms' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      // Call your registration API
      console.log('Registration data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Registration successful!');
      reset();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Account</h2>

      <div className="flex flex-col gap-5">
        <MuiInput
          {...register('name')}
          type="text"
          label="Full Name"
          placeholder="Enter your name"
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <MuiInput
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <MuiInput
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          error={!!errors.password}
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword(v => !v)}
                  onMouseDown={e => e.preventDefault()}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <i className="ri-eye-off-line" /> : <i className="ri-eye-line" />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <MuiInput
          {...register('confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter your password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  onMouseDown={e => e.preventDefault()}
                  aria-label="toggle confirm password visibility"
                >
                  {showConfirmPassword ? <i className="ri-eye-off-line" /> : <i className="ri-eye-line" />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <div className="flex flex-col gap-1">
          <FormControlLabel
            control={<Checkbox {...register('agree')} />}
            label={
              <>
                <span>I agree to </span>
                <Link className='text-primary' href='/' onClick={e => e.preventDefault()} underline="none">
                  privacy policy & terms
                </Link>
              </>
            }
          />
          {errors.agree?.message && (
            <Typography variant="caption" color="error">{errors.agree.message}</Typography>
          )}
        </div>

        <MuiButton
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          Register
        </MuiButton>
      </div>
    </form>
  );
};

