import mongoose, { Schema, Document } from 'mongoose';
import { string } from 'zod';

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderDocument extends Document {
  clerkId: string;
  fullName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  country: string;
  state: string;
  city?: string;
  postalCode: string;
  streetAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  slug?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    clerkId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    lastName: { type: String, default: "" },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String },
    postalCode: { type: String, required: true },
    slug: {type: String, sparse: true, unique: true},
    streetAddress: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true, default: [] },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    trackingNumber: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);


