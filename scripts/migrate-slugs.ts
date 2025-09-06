/**
 * Migration script to add slugs to existing products
 * Run this script once to ensure all existing products have slugs
 */

import mongoose from 'mongoose';
import Product from '../models/Product';
import { generateSlug } from '../lib/slug';
import connectDB from '../lib/mongo';
import Order from '@/models/Order';
import crypto from "crypto"

async function migrateProductSlugs() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all products without slugs or with empty slugs
    const productsWithoutSlugs = await Product.find({
      $or: [
        { slug: { $exists: false } },
        { slug: '' },
        { slug: null }
      ]
    });

    console.log(`Found ${productsWithoutSlugs.length} products without slugs`);

    for (const product of productsWithoutSlugs) {
      try {
        // Generate a unique slug
        let baseSlug = generateSlug(product.title);
        let slug = baseSlug;
        let counter = 1;
        
        // Check if slug already exists
        while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Update the product with the new slug
        await Product.findByIdAndUpdate(product._id, { slug });
        console.log(`Updated product "${product.title}" with slug: ${slug}`);
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateProductSlugs();
}

export default migrateProductSlugs;


function generateOrderSlug(orderId: string): string {
  return crypto
    .createHash('sha256')
    .update(orderId + process.env.SLUG_SECRET || 'fallback-secret')
    .digest('hex')
    .substring(0, 12);
}

async function migrateOrderSlugs() {
  try {
    await connectDB();
    
    const orders = await Order.find({ slug: { $exists: false } });
    
    for (const order of orders) {
      const slug = generateOrderSlug(order._id.toString());
      order.slug = slug;
      await order.save();
      console.log(`Added slug ${slug} to order ${order._id}`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateOrderSlugs();