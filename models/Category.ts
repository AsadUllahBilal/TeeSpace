import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from '@/types';

export interface ICategoryDocument extends ICategory, Document {}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);