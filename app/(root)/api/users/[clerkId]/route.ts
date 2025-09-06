/**
 * Individual User API Routes - /api/users/[clerkId]
 * 
 * Handles GET, PUT, and DELETE operations for individual users.
 * Requires authentication and validates user ownership.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import User from '@/models/User';
import { UpdateUserData } from '@/types/user';

interface RouteParams {
  params: {
    clerkId: string;
  };
}

/**
 * GET /api/users/[clerkId] - Get user by Clerk ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Users can only access their own data
    if (userId !== params.clerkId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: params.clerkId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (excluding sensitive information)
    const userData = {
      clerkId: user.clerkId,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[clerkId] - Update user by Clerk ID
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Users can only update their own data
    if (userId !== params.clerkId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Parse request body
    const body: UpdateUserData = await request.json();
    const { username, fullName, avatarUrl } = body;

    // Validate at least one field is provided
    if (!username && !fullName && avatarUrl === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: params.clerkId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for unique constraints if username is being updated
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ 
        username, 
        clerkId: { $ne: params.clerkId } 
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    // Update user fields
    const updateData: any = {};
    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: params.clerkId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Return updated user data
    const userData = {
      clerkId: updatedUser.clerkId,
      email: updatedUser.email,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Error updating user:', error);

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[clerkId] - Delete user by Clerk ID
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Users can only delete their own data
    if (userId !== params.clerkId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete Clerk user account first (this will also trigger webhook user.deleted)
    await clerkClient.users.deleteUser(params.clerkId);

    // Best-effort delete in MongoDB in case webhook is delayed or not configured
    try {
      await connectDB();
      await User.findOneAndDelete({ clerkId: params.clerkId });
    } catch (dbErr) {
      console.error('Best-effort DB deletion failed after Clerk deletion:', dbErr);
    }

    return NextResponse.json({ message: 'User deleted from Clerk and DB' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}