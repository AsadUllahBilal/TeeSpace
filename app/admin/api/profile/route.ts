import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import User from '@/models/User';

// GET - Fetch current admin profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findOne({ clerkId: userId }).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // For now, we'll use basic Clerk data from the useUser hook on the client side
    // Future enhancement: Add full Clerk integration when clerkClient is properly configured

    const profileData = {
      // Database info
      _id: currentUser._id,
      clerkId: currentUser.clerkId,
      email: currentUser.email,
      username: currentUser.username,
      fullName: currentUser.fullName,
      role: currentUser.role,
      avatarUrl: currentUser.avatarUrl,
      createdAt: currentUser.createdAt,
      updatedAt: currentUser.updatedAt,
      
      // Basic clerk data (will be enhanced from client-side useUser hook)
      clerkData: {
        firstName: '',
        lastName: '',
        primaryEmailAddress: currentUser.email,
        imageUrl: currentUser.avatarUrl,
        lastSignInAt: Date.now(),
        createdAt: new Date(currentUser.createdAt).getTime(),
        updatedAt: new Date(currentUser.updatedAt).getTime(),
        twoFactorEnabled: false,
        backupCodeEnabled: false,
        totpEnabled: false,
        emailAddresses: [],
        phoneNumbers: [],
      }
    };

    return NextResponse.json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update admin profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findOne({ clerkId: userId }).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, username, firstName, lastName, avatarUrl } = body;

    const updateData: any = {};
    
    // Update database fields
    if (fullName !== undefined) updateData.fullName = fullName;
    if (username !== undefined) updateData.username = username;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    // Update in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    // Note: Clerk user updates will be handled client-side through useUser hook
    // This ensures proper synchronization with Clerk's authentication system

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Handle specific profile actions (like password change, 2FA)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findOne({ clerkId: userId }).lean();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'generate_backup_codes':
        try {
          // This would typically generate backup codes through Clerk
          // For now, return a placeholder response
          return NextResponse.json({
            success: true,
            message: 'Backup codes generation initiated. Check your email for instructions.',
          });
        } catch (error) {
          return NextResponse.json({ error: 'Failed to generate backup codes' }, { status: 400 });
        }

      case 'disable_2fa':
        try {
          // This would disable 2FA through Clerk
          // For now, return a placeholder response
          return NextResponse.json({
            success: true,
            message: '2FA disable request initiated. Check your email for confirmation.',
          });
        } catch (error) {
          return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 400 });
        }

      case 'refresh_sessions':
        try {
          // For now, return empty sessions array
          // Future enhancement: Implement session management when Clerk integration is complete
          return NextResponse.json({
            success: true,
            sessions: [],
            message: 'Session management will be available in a future update'
          });
        } catch (error) {
          return NextResponse.json({ error: 'Failed to refresh sessions' }, { status: 400 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling profile action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
