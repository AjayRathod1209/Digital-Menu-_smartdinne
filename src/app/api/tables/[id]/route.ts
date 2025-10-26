import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { number, qrCode, isActive } = await request.json();
    const { id } = params;

    const table = await db.table.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(qrCode && { qrCode }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if table has existing orders
    const existingOrders = await db.order.count({
      where: { tableId: id }
    });

    if (existingOrders > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete table with existing orders',
          orderCount: existingOrders
        },
        { status: 400 }
      );
    }

    await db.table.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}