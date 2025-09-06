import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Order from '@/models/Order';

// GET - Get order statistics (admin only)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get status counts
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCountsObj = statusCounts.reduce((acc: any, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Get total revenue (paid, shipped, delivered orders)
    const revenueData = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, totalOrders: 0 };

    // Get recent orders (last 10)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fullName lastName email total status createdAt slug')
      .lean();

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['paid', 'shipped', 'delivered'] }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.title',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Get pending orders count (needs attention)
    const pendingOrdersCount = statusCountsObj.pending || 0;

    return NextResponse.json({
      statusCounts: statusCountsObj,
      totalRevenue: revenue.totalRevenue,
      totalOrdersCount: revenue.totalOrders,
      pendingOrdersCount,
      recentOrders,
      monthlyRevenue,
      topProducts,
      totalOrdersAllTime: Object.values(statusCountsObj).reduce((sum: number, count: any) => sum + count, 0)
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order statistics' }, 
      { status: 500 }
    );
  }
}
