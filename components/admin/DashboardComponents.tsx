"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Mail,
  AlertTriangle,
  Calendar,
  Clock,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  description,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change !== undefined && (
                <div className={`flex items-center text-sm ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Revenue Chart Component
interface RevenueChartProps {
  data: Array<{
    _id: { year: number; month: number; day: number };
    revenue: number;
    orders: number;
  }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => 
      new Date(item._id.year, item._id.month - 1, item._id.day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    ),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Order Status Pie Chart Component
interface OrderStatusChartProps {
  data: {
    pending?: number;
    paid?: number;
    shipped?: number;
    delivered?: number;
    cancelled?: number;
  };
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const chartData = {
    labels: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          data.pending || 0,
          data.paid || 0,
          data.shipped || 0,
          data.delivered || 0,
          data.cancelled || 0,
        ],
        backgroundColor: [
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6',
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Top Selling Products Component
interface TopSellingProductsProps {
  products: Array<{
    _id: string;
    totalSold: number;
    totalRevenue: number;
  }>;
}

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ products }) => {
  const chartData = {
    labels: products.map(p => p._id),
    datasets: [
      {
        label: 'Units Sold',
        data: products.map(p => p.totalSold),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
interface RecentActivityProps {
  orders: Array<{
    _id: string;
    fullName: string;
    lastName: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
    slug?: string;
  }>;
  messages: Array<{
    _id: string;
    name: string;
    email: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ orders, messages }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'paid': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      case 'new': return 'destructive';
      case 'read': return 'secondary';
      case 'replied': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{order.fullName} {order.lastName}</p>
                  <p className="text-sm text-gray-500">{order.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-gray-500">
                    #{order.slug || order._id.slice(-8)}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No recent orders
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{message.name}</p>
                  <p className="text-sm text-gray-600 truncate max-w-xs">{message.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusBadgeVariant(message.status)} className="text-xs">
                      {message.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No recent messages
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Low Stock Alert Component
interface LowStockAlertsProps {
  products: Array<{
    _id: string;
    title: string;
    stock: number;
    price: number;
  }>;
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200">
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="text-xs">
                  {product.stock} left
                </Badge>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No low stock items
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Top Customers Component
interface TopCustomersProps {
  customers: Array<{
    _id: string;
    totalSpent: number;
    orderCount: number;
    customerName: string;
    customerEmail: string;
  }>;
}

export const TopCustomers: React.FC<TopCustomersProps> = ({ customers }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Top Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div key={customer._id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium">{customer.customerName}</p>
                  <p className="text-sm text-gray-500">{customer.customerEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
                <p className="text-sm text-gray-500">{customer.orderCount} orders</p>
              </div>
            </div>
          ))}
          {customers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No customer data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
