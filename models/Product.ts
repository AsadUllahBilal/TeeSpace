import mongoose, { Model, Schema } from 'mongoose';
import { IProduct } from '@/types';
import { generateSlug } from '@/lib/slug';

export interface IProductDocument extends IProduct, Document {}

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  stockQuantity: { type: Number, required: true },
  images: [{ type: String }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  slug: { type: String, unique: true, sparse: true }
}, {
  timestamps: true
});

// Create indexes for better performance (slug index is already created by unique: true)
ProductSchema.index({ category: 1 }); // Index for category filtering
ProductSchema.index({ title: 'text', description: 'text' }); // Text index for search
ProductSchema.index({ price: 1 }); // Index for price filtering
ProductSchema.index({ createdAt: -1 }); // Index for sorting by creation date

// Generate slug before saving
ProductSchema.pre('save', async function(next) {
  try {
    // Always generate slug if it doesn't exist or if title has changed
    if (!this.slug || this.isModified('title') || this.isNew) {
      // Ensure we have a title to generate slug from
      if (!this.title) {
        return next(new Error('Title is required to generate slug'));
      }
      
      let baseSlug = generateSlug(this.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Check if slug already exists
      while (await mongoose.models.Product?.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      this.slug = slug;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);