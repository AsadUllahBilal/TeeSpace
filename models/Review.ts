import mongoose, { Schema, Document, Model } from "mongoose";
import { IReview } from "@/types";

export interface IReviewDocument extends IReview, Document {}

const ReviewSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema);