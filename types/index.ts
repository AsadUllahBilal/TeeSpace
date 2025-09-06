import { Icons } from '@/components/icons';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: ICategory | string;
  colors: string[];
  sizes: string[];
  stockQuantity: number;
  images: string[];
  averageRating?: number;
  reviewCount?: number;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}