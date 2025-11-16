import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

/**
 * Custom MUI Button wrapper with default props and loading state
 * Extends all MUI Button props
 */
interface MuiButtonProps extends ButtonProps {
  isLoading?: boolean;
  loading?: boolean;
}

export const MuiButton = ({ isLoading, loading, children, disabled, ...props }: MuiButtonProps) => {
  const isLoadingState = isLoading || loading;
  
  return (
    <Button 
      variant="contained" 
      disabled={disabled || isLoadingState}
      {...props}
    >
      {isLoadingState ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default MuiButton;

