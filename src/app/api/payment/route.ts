import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentMethod, amount } = body

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay to simulate processing

    // Generate payment ID
    const paymentId = `PAY${Date.now().toString().slice(-8)}`

    // Update order with payment information
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        paymentId,
        paymentMethod,
        isPaid: true,
        status: 'PREPARING' // Move to preparing after payment
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        table: true,
        customer: true
      }
    })

    return NextResponse.json({
      success: true,
      paymentId,
      order,
      message: 'Payment processed successfully'
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 })
  }
}