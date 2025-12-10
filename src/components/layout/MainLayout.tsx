import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumb } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';

export const MainLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { checkAuthStatus } = useAuth();
  const { currentProject } = useProjects();
  const location = useLocation();

  // Initialize auth status on mount
  useEffect(() => {
    checkAuthStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleDrawerToggle = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  // Determine if we should show the sidebar
  // Hide sidebar only on /projects page (where users select projects)
  const isProjectsPage = location.pathname === '/projects';
  const showSidebar = !isProjectsPage;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar - Only show when project is selected and not on projects page */}
      {showSidebar && (
        <Navigation open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      )}

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Header with Mobile Menu Toggle */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Header onDrawerToggle={showSidebar ? handleDrawerToggle : undefined} />
        </Box>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {/* Breadcrumb */}
          <Breadcrumb />
          
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};
