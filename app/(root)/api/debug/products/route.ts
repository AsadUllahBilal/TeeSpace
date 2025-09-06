import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/productService';
import connectDB from '@/lib/mongo';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get products to see their slugs
    const result = await ProductService.getAll({ limit, page: 1 });
    
    const debug_info = {
      total_products: result.pagination.total,
      products: result.products.map(p => ({
        id: p._id,
        title: p.title,
        slug: p.slug,
        category: p.category
      }))
    };
    
    return NextResponse.json({
      success: true,
      debug: debug_info
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { success: false, error: 'Debug API failed' },
      { status: 500 }
    );
  }
}
