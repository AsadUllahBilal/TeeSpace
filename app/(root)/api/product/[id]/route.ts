import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import Product from '@/models/Product';
import Category from '@/models/Category';
import connectDB from '@/lib/mongo';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to parse form data
async function parseFormData(request: NextRequest) {
  const formData = await request.formData();
  const entries = Array.from(formData.entries());
  
  const fields: Record<string, any> = {};
  const files: File[] = [];
  
  for (const [key, value] of entries) {
    if (value instanceof File) {
      // Only add files that have content (size > 0)
      if (value.size > 0) {
        files.push(value);
      }
    } else {
      if (fields[key]) {
        if (Array.isArray(fields[key])) {
          fields[key].push(value);
        } else {
          fields[key] = [fields[key], value];
        }
      } else {
        fields[key] = value;
      }
    }
  }
  
  return { fields, files };
}

// Helper function to upload file to Cloudinary
async function uploadToCloudinary(file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    // Create a temporary file with a unique name to avoid conflicts
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`;
    const tempPath = path.join(tempDir, uniqueFileName);
    
    await writeFile(tempPath, buffer);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempPath, {
      folder: 'products',
    });
    
    // Clean up temporary file
    try {
      await unlink(tempPath);
    } catch (error) {
      console.warn('Could not delete temporary file:', error);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const { fields, files } = await parseFormData(request);

    // Extract form data
    const title = fields.title || '';
    const description = fields.description || '';
    const price = parseFloat(fields.price?.toString() || '0');
    const category = fields.category || '';
    const colors = typeof fields.colors === 'string' ? JSON.parse(fields.colors) : [];
    const sizes = typeof fields.sizes === 'string' ? JSON.parse(fields.sizes) : [];
    const stockQuantity = parseInt(fields.stockQuantity?.toString() || '0');
    
    // Get images to keep and delete
    const keepImages = Array.isArray(fields.keepImages) 
      ? fields.keepImages 
      : fields.keepImages ? [fields.keepImages] : [];
    
    const deletedImages = typeof fields.deletedImages === 'string' 
      ? JSON.parse(fields.deletedImages) 
      : [];

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Handle image deletions
    let updatedImages = product.images.filter((img: string) => 
      keepImages.includes(img) && !deletedImages.includes(img)
    );

    // Handle new image uploads
    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        try {
          return await uploadToCloudinary(file);
        } catch (error) {
          console.error('Error uploading image:', error);
          return null;
        }
      });

      const newImageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    // Generate new slug if title has changed
    let updateData: any = {
      title,
      description,
      price,
      category,
      colors,
      sizes,
      stockQuantity,
      images: updatedImages,
    };

    // If title has changed, generate new slug
    if (product.title !== title) {
      const { generateSlug } = await import('@/lib/slug');
      let baseSlug = generateSlug(title);
      let slug = baseSlug;
      let counter = 1;
      
      // Check if slug already exists (excluding current product)
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updateData.slug = slug;
    }

    // Update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    ).populate('category');

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Ensure Category model is registered
    Category;
    
    const product = await Product.findById(id).populate('category');
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}