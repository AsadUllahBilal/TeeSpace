import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongo';
import Contact from '@/models/Contact';

// GET - Get contact message statistics (admin only)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get status counts
    const statusCounts = await Contact.aggregate([
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

    // Get total unread (new + read but not replied)
    const unreadCount = (statusCountsObj.new || 0) + (statusCountsObj.read || 0);

    // Get recent messages (last 5)
    const recentMessages = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt')
      .lean();

    return NextResponse.json({
      statusCounts: statusCountsObj,
      unreadCount,
      recentMessages,
      totalMessages: Object.values(statusCountsObj).reduce((sum: number, count: any) => sum + count, 0)
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' }, 
      { status: 500 }
    );
  }
}
