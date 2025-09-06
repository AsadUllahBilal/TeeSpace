"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  MetricCard,
  RevenueChart,
  OrderStatusChart,
  TopSellingProducts,
  RecentActivity,
  LowStockAlerts,
  TopCustomers,
} from '@/components/admin/DashboardComponents';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Mail,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  // Revenue & Orders
  totalRevenue: number;
  totalOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  revenueGrowth: number;
  orderGrowth: number;
  
  // Order Status
  orderStatusCounts: {
    pending?: number;
    paid?: number;
    shipped?: number;
    delivered?: number;
    cancelled?: number;
  };
  pendingOrders: number;
  
  // Charts Data
  dailyRevenue: Array<{
    _id: { year: number; month: number; day: number };
    revenue: number;
    orders: number;
  }>;
  
  // Products
  totalProducts: number;
  topSellingProducts: Array<{
    _id: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  lowStockProducts: Array<{
    _id: string;
    title: string;
    stock: number;
    price: number;
  }>;
  
  // Customers
  totalCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: Array<{
    _id: string;
    totalSpent: number;
    orderCount: number;
    customerName: string;
    customerEmail: string;
  }>;
  
  // Messages
  totalMessages: number;
  newMessages: number;
  
  // Recent Activity
  recentOrders: Array<{
    _id: string;
    fullName: string;
    lastName: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
    slug?: string;
  }>;
  recentMessages: Array<{
    _id: string;
    name: string;
    email: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  
  // Additional Metrics
  averageOrderValue: number;
  conversionRate: number;
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/dashboard');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={fetchDashboardData} 
          className="mt-4"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No dashboard data available</p>
          <Button onClick={fetchDashboardData} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {formatTime(lastUpdated)}
          </div>
          <Button 
            onClick={fetchDashboardData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.totalRevenue)}
          change={dashboardData.revenueGrowth}
          icon={<DollarSign className="h-6 w-6" />}
          description="All-time revenue"
          color="green"
        />
        
        <MetricCard
          title="Total Orders"
          value={dashboardData.totalOrders.toLocaleString()}
          change={dashboardData.orderGrowth}
          icon={<ShoppingCart className="h-6 w-6" />}
          description="Completed orders"
          color="blue"
        />
        
        <MetricCard
          title="Total Customers"
          value={dashboardData.totalCustomers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          description={`${dashboardData.newCustomersThisMonth} new this month`}
          color="purple"
        />
        
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(dashboardData.averageOrderValue)}
          icon={<TrendingUp className="h-6 w-6" />}
          description={`${dashboardData.conversionRate}% conversion rate`}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Products</span>
          </div>
          <p className="text-xl font-bold mt-1">{dashboardData.totalProducts}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Messages</span>
          </div>
          <p className="text-xl font-bold mt-1">{dashboardData.totalMessages}</p>
          {dashboardData.newMessages > 0 && (
            <p className="text-xs text-red-600">{dashboardData.newMessages} new</p>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Pending Orders</span>
          </div>
          <p className="text-xl font-bold mt-1">{dashboardData.pendingOrders}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Low Stock</span>
          </div>
          <p className="text-xl font-bold mt-1">{dashboardData.lowStockProducts.length}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={dashboardData.dailyRevenue} />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart data={dashboardData.orderStatusCounts} />
        </div>
      </div>

      {/* Products and Customer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSellingProducts products={dashboardData.topSellingProducts} />
        <TopCustomers customers={dashboardData.topCustomers} />
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LowStockAlerts products={dashboardData.lowStockProducts} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity 
            orders={dashboardData.recentOrders} 
            messages={dashboardData.recentMessages} 
          />
        </div>
      </div>
    </div>
  );
}
