import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const productCount = await Product.countDocuments({});
    const categoryCount = await Category.countDocuments({});
    
    const sampleProducts = await Product.find({}).limit(5).populate('category');
    const sampleCategories = await Category.find({}).limit(5);
    
    return NextResponse.json({
      success: true,
      data: {
        counts: {
          products: productCount,
          categories: categoryCount,
        },
        sampleProducts: sampleProducts.map(p => ({
          id: p._id,
          title: p.title,
          price: p.price,
          slug: p.slug,
          category: p.category,
          images: p.images,
        })),
        sampleCategories: sampleCategories.map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Create categories first
    const categories = [
      {
        name: 'Men\'s T-Shirts',
        description: 'Comfortable and stylish t-shirts for men',
        slug: 'mens-t-shirts'
      },
      {
        name: 'Women\'s T-Shirts', 
        description: 'Trendy and comfortable t-shirts for women',
        slug: 'womens-t-shirts'
      },
      {
        name: 'Kids T-Shirts',
        description: 'Fun and colorful t-shirts for children',
        slug: 'kids-t-shirts'
      }
    ];

    // Clear existing data (optional)
    const clearData = req.nextUrl.searchParams.get('clear') === 'true';
    if (clearData) {
      await Product.deleteMany({});
      await Category.deleteMany({});
    }

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    
    // Create sample products
    const sampleProducts = [
      {
        title: 'Classic Black T-Shirt',
        description: 'A timeless black t-shirt made from 100% cotton. Perfect for everyday wear.',
        price: 25.99,
        category: createdCategories[0]._id,
        colors: ['Black', 'White', 'Gray'],
        sizes: ['S', 'M', 'L', 'XL'],
        stockQuantity: 100,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ],
        averageRating: 4.5,
        reviewCount: 25
      },
      {
        title: 'Classic White T-Shirt',
        description: 'A pristine white t-shirt made from premium cotton. Essential for any wardrobe.',
        price: 24.99,
        category: createdCategories[0]._id,
        colors: ['White', 'Off-White', 'Cream'],
        sizes: ['S', 'M', 'L', 'XL'],
        stockQuantity: 120,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ],
        averageRating: 4.6,
        reviewCount: 35
      },
      {
        title: 'Vintage Band Tee',
        description: 'Retro-style band t-shirt with distressed print. Rock your style!',
        price: 32.99,
        category: createdCategories[0]._id,
        colors: ['Black', 'Navy', 'Maroon'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stockQuantity: 75,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500'
        ],
        averageRating: 4.7,
        reviewCount: 42
      },
      {
        title: 'Women\'s Floral Print Tee',
        description: 'Beautiful floral pattern t-shirt. Soft, comfortable, and stylish.',
        price: 28.99,
        category: createdCategories[1]._id,
        colors: ['Pink', 'White', 'Lavender'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stockQuantity: 60,
        images: [
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500'
        ],
        averageRating: 4.3,
        reviewCount: 18
      },
      {
        title: 'Casual Striped Tee',
        description: 'Classic striped t-shirt for a casual, comfortable look.',
        price: 24.99,
        category: createdCategories[1]._id,
        colors: ['Navy/White', 'Red/White', 'Blue/White'],
        sizes: ['XS', 'S', 'M', 'L'],
        stockQuantity: 85,
        images: [
          'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500'
        ],
        averageRating: 4.1,
        reviewCount: 31
      },
      {
        title: 'Kids Rainbow T-Shirt',
        description: 'Bright and colorful rainbow t-shirt that kids will love!',
        price: 18.99,
        category: createdCategories[2]._id,
        colors: ['Rainbow', 'Pink', 'Blue'],
        sizes: ['XS', 'S', 'M', 'L'],
        stockQuantity: 50,
        images: [
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ],
        averageRating: 4.8,
        reviewCount: 15
      },
      {
        title: 'Kids Animal Print Tee',
        description: 'Fun animal print t-shirt perfect for playful kids.',
        price: 19.99,
        category: createdCategories[2]._id,
        colors: ['Green', 'Orange', 'Yellow'],
        sizes: ['XS', 'S', 'M'],
        stockQuantity: 40,
        images: [
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ],
        averageRating: 4.6,
        reviewCount: 12
      },
      {
        title: 'Premium Cotton Polo',
        description: 'High-quality cotton polo shirt for a smart casual look.',
        price: 45.99,
        category: createdCategories[0]._id,
        colors: ['White', 'Navy', 'Black', 'Gray'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stockQuantity: 30,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
        ],
        averageRating: 4.4,
        reviewCount: 28
      },
      {
        title: 'Graphic Design Tee',
        description: 'Modern graphic design t-shirt with unique artwork.',
        price: 29.99,
        category: createdCategories[0]._id,
        colors: ['Black', 'White', 'Blue'],
        sizes: ['S', 'M', 'L', 'XL'],
        stockQuantity: 65,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'
        ],
        averageRating: 4.2,
        reviewCount: 19
      }
    ];

    // Insert products
    const createdProducts = await Product.insertMany(sampleProducts);
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        categoriesCreated: createdCategories.length,
        productsCreated: createdProducts.length,
        categories: createdCategories.map(c => ({ id: c._id, name: c.name })),
        products: createdProducts.map(p => ({ id: p._id, title: p.title, price: p.price }))
      }
    });

  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
