// Navigation Configuration

export interface NavItemType {
  title: string;
  path?: string;
  icon?: string; // Icon name from MUI icons
  children?: NavItemType[];
}

export const navigationItems: NavItemType[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: 'Dashboard',
  },
  {
    title: 'About',
    path: '/about',
    icon: 'Info',
  },
];

// Project-specific navigation items (requires projectId)
export const getProjectNavigationItems = (projectId: number): NavItemType[] => [
  {
    title: 'Liabilities',
    path: `/projects/${projectId}/liabilities`,
    icon: 'Calculate',
  },
];

export const navigationConfig = {
  navWidth: 260,
  collapsedWidth: 80,
};

