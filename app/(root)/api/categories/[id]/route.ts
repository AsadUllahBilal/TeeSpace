import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Category from '@/models/Category';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description } = body;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Generate new slug if name changed
    let slug = category.slug;
    if (name && name !== category.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description, slug },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category is being used by any products
    const Product = await import('@/models/Product').then(mod => mod.default);
    const productsCount = await Product.countDocuments({ category: id });
    
    if (productsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. It is being used by ${productsCount} product(s).` 
        },
        { status: 400 }
      );
    }
    
    await Category.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}