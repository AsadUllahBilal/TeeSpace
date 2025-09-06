import ProductDetails from "@/components/ProductDetails";
import React from "react";

async function getProduct(slug: string) {
  try {
    console.log('Fetching product with slug:', slug);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${slug}`, {
      cache: "no-store", // SSR
    });

    console.log('Response status:', res.status);
    
    if (!res.ok) {
      console.error('Failed to fetch product:', res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    console.log('API response:', data);
    
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error in getProduct:', error);
    return null;
  }
}

async function getProductFallback(slug: string) {
  try {
    // Try the lookup API as fallback
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/lookup?slug=${slug}`, {
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error in fallback product fetch:', error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  console.log('ProductPage - Processing slug:', slug);
  
  let product = await getProduct(slug);
  
  // If primary method failed, try fallback
  if (!product) {
    console.log('Primary fetch failed, trying fallback...');
    product = await getProductFallback(slug);
  }

  if (!product) {
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
          <a href="/shop" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Back to Shop
          </a>
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
