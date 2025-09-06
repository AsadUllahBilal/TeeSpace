import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Order from '@/models/Order';
import crypto from 'crypto';

// Function to generate a secure slug from order ID
function generateOrderSlug(orderId: string): string {
  return crypto
    .createHash('sha256')
    .update(orderId + process.env.SLUG_SECRET || 'fallback-secret')
    .digest('hex')
    .substring(0, 12);
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      fullName,
      lastName,
      phoneNumber,
      email,
      country,
      state,
      city,
      postalCode,
      streetAddress,
      items,
      subtotal,
      total,
    } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await connectDB();

    // Create order first to get the ID
    const newOrder = await Order.create({
      clerkId: userId,
      fullName,
      lastName,
      phoneNumber,
      email,
      country,
      state,
      city,
      postalCode,
      streetAddress,
      items,
      subtotal,
      total,
    });

    // Generate slug for the new order
    const slug = generateOrderSlug(newOrder._id.toString());
    
    // Update the order with the slug
    const updatedOrder = await Order.findByIdAndUpdate(
      newOrder._id,
      { slug },
      { new: true }
    );

    return NextResponse.json(updatedOrder, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const orders = await Order.find({ clerkId: userId }).sort({ createdAt: -1 }).lean();
    
    // Add slugs to orders and remove _id for security
    const ordersWithSlugs = orders.map(order => {
      const slug = order.slug || generateOrderSlug(order._id.toString());
      const { _id: orderId, ...orderWithoutId } = order;
      return {
        ...orderWithoutId,
        slug,
        id: orderId.toString() // Keep id for internal reference if needed
      };
    });

    return NextResponse.json(ordersWithSlugs);
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}