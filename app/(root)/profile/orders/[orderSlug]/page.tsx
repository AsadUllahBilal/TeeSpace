// pages/orders/[orderSlug].tsx
"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import PageBanner from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle,
  DollarSign,
  CreditCard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

// Define order type
type OrderType = {
  _id: string;
  createdAt: string;
  status: string;
  total: number;
  fullName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city?: string;
  state: string;
  country: string;
  postalCode: string;
  paymentMethod: string;
  paymentStatus: string;
  items: { 
    title: string; 
    quantity: number; 
    price: number;
    image: string;
  }[];
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
};

// Status steps for progress indicator
const statusSteps = [
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
];

const OrderDetailsPage: React.FC = () => {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const orderSlug = params.orderSlug as string;
  
  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderSlug) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderSlug}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Order not found');
          }
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || 'Failed to load order');
        }
        
        const data = await res.json();
        setOrder(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to load order';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderSlug]);

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="w-full h-[200px] px-10 py-10">
          <Skeleton className="w-full h-[200px] bg-gray-200 rounded-xl" />
        </div>
        <div className="w-full px-10 py-10 mt-10">
          <Skeleton className="w-40 h-8 mb-6 bg-gray-200 rounded-md" />
          <Skeleton className="w-full h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-full">
        <PageBanner bannerName="Order Details" />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400 my-8">
            Please Login to view order details.{" "}
            <Link href="/sign-in">
              <span className="text-primary-green">Login</span>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner bannerName="Order Details" />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load order</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/orders')}>Return to Orders</Button>
          </div>
        ) : order ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="border-b p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-gray-500 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge variant={getStatusVariant(order.status)} className="text-sm capitalize px-3 py-1">
                  {order.status}
                </Badge>
              </div>
            </div>

            {/* Progress Indicator */}
            {order.status !== "cancelled" && (
              <div className="border-b p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="flex justify-between mb-2">
                    {statusSteps.map((step, index) => {
                      const StatusIcon = step.icon;
                      const currentIndex = getStatusIndex(order.status);
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      
                      return (
                        <div 
                          key={step.key} 
                          className={`flex flex-col items-center ${index < statusSteps.length - 1 ? 'flex-1' : ''}`}
                        >
                          <div className={`
                            rounded-full p-2 mb-2
                            ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                            ${isCurrent ? 'bg-blue-100 text-blue-600' : ''}
                            ${index > currentIndex ? 'bg-gray-100 text-gray-400' : ''}
                          `}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <p className={`text-xs font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <Progress 
                    value={(getStatusIndex(order.status) + 1) * (100 / statusSteps.length)} 
                    className="h-2" 
                  />
                </div>
                
                {order.trackingNumber && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
                    </p>
                    {order.estimatedDelivery && (
                      <p className="text-sm text-gray-600 mt-1">
                        Estimated Delivery: {formatDate(order.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </h3>
                
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center border rounded-lg p-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.title}
                            className="h-12 w-12 object-contain"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between py-2">
                    <span>Subtotal</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Tax</span>
                    <span>${(order.total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4" />
                      {(order.total * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping and Payment Info */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{order.fullName} {order.lastName}</p>
                    <p>{order.streetAddress}</p>
                    <p>
                      {order.city && `${order.city}, `}
                      {order.state} {order.postalCode}
                    </p>
                    <p>{order.country}</p>
                    {order.phone && <p className="mt-2">Phone: {order.phone}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Method</span>
                      <span className="font-medium capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge 
                        variant={order.paymentStatus === 'paid' ? 'success' : 'outline'} 
                        className="capitalize"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {order.shippingMethod && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Shipping Method</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium capitalize">{order.shippingMethod}</p>
                      <p className="text-sm text-gray-600 mt-1">Usually delivers in 3-5 business days</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderDetailsPage;