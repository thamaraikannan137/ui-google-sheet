import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

/**
 * Custom MUI TextField wrapper with default props
 * Extends all MUI TextField props with custom error handling
 */
interface MuiInputProps extends Omit<TextFieldProps, 'error'> {
  error?: string | boolean;
}

export const MuiInput = ({ error, helperText, ...props }: MuiInputProps) => {
  const isError = typeof error === 'string' ? !!error : error;
  const errorMessage = typeof error === 'string' ? error : helperText;
  
  return (
    <TextField 
      variant="outlined" 
      fullWidth 
      error={isError}
      helperText={errorMessage}
      {...props} 
    />
  );
};

export default MuiInput;

