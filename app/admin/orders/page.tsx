"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Search,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  DollarSign,
  Clock,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderType {
  _id: string;
  clerkId: string;
  fullName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  country: string;
  state: string;
  city?: string;
  postalCode: string;
  streetAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  slug?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface StatusCounts {
  pending?: number;
  paid?: number;
  shipped?: number;
  delivered?: number;
  cancelled?: number;
}

const AdminOrdersPage = () => {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  const [revenue, setRevenue] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  
  // Selected order for details
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/admin/api/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
      setStatusCounts(data.statusCounts || {});
      setRevenue(data.revenue || 0);
      setTotalOrdersCount(data.totalOrdersCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders(1);
    }
  }, [user, statusFilter, searchTerm]);

  const updateOrderStatus = async (id: string, status: string, trackingNumber?: string, notes?: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/admin/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...(trackingNumber && { trackingNumber }),
          ...(notes && { notes })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update order');
      }

      await fetchOrders(currentPage);
      setIsDetailOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/admin/api/orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete order');
      }

      await fetchOrders(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'paid': return 'default';
      case 'shipped': return 'outline';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <CreditCard className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin orders.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and track shipments</p>
        </div>

        {/* Revenue Stats */}
        <div className="flex gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="text-right">
                <div className="text-sm font-medium">Revenue</div>
                <div className="text-xs text-gray-500">{formatCurrency(revenue)}</div>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              <div className="text-right">
                <div className="text-sm font-medium">Total Orders</div>
                <div className="text-xs text-gray-500">{totalOrdersCount}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm font-medium">Pending</div>
              <div className="text-xs text-gray-500">{statusCounts.pending || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Paid</div>
              <div className="text-xs text-gray-500">{statusCounts.paid || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">Shipped</div>
              <div className="text-xs text-gray-500">{statusCounts.shipped || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">Delivered</div>
              <div className="text-xs text-gray-500">{statusCounts.delivered || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-medium">Cancelled</div>
              <div className="text-xs text-gray-500">{statusCounts.cancelled || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by customer name, email, order ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">No orders match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order._id} 
                      className={`hover:bg-gray-50 ${order.status === 'pending' ? 'bg-orange-50' : ''}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="font-mono text-sm">
                            {order.slug || order._id.slice(-8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.fullName} {order.lastName}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {order.items.map(item => item.title).join(', ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog 
                            open={isDetailOpen && selectedOrder?._id === order._id}
                            onOpenChange={(open) => {
                              setIsDetailOpen(open);
                              if (open) {
                                setSelectedOrder(order);
                              } else {
                                setSelectedOrder(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <ShoppingCart className="h-5 w-5" />
                                  Order Details - {order.slug || order._id.slice(-8)}
                                </DialogTitle>
                                <DialogDescription>
                                  Order from {order.fullName} {order.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedOrder && (
                                <OrderDetailView 
                                  order={selectedOrder}
                                  onStatusUpdate={(status, trackingNumber, notes) => 
                                    updateOrderStatus(selectedOrder._id, status, trackingNumber, notes)
                                  }
                                  isUpdating={updatingStatus}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteOrder(order._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                fetchOrders(newPage);
              }}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                fetchOrders(newPage);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Detail Component
interface OrderDetailViewProps {
  order: OrderType;
  onStatusUpdate: (status: string, trackingNumber?: string, notes?: string) => void;
  isUpdating: boolean;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ 
  order, 
  onStatusUpdate, 
  isUpdating 
}) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <p><span className="font-medium">Name:</span> {order.fullName} {order.lastName}</p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {order.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {order.phoneNumber}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>{order.streetAddress}</p>
              <p>
                {order.city && `${order.city}, `}
                {order.state} {order.postalCode}
              </p>
              <p>{order.country}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Order Details
            </h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <p><span className="font-medium">Order ID:</span> {order.slug || order._id.slice(-8)}</p>
              <p><span className="font-medium">Created:</span> {formatDate(order.createdAt)}</p>
              <p><span className="font-medium">Updated:</span> {formatDate(order.updatedAt)}</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Tracking Information
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p><span className="font-medium">Tracking Number:</span> {order.trackingNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Order Items ({order.items.reduce((acc, item) => acc + item.quantity, 0)} items)
        </h4>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.title}
                    width={64}
                    height={64}
                    className="h-14 w-14 object-cover rounded-md"
                  />
                ) : (
                  <Package className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{item.title}</h5>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)} each</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>{formatCurrency(order.total - order.subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-gray-900">Order Management</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number
            </label>
            <Input
              placeholder="Enter tracking number (optional)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isUpdating}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes
          </label>
          <Textarea
            rows={3}
            placeholder="Add internal notes about this order..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => onStatusUpdate(newStatus, trackingNumber, adminNotes)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Update Order
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;