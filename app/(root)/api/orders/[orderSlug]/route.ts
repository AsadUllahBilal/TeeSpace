// app/api/orders/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Order from '@/models/Order';
import crypto from 'crypto';

// Function to generate a secure slug from order ID (same as above)
function generateOrderSlug(orderId: string): string {
  return crypto
    .createHash('sha256')
    .update(orderId + process.env.SLUG_SECRET || 'fallback-secret')
    .digest('hex')
    .substring(0, 12);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orderSlug: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderSlug: slug } = params;
    
    await connectDB();
    
    // First try to find by slug
    let order = await Order.findOne({ slug, clerkId: userId }).lean();
    
    // If not found by slug, try to find by ID (for backward compatibility)
    if (!order) {
      // Get all user's orders and find the one with matching generated slug
      const userOrders = await Order.find({ clerkId: userId }).lean();
      order = userOrders.find(o => 
        generateOrderSlug(o._id.toString()) === slug
      );
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Return order without exposing internal MongoDB _id
    const { _id: orderId, ...orderWithoutId } = order;
    return NextResponse.json({
      ...orderWithoutId,
      slug: order.slug || generateOrderSlug(orderId.toString())
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}