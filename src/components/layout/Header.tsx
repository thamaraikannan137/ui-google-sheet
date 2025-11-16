import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, 
  Toolbar, 
  Typography, 
  IconButton, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { useAppSelector } from '../../store';
import { navigationItems } from '../../config/navigation';
import { CustomAvatar, ThemeToggle, NavSearch } from '../common';

interface HeaderProps {
  onDrawerToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  // Get current page title based on route
  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;
    const currentNavItem = navigationItems.find(item => item.path === currentPath);
    return currentNavItem?.title || 'Dashboard';
  }, [location.pathname]);

  return (
    <Toolbar
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isMobile && onDrawerToggle && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open navigation"
            onClick={onDrawerToggle}
            sx={{
              mr: 1
            }}
          >
            <i className="ri-menu-line" />
          </IconButton>
        )}
        <Typography variant="h6" component="h1" noWrap>
          {pageTitle}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Search */}
        <NavSearch />
        
        {/* Theme Toggle Icon */}
        <ThemeToggle />
        
        {/* User Avatar */}
        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Welcome, {user.name}
            </Typography>
            <CustomAvatar
              color="primary"
              skin="light"
              size={40}
              src={user.avatar}
              alt={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </CustomAvatar>
          </Box>
        ) : (
          <CustomAvatar color="secondary" skin="light" size={40}>
            ?
          </CustomAvatar>
        )}
      </Box>
    </Toolbar>
  );
};
