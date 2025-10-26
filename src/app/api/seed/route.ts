import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const sampleMenuItems = [
  { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: 120, category: 'Starters' },
  { name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan and croutons', price: 180, category: 'Starters' },
  { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 80, category: 'Starters' },
  { name: 'Grilled Chicken', description: 'Tender grilled chicken with herbs and spices', price: 320, category: 'Main Course' },
  { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 280, category: 'Main Course' },
  { name: 'Vegetable Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 250, category: 'Main Course' },
  { name: 'Chocolate Cake', description: 'Rich chocolate cake with ganache', price: 150, category: 'Desserts' },
  { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', price: 120, category: 'Desserts' },
  { name: 'Fresh Lime Soda', description: 'Refreshing lime soda with mint', price: 80, category: 'Beverages' },
  { name: 'Coffee', description: 'Freshly brewed coffee', price: 60, category: 'Beverages' },
]

export async function POST() {
  try {
    // Create default table
    const existingTable = await db.table.findFirst({
      where: { number: 'TABLE1' }
    })

    if (!existingTable) {
      await db.table.create({
        data: {
          number: 'TABLE1',
          qrCode: 'QR_DEFAULT',
          isActive: true
        }
      })
    }

    // Create admin user
    const existingAdmin = await db.user.findFirst({
      where: { email: 'admin@smartdine.com' }
    })

    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: 'admin@smartdine.com',
          name: 'Admin',
          password: 'admin123', // In production, use proper hashing
          role: 'ADMIN'
        }
      })
    }

    // Create menu items
    for (const item of sampleMenuItems) {
      const existingItem = await db.menuItem.findFirst({
        where: { name: item.name }
      })

      if (!existingItem) {
        await db.menuItem.create({
          data: {
            ...item,
            isAvailable: true
          }
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}