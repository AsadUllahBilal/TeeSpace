// app/shop/page.tsx
import PageBanner from "@/components/PageBanner";
import { Metadata } from "next";
import connectDB from "@/lib/mongo";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { IProduct, ICategory } from "@/types";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop - Our Store",
  description: "Browse our amazing collection of products with various sizes and colors.",
  keywords: "shop, products, ecommerce, buy online",
};

interface ShopPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    color?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  await connectDB();
  
  // Build query params for the API
  const apiParams = new URLSearchParams();
  
  if (searchParams.page) apiParams.set('page', searchParams.page);
  if (searchParams.limit) apiParams.set('limit', searchParams.limit);
  if (searchParams.search) apiParams.set('search', searchParams.search);
  if (searchParams.category) apiParams.set('category', searchParams.category);
  if (searchParams.min_price) apiParams.set('min_price', searchParams.min_price);
  if (searchParams.max_price) apiParams.set('max_price', searchParams.max_price);
  if (searchParams.color) apiParams.set('color', searchParams.color);
  
  // For shop page, we want randomization on initial load (page 1)
  const page = parseInt(searchParams.page || "1");
  if (page === 1 && !searchParams.search && !searchParams.category && !searchParams.min_price && !searchParams.max_price && !searchParams.color) {
    apiParams.set('randomize', 'true');
  }
  
  // Fetch products from our new API
  // Use dynamic URL construction for Vercel deployment
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  let productsData = [];
  let paginationData = { total: 0, totalPages: 0, hasMore: false };
  
  try {
    console.log('Shop: Fetching products from:', `${baseUrl}/api/products/shop?${apiParams.toString()}`);
    const response = await fetch(`${baseUrl}/api/products/shop?${apiParams.toString()}`, {
      cache: 'no-store', // Ensure fresh data for SSR
    });
    
    console.log('Shop API Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Shop: Products fetched successfully:', data.products?.length || 0);
      productsData = data.products || [];
      paginationData = data.pagination || { total: 0, totalPages: 0, hasMore: false };
    } else {
      console.error('Shop API response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Shop Error response body:', errorText);
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Continue with empty products - component will handle gracefully
  }
  
  const totalProducts = paginationData.total;
  const totalPages = paginationData.totalPages;
  const hasMore = paginationData.hasMore;

  // Get all categories for filter sidebar
  const allCategories = await Category.find({}).sort({ name: 1 }).lean();
  const categoriesData: ICategory[] = JSON.parse(JSON.stringify(allCategories));

  // Get unique colors for filter
  const colorResults = await Product.aggregate([
    { $unwind: "$colors" },
    { $group: { _id: "$colors" } },
    { $sort: { _id: 1 } }
  ]);
  const availableColors = colorResults.map(c => c._id);

  // Convert to plain objects for Next.js serialization
  const products: IProduct[] = JSON.parse(JSON.stringify(productsData));

  return (
    <div className="w-full min-h-full">
      <PageBanner bannerName="Shop" />
      <ShopClient 
        initialProducts={products} 
        currentPage={page}
        totalPages={totalPages}
        totalProducts={totalProducts}
        searchParams={searchParams}
        categories={categoriesData}
        availableColors={availableColors}
        hasMore={hasMore}
      />
    </div>
  );
}