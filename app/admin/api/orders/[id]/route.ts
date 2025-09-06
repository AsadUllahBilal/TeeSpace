import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// GET - Get single order (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' }, 
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' }, 
      { status: 500 }
    );
  }
}

// PUT - Update order status and details (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' }, 
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, trackingNumber, notes } = body || {};

    const updateData: any = {};
    
    // Validate status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (status && validStatuses.includes(status)) {
      updateData.status = status;
    }

    // Add tracking number for shipped orders
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber.trim();
    }

    // Add admin notes if provided
    if (notes !== undefined) {
      updateData.adminNotes = notes.trim();
    }

    await connectDB();

    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete order (admin only) - Use with caution
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid order ID' }, 
        { status: 400 }
      );
    }

    await connectDB();

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return NextResponse.json(
        { error: 'Order not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Order deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' }, 
      { status: 500 }
    );
  }
}
