import mongoose, { Schema, Document } from 'mongoose';

export interface ContactDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminNotes?: string;
  repliedAt?: Date;
  repliedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<ContactDocument>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    },
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    subject: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },
    message: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 2000
    },
    status: { 
      type: String, 
      enum: ['new', 'read', 'replied'], 
      default: 'new' 
    },
    adminNotes: { 
      type: String, 
      trim: true,
      maxlength: 1000
    },
    repliedAt: { type: Date },
    repliedBy: { type: String }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient querying
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ createdAt: -1 });

export default mongoose.models.Contact || mongoose.model<ContactDocument>('Contact', ContactSchema);
