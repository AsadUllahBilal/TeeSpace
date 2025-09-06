"use client";

import HomeClient from "@/components/HomeClient";
import { IProduct } from "@/types";
import { useState, useEffect } from "react";

// Move to client-side rendering to avoid SSR issues on Vercel
export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Client-side: Fetching products from /api/products/home');
        const response = await fetch('/api/products/home?page=1&limit=8&randomize=true', {
          cache: 'no-store',
        });
        
        console.log('Client API Response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Client: Products fetched successfully:', data.products?.length || 0);
          setProducts(data.products || []);
          setHasMore(data.pagination?.hasMore || false);
        } else {
          console.error('Client API response not OK:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Client Error response body:', errorText);
        }
      } catch (error) {
        console.error('Client: Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <HomeClient 
      initialProducts={products} 
      hasMore={hasMore} 
    />
  );
}
