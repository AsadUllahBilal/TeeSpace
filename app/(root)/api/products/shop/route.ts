import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const color = searchParams.get('color') || '';
    const randomize = searchParams.get('randomize') === 'true'; // New parameter for randomization

    // Build match query for aggregation
    let matchQuery: any = {};

    // Search query
    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        matchQuery.category = categoryDoc._id;
      }
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      matchQuery.price = {};
      if (minPrice !== undefined) matchQuery.price.$gte = minPrice;
      if (maxPrice !== undefined) matchQuery.price.$lte = maxPrice;
    }

    // Color filter
    if (color) {
      matchQuery.colors = { $in: [color] };
    }

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(matchQuery);

    // Build aggregation pipeline
    let pipeline: any[] = [
      { $match: matchQuery }
    ];

    // Add randomization if requested (for initial load or refresh)
    if (randomize && page === 1) {
      pipeline.push({ $sample: { size: Math.min(totalProducts, 1000) } }); // Sample up to 1000 products
    } else {
      pipeline.push({ $sort: { createdAt: -1 } }); // Default sort
    }

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Add category lookup
    pipeline.push(
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
    );

    const products = await Product.aggregate(pipeline);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limit);
    const hasMore = skip + limit < totalProducts;

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
    console.error('Shop products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
