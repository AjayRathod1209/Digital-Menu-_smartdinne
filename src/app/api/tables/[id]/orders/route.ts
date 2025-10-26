import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get all orders for this table
    const orders = await db.order.findMany({
      where: { tableId: id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      orderCount: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table orders' },
      { status: 500 }
    );
  }
}