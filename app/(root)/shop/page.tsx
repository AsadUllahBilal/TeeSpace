"use client";

import PageBanner from "@/components/PageBanner";
import { IProduct, ICategory } from "@/types";
import ShopClient from "@/components/ShopClient";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Shop content component that uses useSearchParams
function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, hasMore: false });
  const [loading, setLoading] = useState(true);

  // Convert search params to object
  const searchParamsObj = {
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    min_price: searchParams.get('min_price') || undefined,
    max_price: searchParams.get('max_price') || undefined,
    color: searchParams.get('color') || undefined,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build query params for the API
        const apiParams = new URLSearchParams();
        
        if (searchParamsObj.page) apiParams.set('page', searchParamsObj.page);
        if (searchParamsObj.limit) apiParams.set('limit', searchParamsObj.limit);
        if (searchParamsObj.search) apiParams.set('search', searchParamsObj.search);
        if (searchParamsObj.category) apiParams.set('category', searchParamsObj.category);
        if (searchParamsObj.min_price) apiParams.set('min_price', searchParamsObj.min_price);
        if (searchParamsObj.max_price) apiParams.set('max_price', searchParamsObj.max_price);
        if (searchParamsObj.color) apiParams.set('color', searchParamsObj.color);
        
        // For shop page, we want randomization on initial load (page 1)
        const page = parseInt(searchParamsObj.page || "1");
        if (page === 1 && !searchParamsObj.search && !searchParamsObj.category && !searchParamsObj.min_price && !searchParamsObj.max_price && !searchParamsObj.color) {
          apiParams.set('randomize', 'true');
        }
        
        // Fetch products
        console.log('Shop: Client-side fetching products from /api/products/shop');
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/shop?${apiParams.toString()}`, { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' })
        ]);
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          console.log('Shop: Client products fetched successfully:', productsData.products?.length || 0);
          setProducts(productsData.products || []);
          setPagination(productsData.pagination || { total: 0, totalPages: 0, hasMore: false });
        } else {
          console.error('Shop: Client API response not OK:', productsRes.status);
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }
        
        // Mock colors for now (you can fetch from API later)
        setAvailableColors(['Black', 'White', 'Red', 'Blue', 'Green', 'Gray']);
        
      } catch (error) {
        console.error('Shop: Client failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="w-full min-h-screen">
        <PageBanner bannerName="Shop" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full">
      <PageBanner bannerName="Shop" />
      <ShopClient 
        initialProducts={products} 
        currentPage={parseInt(searchParamsObj.page || "1")}
        totalPages={pagination.totalPages}
        totalProducts={pagination.total}
        searchParams={searchParamsObj}
        categories={categories}
        availableColors={availableColors}
        hasMore={pagination.hasMore}
      />
    </div>
  );
}

// Loading component
function ShopLoading() {
  return (
    <div className="w-full min-h-screen">
      <PageBanner bannerName="Shop" />
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shop...</p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
