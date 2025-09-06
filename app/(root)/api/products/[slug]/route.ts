import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/productService';
import connectDB from '@/lib/mongo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    // Await params in Next.js 15
    const { slug } = await params;
    
    // Use ProductService for reliable slug lookup
    const product = await ProductService.getBySlug(slug);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by slug:', slug, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}