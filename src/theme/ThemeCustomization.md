# MUI Theme Customization Guide

## Overview
This boilerplate includes a fully configured Material-UI (MUI) theme system with light and dark mode support.

## File Structure
```
src/
├── theme/
│   └── index.ts              # Main theme configuration
├── contexts/
│   └── ThemeContext.tsx      # Theme context with MUI integration
└── components/
    └── common/
        └── ThemeToggle.tsx   # Theme toggle component
```

## Theme Configuration

### Color Palettes
The theme includes customized color palettes for both light and dark modes:

- **Primary**: Main brand color (Blue in light, Light blue in dark)
- **Secondary**: Accent color (Purple in light, Light purple in dark)
- **Error**: Error states (Red)
- **Warning**: Warning states (Orange)
- **Info**: Informational states (Light blue)
- **Success**: Success states (Green)

### Typography
Custom typography settings include:
- System font stack for optimal performance
- Six heading levels (h1-h6) with appropriate sizes and weights
- Button text with custom transform settings

### Component Customization
Pre-configured components:
- **MuiButton**: Rounded corners, no shadow by default, custom hover effects
- **MuiCard**: Rounded corners with subtle shadows
- **MuiTextField**: Rounded input fields
- **MuiPaper**: Rounded corners with custom elevations
- **MuiAppBar**: Subtle shadow

### Shape & Spacing
- **Border Radius**: 8px (buttons, inputs) to 12px (cards, papers)
- **Spacing**: 8px base unit (MUI default)

## Usage

### Using the Theme in Components

#### 1. Access Theme via Hook
```tsx
import { useTheme as useMuiTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useMuiTheme();
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(2)
    }}>
      Content
    </div>
  );
}
```

#### 2. Using sx Prop (Recommended)
```tsx
import { Box, Typography } from '@mui/material';

function MyComponent() {
  return (
    <Box sx={{ 
      bgcolor: 'primary.main', 
      p: 2,
      borderRadius: 2
    }}>
      <Typography variant="h4" color="primary.contrastText">
        Hello World
      </Typography>
    </Box>
  );
}
```

#### 3. Using styled() API
```tsx
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function MyComponent() {
  return <StyledBox>Content</StyledBox>;
}
```

### Toggle Theme Mode

#### 1. Using ThemeToggle Component
```tsx
import { ThemeToggle } from '@/components/common';

function Header() {
  return (
    <AppBar>
      <Toolbar>
        <Typography>My App</Typography>
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
}
```

#### 2. Using Context Directly
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { mode, toggleTheme, setThemeMode } = useTheme();
  
  return (
    <div>
      <p>Current mode: {mode}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setThemeMode('dark')}>Set Dark</button>
    </div>
  );
}
```

## Customization

### Modify Color Palette
Edit `/src/theme/index.ts`:

```tsx
const lightPalette = {
  primary: {
    main: '#YOUR_COLOR',
    light: '#YOUR_LIGHT_COLOR',
    dark: '#YOUR_DARK_COLOR',
    contrastText: '#fff',
  },
  // ... other colors
};
```

### Add Custom Breakpoints
```tsx
const commonThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  // ... other options
};
```

### Add Custom Component Styles
```tsx
const commonThemeOptions = {
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    // ... other components
  },
};
```

### Add Custom Theme Variables
```tsx
// Extend theme types
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      headerHeight: number;
      sidebarWidth: number;
    };
  }
  interface ThemeOptions {
    custom?: {
      headerHeight?: number;
      sidebarWidth?: number;
    };
  }
}

// Add to theme
export const lightTheme = createTheme({
  palette: { ... },
  custom: {
    headerHeight: 64,
    sidebarWidth: 240,
  },
});
```

## MUI Components Available

### Layout
- Box, Container, Grid, Stack, ImageList

### Inputs
- Button, Checkbox, Radio, Select, Switch, TextField, Autocomplete, Slider

### Data Display
- Avatar, Badge, Chip, Divider, List, Table, Tooltip, Typography

### Feedback
- Alert, Dialog, Snackbar, Progress, Skeleton

### Navigation
- AppBar, Breadcrumbs, Drawer, Menu, Pagination, Tabs

### Surfaces
- Accordion, MuiCard, Paper

### Utils
- ClickAwayListener, Modal, Popover, Popper, Portal

## Best Practices

1. **Use MUI Components**: Leverage pre-built MUI components instead of creating custom ones
2. **Use sx Prop**: Prefer `sx` prop for component styling (supports theme values)
3. **Responsive Design**: Use theme breakpoints for responsive layouts
4. **Color Consistency**: Use palette colors instead of hardcoded values
5. **Spacing**: Use `theme.spacing()` or spacing props (p, m, px, etc.)
6. **Typography**: Use Typography component with variant prop
7. **Icons**: Install `@mui/icons-material` for Material icons

## Installing MUI Icons (Optional)

```bash
npm install @mui/icons-material
```

Usage:
```tsx
import { Home, Settings, Favorite } from '@mui/icons-material';

<Home color="primary" />
<Settings fontSize="large" />
<Favorite sx={{ color: 'secondary.main' }} />
```

## Resources

- [MUI Documentation](https://mui.com/material-ui/getting-started/)
- [MUI Customization](https://mui.com/material-ui/customization/theming/)
- [MUI Components](https://mui.com/material-ui/all-components/)
- [MUI System Props](https://mui.com/system/properties/)

