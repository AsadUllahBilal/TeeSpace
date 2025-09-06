/**
 * Clerk Webhook Handler - POST /api/webhooks/clerk
 * 
 * Handles Clerk webhook events to synchronize user data with MongoDB.
 * Supports user.created, user.updated, and user.deleted events.
 * Includes avatar URL synchronization for OAuth providers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongo';
import User from '@/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET to your environment variables');
}

export async function POST(request: NextRequest) {
  try {
    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);

    let evt: any;

    // Verify the webhook
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Handle the webhook event
    const eventType = evt.type;
    const userData = evt.data;

    console.log(`Received webhook event: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(userData);
        break;
      case 'user.updated':
        await handleUserUpdated(userData);
        break;
      case 'user.deleted':
        await handleUserDeleted(userData);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle user.created webhook event
 */
async function handleUserCreated(userData: any) {
  try {
    const { 
      id: clerkId, 
      email_addresses, 
      username, 
      first_name, 
      last_name,
      image_url,
      profile_image_url 
    } = userData;

    // Extract primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error('No email found for user:', clerkId);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      console.log('User already exists in MongoDB:', clerkId);
      return;
    }

    // Extract avatar URL (prefer profile_image_url over image_url)
    const avatarUrl = profile_image_url || image_url || '';

    // Create user in MongoDB
    const newUser = new User({
      clerkId,
      email: email.toLowerCase(),
      username: username || email.split('@')[0],
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User',
      role: 'user', // Default role
      avatarUrl: avatarUrl,
    });

    await newUser.save();
    console.log('User created in MongoDB:', clerkId, 'with avatar:', avatarUrl ? 'Yes' : 'No');
  } catch (error) {
    console.error('Error creating user in MongoDB:', error);
  }
}

/**
 * Handle user.updated webhook event
 */
async function handleUserUpdated(userData: any) {
  try {
    const { 
      id: clerkId, 
      email_addresses, 
      username, 
      first_name, 
      last_name,
      image_url,
      profile_image_url 
    } = userData;

    // Extract primary email
    const primaryEmail = email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error('No email found for user:', clerkId);
      return;
    }

    // Extract avatar URL (prefer profile_image_url over image_url)
    const avatarUrl = profile_image_url || image_url || '';

    // Update user in MongoDB
    const updateData: any = {
      email: email.toLowerCase(),
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User',
    };

    if (username) {
      updateData.username = username;
    }

    // Only update avatar if it's provided and different from current
    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true, upsert: false }
    );

    if (updatedUser) {
      console.log('User updated in MongoDB:', clerkId, 'avatar updated:', avatarUrl ? 'Yes' : 'No');
    } else {
      console.log('User not found in MongoDB for update:', clerkId);
    }
  } catch (error) {
    console.error('Error updating user in MongoDB:', error);
  }
}

/**
 * Handle user.deleted webhook event
 */
async function handleUserDeleted(userData: any) {
  try {
    const { id: clerkId } = userData;

    // Delete user from MongoDB
    const deletedUser = await User.findOneAndDelete({ clerkId });

    if (deletedUser) {
      console.log('User deleted from MongoDB:', clerkId);
      
      // TODO: Optionally delete avatar from Cloudinary if it was uploaded there
      // This would require storing the Cloudinary public_id in the user record
      // and calling deleteFromCloudinary(publicId) here
    } else {
      console.log('User not found in MongoDB for deletion:', clerkId);
    }
  } catch (error) {
    console.error('Error deleting user from MongoDB:', error);
  }
}