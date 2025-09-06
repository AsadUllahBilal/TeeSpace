// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load from .env.local first, then fall back to .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import connectDB from '@/lib/mongo';
import Order from '@/models/Order';
import crypto from 'crypto';

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