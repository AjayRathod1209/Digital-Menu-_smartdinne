const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const sampleMenuItems = [
  { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: 120, category: 'Starters', rating: 4.5 },
  { name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan and croutons', price: 180, category: 'Starters', rating: 4.2 },
  { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 80, category: 'Starters', rating: 4.0 },
  { name: 'Grilled Chicken', description: 'Tender grilled chicken with herbs and spices', price: 320, category: 'Main Course', rating: 4.8 },
  { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 280, category: 'Main Course', rating: 4.6 },
  { name: 'Vegetable Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 250, category: 'Main Course', rating: 4.4 },
  { name: 'Chocolate Cake', description: 'Rich chocolate cake with ganache', price: 150, category: 'Desserts', rating: 4.9 },
  { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', price: 120, category: 'Desserts', rating: 4.3 },
  { name: 'Fresh Lime Soda', description: 'Refreshing lime soda with mint', price: 80, category: 'Beverages', rating: 4.1 },
  { name: 'Coffee', description: 'Freshly brewed coffee', price: 60, category: 'Beverages', rating: 4.4 },
]

async function seed() {
  try {
    // Create multiple tables
    const tables = [
      { number: 'TABLE1', qrCode: 'QR_TABLE1' },
      { number: 'TABLE2', qrCode: 'QR_TABLE2' },
      { number: 'TABLE3', qrCode: 'QR_TABLE3' },
      { number: 'TABLE4', qrCode: 'QR_TABLE4' },
      { number: 'TABLE5', qrCode: 'QR_TABLE5' },
      { number: 'TABLE6', qrCode: 'QR_TABLE6' }
    ]

    for (const tableData of tables) {
      const existingTable = await db.table.findFirst({
        where: { number: tableData.number }
      })

      if (!existingTable) {
        await db.table.create({
          data: {
            ...tableData,
            isActive: true
          }
        })
        console.log(`Created table: ${tableData.number}`)
      }
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
          password: 'admin123',
          role: 'ADMIN'
        }
      })
      console.log('Created admin user')
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
            isAvailable: true,
            rating: item.rating || 0
          }
        })
        console.log(`Created menu item: ${item.name}`)
      }
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await db.$disconnect()
  }
}

seed()