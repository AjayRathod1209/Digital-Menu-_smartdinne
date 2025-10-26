import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if the menu item is referenced in any orders
    const orderItems = await db.orderItem.findMany({
      where: { menuItemId: id },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true
          }
        }
      }
    })

    const canDelete = orderItems.length === 0
    
    return NextResponse.json({
      canDelete,
      referencedOrders: orderItems.map(oi => ({
        orderNumber: oi.order.orderNumber,
        status: oi.order.status
      }))
    })
  } catch (error) {
    console.error('Error checking menu item delete status:', error)
    return NextResponse.json({ error: 'Failed to check delete status' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, category, imageUrl, isAvailable, rating } = body

    const menuItem = await db.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || null,
        isAvailable,
        rating: rating ? parseFloat(rating) : null
      }
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if the menu item is referenced in any orders
    const orderItems = await db.orderItem.findMany({
      where: { menuItemId: id },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true
          }
        }
      }
    })

    if (orderItems.length > 0) {
      const orderNumbers = orderItems.map(oi => oi.order.orderNumber).join(', ')
      return NextResponse.json({ 
        error: `Cannot delete menu item that is referenced in existing orders (${orderNumbers}). Please delete the orders first or mark the item as unavailable instead.`,
        referencedOrders: orderItems.map(oi => ({
          orderNumber: oi.order.orderNumber,
          status: oi.order.status
        })),
        canMarkUnavailable: true
      }, { status: 400 })
    }

    // If not referenced, proceed with deletion
    await db.menuItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}