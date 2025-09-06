import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Product from '@/models/Product';
import Category from '@/models/Category'; // Import to ensure Category model is registered

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    const skip = (page - 1) * limit;

    // Get total count first
    const totalProducts = await Product.countDocuments({});
    
    // Use aggregation pipeline to randomize results
    const products = await Product.aggregate([
      { $sample: { size: Math.min(totalProducts, skip + limit) } }, // Sample more than needed
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryInfo.name', 0] }
        }
      },
      {
        $project: {
          categoryInfo: 0 // Remove the categoryInfo array, keep categoryName
        }
      }
    ]);

    // Calculate if there are more products available
    const hasMore = skip + limit < totalProducts;
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages,
        hasMore,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Home products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
