import { NavItem } from '@/types';

export const firstNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
  },
  {
    title: 'Inbox',
    url: '/admin/inbox',
    icon: 'inbox',
    shortcut: ['i', 'i'],
    isActive: false,
  }
];

export const secNavItems: NavItem[] = [
    {
    title: 'Products',
    url: '/admin/shop',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
  },
    {
    title: 'Add New Product',
    url: '/admin/shop/new',
    icon: 'add',
    shortcut: ['n', 'n'],
    isActive: false,
  },
];

export const catNavItems: NavItem[] = [
    {
    title: 'Categories',
    url: '/admin/categories',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
  },
    {
    title: 'Add New Category',
    url: '/admin/categories/new',
    icon: 'add',
    shortcut: ['n', 'n'],
    isActive: false,
  },
];

export const orderNavItems: NavItem[] = [
    {
    title: 'Orders',
    url: '/admin/orders',
    icon: 'orders',
    shortcut: ['o', 'o'],
    isActive: false,
  }
];

export const UserNavItems: NavItem[] = [
    {
    title: 'Users',
    url: '/admin/users',
    icon: 'user',
    shortcut: ['u', 'u'],
    isActive: false,
  }
];

export const profileNavItems: NavItem[] = [
    {
    title: 'Profile',
    url: '/admin/profile',
    icon: 'userPen',
    shortcut: ['p', 'r'],
    isActive: false,
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];