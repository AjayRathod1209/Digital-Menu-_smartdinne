import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        table: true,
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customerName, customerPhone, tableId, totalAmount } = body

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD${Date.now().toString().slice(-6)}`

    // Create or find customer
    let customer = await db.user.findFirst({
      where: { email: `${customerPhone}@customer.com` }
    })

    if (!customer) {
      customer = await db.user.create({
        data: {
          email: `${customerPhone}@customer.com`,
          name: customerName,
          password: 'password', // In production, this should be handled properly
          role: 'CUSTOMER'
        }
      })
    }

    // Verify table exists and is active
    const table = await db.table.findFirst({
      where: { 
        id: tableId,
        isActive: true 
      }
    })

    if (!table) {
      return NextResponse.json({ error: 'Invalid or inactive table' }, { status: 400 })
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        tableId: table.id,
        customerId: customer.id,
        status: 'PENDING',
        totalAmount,
        isPaid: false,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price
          }))
        }
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}