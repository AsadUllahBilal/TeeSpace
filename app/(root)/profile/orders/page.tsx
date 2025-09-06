"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import MyAccountSideBar from "@/components/MyAccountSideBar";
import { Skeleton } from "@/components/ui/skeleton";
import PageBanner from "@/components/PageBanner";
import { Input } from "@/components/ui/input";
import { Search, Eye, Calendar, MapPin, Package, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const OrderPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  type OrderType = {
    _id: string;
    createdAt: string;
    status: string;
    total: number;
    fullName: string;
    lastName: string;
    streetAddress: string;
    city?: string;
    state: string;
    country: string;
    postalCode: string;
    slug?: string;
    items: { title: string; quantity: number; price: number }[];
  };
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || 'Failed to load orders');
        }
        const data = await res.json();
        setOrders(data as OrderType[]);
        setFilteredOrders(data as OrderType[]);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load orders';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.fullName.toLowerCase().includes(term) ||
        order.lastName.toLowerCase().includes(term) ||
        order.items.some(item => item.title.toLowerCase().includes(term)) ||
        order.status.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "processing":
        return "secondary";
      case "shipped":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="w-full h-[200px] px-10 py-10">
          <Skeleton className="w-full h-[200px] bg-gray-200 rounded-xl" />
        </div>
        <div className="w-full flex items-start justify-center gap-6 px-10 py-10 mt-10">
          <Skeleton className="w-[300px] h-[400px] bg-gray-200 rounded-xl" />
          <Skeleton className="flex-1 h-[400px] bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-full">
        <PageBanner bannerName="My Account" />
        <p className="text-gray-400 my-8">
          Please Login to view Profile.{" "}
          <Link href="/sign-in">
            <span className="text-primary-green">Login</span>
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner bannerName="Orders" />
      <div className="w-full min-h-full px-4 md:px-10 py-10 flex gap-8 flex-col lg:flex-row">
        <MyAccountSideBar />
        
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {orders.length === 0 
                  ? "You haven't placed any orders yet." 
                  : "No orders match your search criteria."}
              </p>
              {orders.length === 0 && (
                <Button className="mt-4">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.fullName} {order.lastName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {order.city}, {order.state}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {order.items.map((item, idx) => (
                            <span key={idx}>
                              {item.title}{idx < order.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)} className="capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <div className="flex items-center justify-end">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          {Number(order.total).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
  <Link href={`/profile/orders/${order.slug}`}>
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4 mr-1" />
      View
    </Button>
  </Link>
</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredOrders.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;