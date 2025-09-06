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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/products/shop?${apiParams.toString()}`, {
    cache: 'no-store', // Ensure fresh data for SSR
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  const products = data.products;
  const pagination = data.pagination;
  
  const totalProducts = pagination.total;
  const totalPages = pagination.totalPages;
  const hasMore = pagination.hasMore;

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
  const productsData: IProduct[] = JSON.parse(JSON.stringify(products));

  return (
    <div className="w-full min-h-full">
      <PageBanner bannerName="Shop" />
      <ShopClient 
        initialProducts={productsData} 
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