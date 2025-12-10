// Search data for NavSearch component

export type SearchItem = {
  id: string;
  name: string;
  url: string;
  icon: string;
  section: string;
  shortcut?: string;
};

const searchData: SearchItem[] = [
  // Main Pages
  {
    id: '1',
    name: 'Dashboard',
    url: '/',
    icon: 'ri-dashboard-line',
    section: 'Pages',
    shortcut: '⌘ H',
  },
  {
    id: '2',
    name: 'Projects',
    url: '/projects',
    icon: 'ri-folder-line',
    section: 'Pages',
    shortcut: '⌘ P',
  },
  {
    id: '2a',
    name: 'About',
    url: '/about',
    icon: 'ri-information-line',
    section: 'Pages',
    shortcut: '⌘ A',
  },
  {
    id: '3',
    name: 'Counter',
    url: '/counter',
    icon: 'ri-calculator-line',
    section: 'Features',
  },
  {
    id: '4',
    name: 'Theme Example',
    url: '/theme-example',
    icon: 'ri-palette-line',
    section: 'Features',
  },
  
  // Auth Pages
  {
    id: '5',
    name: 'Login',
    url: '/login',
    icon: 'ri-login-box-line',
    section: 'Authentication',
    shortcut: '⌘ L',
  },
  
  // Settings (can be added when route exists)
  {
    id: '7',
    name: 'Settings',
    url: '/settings',
    icon: 'ri-settings-3-line',
    section: 'System',
  },
  
  // Documentation (external)
  {
    id: '8',
    name: 'GitHub Repository',
    url: 'https://github.com',
    icon: 'ri-github-line',
    section: 'External',
  },
  {
    id: '9',
    name: 'Documentation',
    url: 'https://react.dev',
    icon: 'ri-book-open-line',
    section: 'External',
  },
  
  // Additional items to test scrolling
  {
    id: '10',
    name: 'User Profile',
    url: '/profile',
    icon: 'ri-user-line',
    section: 'Pages',
  },
  {
    id: '11',
    name: 'Products',
    url: '/products',
    icon: 'ri-shopping-bag-line',
    section: 'Pages',
  },
  {
    id: '12',
    name: 'Analytics',
    url: '/analytics',
    icon: 'ri-bar-chart-line',
    section: 'Features',
  },
  {
    id: '13',
    name: 'Reports',
    url: '/reports',
    icon: 'ri-file-chart-line',
    section: 'Features',
  },
  {
    id: '14',
    name: 'Messages',
    url: '/messages',
    icon: 'ri-message-3-line',
    section: 'Features',
  },
  {
    id: '15',
    name: 'Notifications',
    url: '/notifications',
    icon: 'ri-notification-line',
    section: 'System',
  },
  {
    id: '16',
    name: 'Help Center',
    url: '/help',
    icon: 'ri-question-line',
    section: 'System',
  },
  {
    id: '17',
    name: 'API Documentation',
    url: 'https://api-docs.example.com',
    icon: 'ri-code-box-line',
    section: 'External',
  },
];

export default searchData;

