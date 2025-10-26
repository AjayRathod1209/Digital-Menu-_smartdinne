import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Delete all order items first (due to foreign key constraints)
    await db.orderItem.deleteMany({})
    
    // Delete all orders
    await db.order.deleteMany({})

    return NextResponse.json({ 
      success: true, 
      message: 'Order data cleared successfully. Menu items and users preserved.' 
    })
  } catch (error) {
    console.error('Error clearing order data:', error)
    return NextResponse.json({ error: 'Failed to clear order data' }, { status: 500 })
  }
}