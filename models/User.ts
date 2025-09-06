/**
 * User MongoDB Model
 * 
 * This file defines the Mongoose schema and model for users in MongoDB.
 * It includes validation and ensures data consistency.
 */

import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType } from '@/types/user';

// Extend the User interface to include Mongoose Document properties
export interface UserDocument extends UserType, Document {}

// Define the User schema
const UserSchema: Schema = new Schema(
  {
    // Clerk user ID - unique identifier from Clerk
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      index: true,
    },
    // User's email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    // Username - must be unique
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },
    // User's full name
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    // User's role in the system
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be one of: admin, user, moderator, guest',
      },
      default: 'user',
    },
    // Avatar URL from Cloudinary
    avatarUrl: {
      type: String,
      trim: true,
      default: "https://images.unsplash.com/photo-1663006676452-aa5213bd068e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHByb2ZpbGUlMjBpY29uJTIwcGljc3xlbnwwfHwwfHx8MA%3D%3D"
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);