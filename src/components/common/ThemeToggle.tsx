import { IconButton, Tooltip } from '@mui/material';
import { useThemeContext } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'light' ? <i className="ri-moon-line" /> : <i className="ri-sun-line" />}
      </IconButton>
    </Tooltip>
  );
};

