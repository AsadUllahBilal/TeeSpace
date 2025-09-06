"use client";

import ProductDetails from "@/components/ProductDetails";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Client: Fetching product with slug:', slug);
        
        // Use the correct API endpoint format
        const res = await fetch(`/api/products/${slug}`, {
          cache: "no-store",
        });

        console.log('Client: Response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Client: API response:', data);
          
          if (data.success && data.data) {
            setProduct(data.data);
          } else {
            setError('Product not found');
          }
        } else {
          console.error('Client: Failed to fetch product:', res.status, res.statusText);
          setError('Failed to load product');
        }
      } catch (error) {
        console.error('Client: Error fetching product:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">The product with slug "{slug}" could not be found.</p>
          <p className="text-sm text-gray-500">
            This might be due to:
          </p>
          <ul className="text-sm text-gray-500 mt-2 list-disc list-inside">
            <li>The product URL is incorrect</li>
            <li>The product has been removed</li>
            <li>There's a temporary server issue</li>
          </ul>
          <Link href="/shop" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-10">
      <ProductDetails product={product} />
    </div>
  );
}
