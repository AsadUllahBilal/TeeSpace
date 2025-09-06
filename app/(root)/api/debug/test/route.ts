import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await connectDB();
    
    // Get basic stats
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    
    // Get a few sample products
    const sampleProducts = await Product.find({}).limit(3).populate('category');
    
    // Get environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      DATABASE_CONNECTED: true,
      MONGODB_URI_EXISTS: !!process.env.MONGODB_URI,
    };

    return NextResponse.json({
      success: true,
      message: 'Database connection and data test',
      data: {
        environment: envInfo,
        counts: {
          products: productCount,
          categories: categoryCount,
        },
        sampleProducts: sampleProducts.map(p => ({
          id: p._id,
          title: p.title,
          price: p.price,
          category: p.category?.name || 'No category',
        })),
      },
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
