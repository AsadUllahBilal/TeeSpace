import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Order from '@/models/Order';
import Contact from '@/models/Contact';
import Product from '@/models/Product';

// GET - Get comprehensive dashboard analytics (admin only)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Date ranges for analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. ORDER ANALYTICS
    // Total orders and revenue
    const [totalOrdersData, monthlyOrdersData, lastMonthOrdersData] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfMonth },
            status: { $in: ['paid', 'shipped', 'delivered'] }
          } 
        },
        {
          $group: {
            _id: null,
            monthlyRevenue: { $sum: '$total' },
            monthlyOrders: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $in: ['paid', 'shipped', 'delivered'] }
          } 
        },
        {
          $group: {
            _id: null,
            lastMonthRevenue: { $sum: '$total' },
            lastMonthOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenue = totalOrdersData[0]?.totalRevenue || 0;
    const totalOrders = totalOrdersData[0]?.totalOrders || 0;
    const monthlyRevenue = monthlyOrdersData[0]?.monthlyRevenue || 0;
    const monthlyOrders = monthlyOrdersData[0]?.monthlyOrders || 0;
    const lastMonthRevenue = lastMonthOrdersData[0]?.lastMonthRevenue || 0;
    const lastMonthOrders = lastMonthOrdersData[0]?.lastMonthOrders || 0;

    // Revenue growth calculation
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
      : monthlyRevenue > 0 ? 100 : 0;

    // Order growth calculation
    const orderGrowth = lastMonthOrders > 0 
      ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100)
      : monthlyOrders > 0 ? 100 : 0;

    // Order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = orderStatusCounts.reduce((acc: any, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Daily revenue for last 30 days
    const dailyRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last30Days },
          status: { $in: ['paid', 'shipped', 'delivered'] }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 2. PRODUCT ANALYTICS
    const [totalProducts, topSellingProducts, lowStockProducts] = await Promise.all([
      Product.countDocuments({}),
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.title',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]),
      Product.find({ stock: { $lte: 10 } })
        .select('title stock price')
        .limit(5)
        .lean()
    ]);

    // 3. CONTACT MESSAGE ANALYTICS
    const [totalMessages, newMessages, messageStatusCounts] = await Promise.all([
      Contact.countDocuments({}),
      Contact.countDocuments({ status: 'new' }),
      Contact.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const messageStats = messageStatusCounts.reduce((acc: any, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // 4. USER ANALYTICS (based on orders)
    const [totalCustomers, newCustomersThisMonth, topCustomers] = await Promise.all([
      Order.distinct('clerkId').then(ids => ids.length),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: '$clerkId' } },
        { $count: 'newCustomers' }
      ]).then(result => result[0]?.newCustomers || 0),
      Order.aggregate([
        {
          $group: {
            _id: '$clerkId',
            totalSpent: { $sum: '$total' },
            orderCount: { $sum: 1 },
            customerName: { $first: { $concat: ['$fullName', ' ', '$lastName'] } },
            customerEmail: { $first: '$email' }
          }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 }
      ])
    ]);

    // 5. RECENT ACTIVITY
    const [recentOrders, recentMessages] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName lastName email total status createdAt slug')
        .lean(),
      Contact.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject status createdAt')
        .lean()
    ]);

    // 6. WEEKLY TRENDS (last 7 days)
    const weeklyTrends = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days },
          status: { $in: ['paid', 'shipped', 'delivered'] }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return NextResponse.json({
      // Revenue & Orders
      totalRevenue,
      totalOrders,
      monthlyRevenue,
      monthlyOrders,
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      orderGrowth: Number(orderGrowth.toFixed(2)),
      
      // Order Status
      orderStatusCounts: statusCounts,
      pendingOrders: statusCounts.pending || 0,
      
      // Charts Data
      dailyRevenue,
      weeklyTrends,
      
      // Products
      totalProducts,
      topSellingProducts,
      lowStockProducts,
      
      // Customers
      totalCustomers,
      newCustomersThisMonth,
      topCustomers,
      
      // Messages
      totalMessages,
      newMessages,
      messageStatusCounts: messageStats,
      
      // Recent Activity
      recentOrders,
      recentMessages,
      
      // Additional Metrics
      averageOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      conversionRate: totalCustomers > 0 ? Number(((totalOrders / totalCustomers) * 100).toFixed(2)) : 0,
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' }, 
      { status: 500 }
    );
  }
}
