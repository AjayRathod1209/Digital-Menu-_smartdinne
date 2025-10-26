import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const menuItems = await db.menuItem.findMany({
      where: {
        isAvailable: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, imageUrl, rating, isAvailable } = body

    const menuItem = await db.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || null,
        rating: rating ? parseFloat(rating) : 0,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      }
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}