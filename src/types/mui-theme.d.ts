import '@mui/material/styles';

// Extend the palette color options to include 'lighter'
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
  }
}
