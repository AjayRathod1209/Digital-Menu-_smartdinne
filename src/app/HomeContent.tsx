'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Plus, Minus, Clock, CheckCircle, ChefHat, Truck, Star, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  rating?: number
  isAvailable: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  createdAt: string
  items: CartItem[]
  paymentId?: string
}

interface Table {
  id: string
  number: string
  qrCode: string
  isActive: boolean
}

const categories = ['Starters', 'Main Course', 'Desserts', 'Beverages']

const sampleMenuItems: MenuItem[] = [
  { id: '1', name: 'Spring Rolls', description: 'Crispy vegetable spring rolls with sweet chili sauce', price: 120, category: 'Starters', rating: 4.5, isAvailable: true },
  { id: '2', name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan and croutons', price: 180, category: 'Starters', rating: 4.2, isAvailable: true },
  { id: '3', name: 'Grilled Chicken', description: 'Tender grilled chicken with herbs and spices', price: 320, category: 'Main Course', rating: 4.8, isAvailable: true },
  { id: '4', name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 280, category: 'Main Course', rating: 4.6, isAvailable: true },
  { id: '5', name: 'Chocolate Cake', description: 'Rich chocolate cake with ganache', price: 150, category: 'Desserts', rating: 4.9, isAvailable: true },
  { id: '6', name: 'Ice Cream Sundae', description: 'Vanilla ice cream with toppings', price: 120, category: 'Desserts', rating: 4.3, isAvailable: true },
  { id: '7', name: 'Fresh Lime Soda', description: 'Refreshing lime soda with mint', price: 80, category: 'Beverages', rating: 4.1, isAvailable: true },
  { id: '8', name: 'Coffee', description: 'Freshly brewed coffee', price: 60, category: 'Beverages', rating: 4.4, isAvailable: true },
]

export default function HomeContent() {
  const searchParams = useSearchParams()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  const { socket, isConnected, joinOrderRoom, onOrderStatusUpdate } = useSocket()

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const headerHeight = 64 // Header height in pixels (h-16 = 64px)
      
      // Show header if at top of page
      if (currentScrollY <= headerHeight) {
        setIsHeaderVisible(true)
      } 
      // Hide header when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
        setIsHeaderVisible(false)
      } 
      // Show header when scrolling up
      else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    fetchMenuItems()
    fetchTables()
    
    // Check for any pending payments from previous session
    checkPendingPayment()
  }, [])

  // Auto-select table from URL parameter
  useEffect(() => {
    const tableParam = searchParams.get('table')
    if (tableParam && tables.length > 0) {
      const table = tables.find(t => t.number === tableParam)
      if (table) {
        setSelectedTable(table.id)
        toast.success(`Table ${table.number} selected`)
      }
    }
  }, [tables, searchParams])

  useEffect(() => {
    if (currentOrder && isConnected) {
      joinOrderRoom(currentOrder.id)
      
      onOrderStatusUpdate((data) => {
        if (data.orderId === currentOrder.id) {
          setCurrentOrder(prev => prev ? { ...prev, status: data.status } : null)
          toast.success(`Order status updated to: ${data.status}`)
        }
      })
    }
  }, [currentOrder, isConnected, joinOrderRoom, onOrderStatusUpdate])

  const showManualPaymentInstructions = (upiId: string, transactionNote: string) => {
    const instructions = `
    MANUAL PAYMENT INSTRUCTIONS:
    
    Since the automatic opening didn't work, please follow these steps:
    
    1. Open your PhonePe app manually
    2. Go to "Pay" or "Send Money"
    3. Enter this UPI ID: ${upiId}
    4. Enter the amount
    5. Use this transaction note: ${transactionNote}
    6. Complete the payment
    7. Return to this page and click "Payment Completed"
    
    The UPI ID has been copied to your clipboard.
    `
    
    // Copy UPI ID to clipboard
    navigator.clipboard.writeText(upiId)
    
    alert(instructions)
    toast.info('UPI ID copied to clipboard! Please open PhonePe app manually.')
  }

  const checkPendingPayment = () => {
    try {
      const pendingPayment = localStorage.getItem('pendingPayment')
      if (pendingPayment) {
        const paymentDetails = JSON.parse(pendingPayment)
        
        // Show a toast asking if payment was completed
        const paymentCompleted = window.confirm(
          `You have a pending payment of ₹${paymentDetails.totalAmount} for Order ${paymentDetails.orderNumber}.\n\n` +
          `Did you complete the payment via ${paymentDetails.paymentMethod.toUpperCase()}?\n\n` +
          `Click OK if payment was completed, or Cancel if payment failed.`
        )
        
        if (paymentCompleted) {
          // Complete the payment
          completePayment(paymentDetails.paymentMethod.toUpperCase())
          localStorage.removeItem('pendingPayment')
        } else {
          // Remove pending payment and allow user to try again
          localStorage.removeItem('pendingPayment')
          toast.info('Payment cancelled. You can try again.')
        }
      }
    } catch (error) {
      console.error('Error checking pending payment:', error)
      localStorage.removeItem('pendingPayment')
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      if (response.ok) {
        const items = await response.json()
        setMenuItems(items)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      // Fallback to sample data
      setMenuItems(sampleMenuItems)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      } else {
        console.error('Failed to fetch tables:', response.status)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
    
    // Show header when item is added to cart
    setIsHeaderVisible(true)
    
    toast.success(`${item.name} added to cart`)
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prevCart.filter(item => item.id !== itemId)
    })
    
    // Show header when item is removed from cart
    setIsHeaderVisible(true)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!customerName || !customerPhone) {
      toast.error('Please enter your name and phone number')
      return
    }

    if (!selectedTable) {
      toast.error('Please select a table')
      return
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customerName,
        customerPhone,
        tableId: selectedTable,
        totalAmount: getTotalPrice()
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        setCurrentOrder(order)
        setShowPaymentOptions(true)
        toast.success('Order created! Please select payment method')
      } else {
        toast.error('Failed to place order')
      }
    } catch (error) {
      toast.error('Error placing order')
    }
  }

  const processPayment = async (paymentMethod: string) => {
    if (!currentOrder) return

    setIsProcessingPayment(true)
    setSelectedPaymentMethod(paymentMethod)

    try {
      if (paymentMethod === 'cash_on_service') {
        // For cash on service, just mark as paid
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: currentOrder.id,
            paymentMethod: 'CASH_ON_SERVICE',
            amount: currentOrder.totalAmount
          }),
        })

        if (response.ok) {
          // Get table number from tables array
          const selectedTableObj = tables.find(t => t.id === selectedTable)
          const tableNumber = selectedTableObj?.number || 'Unknown'
          
          // Store order details in localStorage for success page
          const orderDetails = {
            orderNumber: currentOrder.orderNumber,
            totalAmount: currentOrder.totalAmount,
            paymentMethod: 'cash_on_service',
            tableNumber: tableNumber,
            customerName: customerName
          }
          localStorage.setItem('lastOrder', JSON.stringify(orderDetails))
          
          // Redirect to success page
          window.location.href = `/order-success?orderId=${currentOrder.id}&orderNumber=${currentOrder.orderNumber}&totalAmount=${currentOrder.totalAmount}&paymentMethod=cash_on_service&tableNumber=${tableNumber}&customerName=${encodeURIComponent(customerName)}`
        } else {
          toast.error('Payment processing failed')
        }
      } else if (paymentMethod === 'phonepe') {
        // Go directly to PhonePe website
        const phonePeUrl = 'https://business.phonepe.com/register?utm_source=homepage_banner_pg'
        
        // Create payment record first
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: currentOrder.id,
            paymentMethod: 'PHONEPE',
            amount: currentOrder.totalAmount
          }),
        })

        if (response.ok) {
          // Get table number from tables array
          const selectedTableObj = tables.find(t => t.id === selectedTable)
          const tableNumber = selectedTableObj?.number || 'Unknown'
          
          // Store order details in localStorage for success page
          const orderDetails = {
            orderNumber: currentOrder.orderNumber,
            totalAmount: currentOrder.totalAmount,
            paymentMethod: 'phonepe',
            tableNumber: tableNumber,
            customerName: customerName
          }
          localStorage.setItem('lastOrder', JSON.stringify(orderDetails))
          
          // Show success message and redirect to PhonePe
          toast.success('Redirecting to PhonePe...', {
            description: 'Complete your payment on PhonePe website',
            duration: 2000
          })
          
          // Go directly to PhonePe website
          setTimeout(() => {
            window.open(phonePeUrl, '_blank')
            // Redirect to success page after opening PhonePe
            window.location.href = `/order-success?orderId=${currentOrder.id}&orderNumber=${currentOrder.orderNumber}&totalAmount=${currentOrder.totalAmount}&paymentMethod=phonepe&tableNumber=${tableNumber}&customerName=${encodeURIComponent(customerName)}`
          }, 1000)
        } else {
          toast.error('Payment processing failed')
        }
      } else if (paymentMethod === 'paytm') {
        // Go directly to Paytm website
        const paytmUrl = 'https://paytm.com/'
        
        // Create payment record first
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: currentOrder.id,
            paymentMethod: 'PAYTM',
            amount: currentOrder.totalAmount
          }),
        })

        if (response.ok) {
          // Get table number from tables array
          const selectedTableObj = tables.find(t => t.id === selectedTable)
          const tableNumber = selectedTableObj?.number || 'Unknown'
          
          // Store order details in localStorage for success page
          const orderDetails = {
            orderNumber: currentOrder.orderNumber,
            totalAmount: currentOrder.totalAmount,
            paymentMethod: 'paytm',
            tableNumber: tableNumber,
            customerName: customerName
          }
          localStorage.setItem('lastOrder', JSON.stringify(orderDetails))
          
          // Show success message and redirect to Paytm
          toast.success('Redirecting to Paytm...', {
            description: 'Complete your payment on Paytm website',
            duration: 2000
          })
          
          // Go directly to Paytm website
          setTimeout(() => {
            window.open(paytmUrl, '_blank')
            // Redirect to success page after opening Paytm
            window.location.href = `/order-success?orderId=${currentOrder.id}&orderNumber=${currentOrder.orderNumber}&totalAmount=${currentOrder.totalAmount}&paymentMethod=paytm&tableNumber=${tableNumber}&customerName=${encodeURIComponent(customerName)}`
          }, 1000)
        } else {
          toast.error('Payment processing failed')
        }
      }
    } catch (error) {
      toast.error('Error processing payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const completePayment = async (paymentMethod: string) => {
    if (!currentOrder) return

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentOrder.id,
          paymentMethod: paymentMethod,
          amount: currentOrder.totalAmount
        }),
      })

      if (response.ok) {
        // Get table number from tables array
        const selectedTableObj = tables.find(t => t.id === selectedTable)
        const tableNumber = selectedTableObj?.number || 'Unknown'
        
        // Store order details in localStorage for success page
        const orderDetails = {
          orderNumber: currentOrder.orderNumber,
          totalAmount: currentOrder.totalAmount,
          paymentMethod: paymentMethod.toLowerCase(),
          tableNumber: tableNumber,
          customerName: customerName
        }
        localStorage.setItem('lastOrder', JSON.stringify(orderDetails))
        
        // Redirect to success page
        window.location.href = `/order-success?orderId=${currentOrder.id}&orderNumber=${currentOrder.orderNumber}&totalAmount=${currentOrder.totalAmount}&paymentMethod=${paymentMethod.toLowerCase()}&tableNumber=${tableNumber}&customerName=${encodeURIComponent(customerName)}`
      } else {
        toast.error('Payment verification failed')
      }
    } catch (error) {
      toast.error('Error completing payment')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'PREPARING': return <ChefHat className="w-4 h-4" />
      case 'READY': return <CheckCircle className="w-4 h-4" />
      case 'COMPLETED': return <Truck className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PREPARING': return 'bg-blue-100 text-blue-800'
      case 'READY': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`bg-background border-b fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">SmartDine</h1>
              <Badge variant="secondary" className="ml-3">Digital Menu</Badge>
              {selectedTable && (
                <Badge variant="outline" className="ml-2">
                  Table {tables.find(t => t.id === selectedTable)?.number || 'Selected'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Table Selection for users without QR code */}
              {tables.length > 0 && !selectedTable && (
                <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Select Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Your Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Please select the table where you're seated to place your order.
                      </p>
                      <div className="grid gap-2">
                        {tables.filter(table => table.isActive).map((table) => (
                          <Button
                            key={table.id}
                            variant={selectedTable === table.id ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => {
                              setSelectedTable(table.id)
                              setIsTableDialogOpen(false)
                              toast.success(`Table ${table.number} selected`)
                            }}
                          >
                            Table {table.number}
                          </Button>
                        ))}
                      </div>
                      {tables.filter(table => table.isActive).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                          No active tables available. Please contact staff.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Sheet open={isCartOpen} onOpenChange={(open) => {
    setIsCartOpen(open)
    if (open) {
      setIsHeaderVisible(true)
    }
  }}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-500">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="table">Select Table *</Label>
                            <Select value={selectedTable} onValueChange={setSelectedTable}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a table" />
                              </SelectTrigger>
                              <SelectContent>
                                {tables.filter(table => table.isActive).length > 0 ? (
                                  tables.filter(table => table.isActive).map((table) => (
                                    <SelectItem key={table.id} value={table.id}>
                                      Table {table.number}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-tables" disabled>
                                    No active tables available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            {tables.length === 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                No tables configured. Please contact staff.
                              </p>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total:</span>
                            <span className="font-bold text-lg">₹{getTotalPrice()}</span>
                          </div>
                          {!showPaymentOptions ? (
                            <Button onClick={placeOrder} className="w-full">
                              Proceed to Pay
                            </Button>
                          ) : (
                            <div className="space-y-3">
                              <div className="text-center font-medium text-sm text-muted-foreground">
                                Select Payment Method
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => processPayment('cash_on_service')}
                                  disabled={isProcessingPayment}
                                  className="w-full justify-start"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-xs font-bold">₹</span>
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">Cash on Service</div>
                                      <div className="text-xs text-muted-foreground">Pay when food arrives</div>
                                    </div>
                                  </div>
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => processPayment('phonepe')}
                                  disabled={isProcessingPayment}
                                  className="w-full justify-start"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-purple-600 text-xs font-bold">P</span>
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">PhonePe</div>
                                      <div className="text-xs text-muted-foreground">Pay via PhonePe UPI</div>
                                    </div>
                                  </div>
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() => processPayment('paytm')}
                                  disabled={isProcessingPayment}
                                  className="w-full justify-start"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 text-xs font-bold">T</span>
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium">Paytm</div>
                                      <div className="text-xs text-muted-foreground">Pay via Paytm</div>
                                    </div>
                                  </div>
                                </Button>
                              </div>

                              {isProcessingPayment && (
                                <div className="text-center text-sm text-muted-foreground">
                                  Processing payment...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Current Order Status */}
      {currentOrder && (
        <div className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Order #{currentOrder.orderNumber}</h3>
                    <p className="text-sm text-gray-500">Placed at {new Date(currentOrder.createdAt).toLocaleTimeString()}</p>
                    {currentOrder.paymentId && (
                      <p className="text-sm text-green-600">Payment ID: {currentOrder.paymentId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isProcessingPayment && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Processing Payment...</span>
                      </div>
                    )}
                    <Badge className={getStatusColor(currentOrder.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(currentOrder.status)}
                        <span>{currentOrder.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Order Success Message */}
      {showOrderSuccess && currentOrder && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Card className="bg-green-100 border-green-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Order Successful!</h3>
                      <p className="text-green-600">
                        Order #{currentOrder.orderNumber} has been placed successfully. 
                        {selectedPaymentMethod === 'cash_on_service' 
                          ? ' Payment will be collected during service.' 
                          : ` Payment completed via ${selectedPaymentMethod?.replace('_', ' ').toUpperCase()}.`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowOrderSuccess(false)}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="All">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4 w-3/4 animate-pulse"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={item.isAvailable ? "default" : "secondary"}>
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.rating && (
                        <div className="mt-1">
                          {renderStars(item.rating)}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                        <Button 
                          onClick={() => addToCart(item)}
                          disabled={!item.isAvailable}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}