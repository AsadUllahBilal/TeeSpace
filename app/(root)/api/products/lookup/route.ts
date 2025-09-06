import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/productService';
import connectDB from '@/lib/mongo';
import { isValidSlug } from '@/lib/slug';

/**
 * Universal product lookup API that can handle both ID and slug
 * GET /api/products/lookup?id=123 or GET /api/products/lookup?slug=product-name
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    
    if (!id && !slug) {
      return NextResponse.json(
        { success: false, error: 'Either id or slug parameter is required' },
        { status: 400 }
      );
    }
    
    let product;
    
    if (id) {
      // Lookup by ID using ProductService
      product = await ProductService.getById(id);
    } else if (slug) {
      // Validate slug format first
      if (!isValidSlug(slug)) {
        return NextResponse.json(
          { success: false, error: 'Invalid slug format' },
          { status: 400 }
        );
      }
      // Lookup by slug using ProductService (ID-based internally)
      product = await ProductService.getBySlug(slug);
    }
    
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
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
