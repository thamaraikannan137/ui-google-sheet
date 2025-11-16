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
    title: 'Expenses',
    path: '/expenses',
    icon: 'Calculate',
  },
  {
    title: 'About',
    path: '/about',
    icon: 'Info',
  },
];

export const navigationConfig = {
  navWidth: 260,
  collapsedWidth: 80,
};

