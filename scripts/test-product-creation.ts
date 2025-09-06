/**
 * Test script to verify product creation with automatic slug generation
 */

import mongoose from 'mongoose';
import Product from '../models/Product';
import connectDB from '../lib/mongo';

async function testProductCreation() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Test product data
    const testProduct = {
      title: 'Test Product for Slug Generation',
      description: 'This is a test product to verify slug generation works correctly.',
      price: 29.99,
      category: new mongoose.Types.ObjectId(), // Mock category ID
      colors: ['red', 'blue'],
      sizes: ['S', 'M', 'L'],
      stockQuantity: 100,
      images: ['https://example.com/image1.jpg'],
    };

    console.log('Creating test product...');
    console.log('Title:', testProduct.title);

    // Create the product (slug should be auto-generated)
    const product = new Product(testProduct);
    await product.save();

    console.log('✅ Product created successfully!');
    console.log('Generated slug:', product.slug);
    console.log('Product ID:', product._id);

    // Test updating the title to see if slug changes
    console.log('\nTesting title update...');
    product.title = 'Updated Test Product Title';
    await product.save();

    console.log('✅ Product updated successfully!');
    console.log('New slug:', product.slug);

    // Clean up - delete the test product
    await Product.findByIdAndDelete(product._id);
    console.log('✅ Test product cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testProductCreation();
}

export default testProductCreation;
