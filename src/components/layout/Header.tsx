import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Toolbar, 
  Typography, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Logout as LogoutIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store';
import { clearExpenses } from '../../store/slices/expenseSlice';
import { navigationItems } from '../../config/navigation';
import { CustomAvatar, ThemeToggle, NavSearch } from '../common';
import { authService } from '../../services/authService';

interface HeaderProps {
  onDrawerToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Get user email from localStorage (since we're using session-based auth)
  const userEmail = localStorage.getItem('user_email') || '';
  const isMenuOpen = Boolean(anchorEl);

  // Get current page title based on route
  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;
    const currentNavItem = navigationItems.find(item => item.path === currentPath);
    return currentNavItem?.title || 'Dashboard';
  }, [location.pathname]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      // Clear Redux state
      dispatch(clearExpenses());
      // Call logout service (will clear localStorage and redirect)
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear state and redirect even if API call fails
      dispatch(clearExpenses());
      navigate('/login');
    }
  };

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
        
        {/* User Avatar with Menu */}
        {authService.isAuthenticated() ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {userEmail || 'User'}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={isMenuOpen ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
            >
              <CustomAvatar
                color="primary"
                skin="light"
                size={40}
              >
                {(userEmail || 'U').charAt(0).toUpperCase()}
              </CustomAvatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={isMenuOpen}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profile" secondary={userEmail} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
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
