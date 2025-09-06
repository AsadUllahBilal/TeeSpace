import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Contact from '@/models/Contact';
import mongoose from 'mongoose';

// GET - Get single contact message (admin only)
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
        { error: 'Invalid message ID' }, 
        { status: 400 }
      );
    }

    await connectDB();

    const message = await Contact.findById(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Get contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' }, 
      { status: 500 }
    );
  }
}

// PUT - Update contact message status/notes (admin only)
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
        { error: 'Invalid message ID' }, 
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, adminNotes, repliedBy } = body || {};

    const updateData: any = {};
    
    if (status && ['new', 'read', 'replied'].includes(status)) {
      updateData.status = status;
      if (status === 'replied') {
        updateData.repliedAt = new Date();
        if (repliedBy) {
          updateData.repliedBy = repliedBy;
        }
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes.trim();
    }

    await connectDB();

    const updatedMessage = await Contact.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Message not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Update contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to update message' }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete contact message (admin only)
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
        { error: 'Invalid message ID' }, 
        { status: 400 }
      );
    }

    await connectDB();

    const deletedMessage = await Contact.findByIdAndDelete(id);
    if (!deletedMessage) {
      return NextResponse.json(
        { error: 'Message not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Message deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' }, 
      { status: 500 }
    );
  }
}
