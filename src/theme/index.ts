// Theme configuration exports
// Main theme setup is now in ThemeOptions.ts and themeConfig.ts

export { lightThemeOptions, darkThemeOptions } from './ThemeOptions';
export { default as themeConfig } from '../config/themeConfig';

// Re-export for backward compatibility
import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { lightThemeOptions, darkThemeOptions } from './ThemeOptions';

export const lightTheme: Theme = createTheme(lightThemeOptions);
export const darkTheme: Theme = createTheme(darkThemeOptions);

export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
};

