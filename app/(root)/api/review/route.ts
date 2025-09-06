import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Product from '@/models/Product';
import Review from '@/models/Review';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, reviewerName, rating, comment } = body;
    
    if (!productId || !reviewerName || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Insert review
    const review = new Review({
      productId,
      reviewerName,
      rating: Number(rating),
      comment: comment || ''
    });
    
    const savedReview = await review.save();
    
    // Calculate new average rating and review count
    const reviews = await Review.find({ productId }).lean();
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal
    const reviewCount = reviews.length;
    
    // Update product
    await Product.findByIdAndUpdate(
      productId,
      { 
        averageRating,
        reviewCount,
        updatedAt: new Date()
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      data: {
        reviewId: savedReview._id.toString(),
        averageRating,
        reviewCount
      }
    });
  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const reviews = await Review
      .find({ productId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Convert ObjectId to string
    const reviewsWithStringId = reviews.map((review: any) => ({
      ...review,
      _id: (review._id as { toString: () => string }).toString(),
      productId: (review.productId as { toString: () => string }).toString()
    }));
    
    return NextResponse.json({
      success: true,
      data: reviewsWithStringId
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}