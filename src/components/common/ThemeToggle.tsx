import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'light' ? <i className="ri-moon-line" /> : <i className="ri-sun-line" />}
      </IconButton>
    </Tooltip>
  );
};

