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
    console.log('Fetching products from:', `${baseUrl}/api/products/home?page=1&limit=8&randomize=true`);
    const response = await fetch(`${baseUrl}/api/products/home?page=1&limit=8&randomize=true`, {
      cache: 'no-store', // Ensure fresh randomized data on each visit
    });
    
    console.log('API Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Products fetched successfully:', data.products?.length || 0);
      products = data.products || [];
      hasMore = data.pagination?.hasMore || false;
    } else {
      console.error('API response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
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
