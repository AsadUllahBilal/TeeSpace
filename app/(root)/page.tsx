import HomeClient from "@/components/HomeClient";
import { IProduct } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - TeeSpace",
  description: "Discover stylish, high-quality t-shirts designed for comfort and confidence. From casual classics to trendy designs, we've got your perfect fit.",
  keywords: "t-shirts, fashion, clothing, ecommerce, custom designs",
};

export default async function Home() {
  // Fetch initial products from our API with randomization
  // Use dynamic URL construction for Vercel deployment
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  let products: IProduct[] = [];
  let hasMore = false;
  
  try {
    const response = await fetch(`${baseUrl}/api/products/home?page=1&limit=8&randomize=true`, {
      cache: 'no-store', // Ensure fresh randomized data on each visit
    });
    
    if (response.ok) {
      const data = await response.json();
      products = data.products;
      hasMore = data.pagination.hasMore;
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Continue with empty products array - component will handle gracefully
  }

  return (
    <HomeClient 
      initialProducts={products} 
      hasMore={hasMore} 
    />
  );
}
