import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation Sidebar */}
      <Navigation open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Header with Mobile Menu Toggle */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Header onDrawerToggle={handleDrawerToggle} />
        </Box>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};
