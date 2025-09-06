export interface User {
  _id?: string;
  clerkId: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserData {
  clerkId: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
}

export interface UpdateUserData {
  username?: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string;
}

export type UserRole = 'admin' | 'user' | 'moderator' | 'guest';