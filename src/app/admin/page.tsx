'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  ShoppingCart, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Star,
  Image as ImageIcon,
  User,
  Download
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'
import { ThemeToggle } from '@/components/theme-toggle'
import { StarRating } from '@/components/star-rating'
import TableManagement from '@/components/admin/TableManagement'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  createdAt: string
  customer: {
    name: string
    phone?: string
  }
  table: {
    number: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    menuItem: {
      name: string
      category: string
    }
  }>
}

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

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}



export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    totalRevenue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false)
  const [isEditMenuItemOpen, setIsEditMenuItemOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Starters',
    rating: 5,
    imageUrl: '',
    isAvailable: true
  })

  const [qrData, setQrData] = useState<{ url: string; qrCode: string; format: string; size: string } | null>(null)
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false)
  const [qrForm, setQrForm] = useState({
    url: '',
    size: '200',
    format: 'png'
  })
  const [activeTab, setActiveTab] = useState('orders')

  const router = useRouter()
  const { socket, isConnected, joinAdminRoom, updateOrderStatus: updateOrderStatusSocket, onOrderStatusUpdate, onNewOrder } = useSocket()

  // Get user info and fetch initial data on mount
  useEffect(() => {
    getUserInfo()
    fetchInitialData()
    
    // Add visibility change listener to refresh when user returns to this tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchInitialData()
      }
    };
    
    // Add window focus listener as additional refresh trigger
    const handleWindowFocus = () => {
      fetchInitialData()
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [])

  const getUserInfo = async () => {
    try {
      const response = await fetch('/api/admin/auth/verify')
      if (response.ok) {
        const data = await response.json()
        setAdminUser(data.user)
      }
    } catch (error) {
      console.error('Failed to get user info:', error)
    }
  }

  const fetchInitialData = () => {
    fetchOrders()
    fetchMenuItems()
  }

  useEffect(() => {
    if (isConnected && adminUser) {
      joinAdminRoom()
      
      onOrderStatusUpdate((data) => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === data.orderId 
              ? { ...order, status: data.status }
              : order
          )
        )
        toast.success(`Order ${data.orderId} status updated to: ${data.status}`)
      })

      onNewOrder((data) => {
        fetchOrders() // Refresh orders when new order comes in
        toast.success('New order received!')
      })
    }
  }, [isConnected, joinAdminRoom, onOrderStatusUpdate, onNewOrder, adminUser])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }



  const calculateStats = (ordersData: Order[]) => {
    const stats = {
      totalOrders: ordersData.length,
      pendingOrders: ordersData.filter(o => o.status === 'PENDING').length,
      preparingOrders: ordersData.filter(o => o.status === 'PREPARING').length,
      readyOrders: ordersData.filter(o => o.status === 'READY').length,
      totalRevenue: ordersData
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    }
    setStats(stats)
  }

  const getOrderStatusData = () => {
    return [
      { name: 'Pending', value: stats.pendingOrders, color: '#eab308' },
      { name: 'Preparing', value: stats.preparingOrders, color: '#3b82f6' },
      { name: 'Ready', value: stats.readyOrders, color: '#22c55e' },
      { name: 'Completed', value: stats.totalOrders - stats.pendingOrders - stats.preparingOrders - stats.readyOrders, color: '#6b7280' }
    ]
  }

  const getCategoryData = () => {
    const categorySales: { [key: string]: number } = {}
    orders.forEach(order => {
      if (order.status === 'COMPLETED') {
        order.items.forEach(item => {
          // Use the actual category from menuItem instead of hardcoded string matching
          const category = item.menuItem.category || 'Other'
          categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity)
        })
      }
    })
    
    // Convert to array and sort by sales amount
    const data = Object.entries(categorySales).map(([category, sales]) => ({
      category,
      sales
    })).sort((a, b) => b.sales - a.sales)
    
    return data
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Starters': '#eab308',
      'Main Course': '#3b82f6', 
      'Desserts': '#ec4899',
      'Beverages': '#22c55e',
      'Other': '#6b7280'
    }
    return colors[category] || '#8884d8'
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Emit WebSocket event for real-time updates
        updateOrderStatusSocket(orderId, status)
        toast.success('Order status updated successfully')
        fetchOrders()
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      toast.error('Error updating order status')
    }
  }

  const addMenuItem = async () => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMenuItem,
          price: parseFloat(newMenuItem.price),
          rating: newMenuItem.rating
        }),
      })

      if (response.ok) {
        toast.success('Menu item added successfully')
        setNewMenuItem({
          name: '',
          description: '',
          price: '',
          category: 'Starters',
          rating: 5,
          imageUrl: '',
          isAvailable: true
        })
        setIsAddMenuItemOpen(false)
        fetchMenuItems()
      } else {
        toast.error('Failed to add menu item')
      }
    } catch (error) {
      toast.error('Error adding menu item')
    }
  }

  const updateMenuItem = async () => {
    if (!editingMenuItem) return

    try {
      const response = await fetch(`/api/menu/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingMenuItem,
          price: parseFloat(editingMenuItem.price.toString())
        }),
      })

      if (response.ok) {
        toast.success('Menu item updated successfully')
        setEditingMenuItem(null)
        setIsEditMenuItemOpen(false)
        fetchMenuItems()
      } else {
        toast.error('Failed to update menu item')
      }
    } catch (error) {
      toast.error('Error updating menu item')
    }
  }

  const startEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item)
    setIsEditMenuItemOpen(true)
  }

  const deleteMenuItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Menu item deleted successfully')
        fetchMenuItems()
      } else {
        const errorData = await response.json()
        
        if (response.status === 400 && errorData.error?.includes('referenced in existing orders')) {
          // Offer alternative solution for items that can't be deleted
          toast.error('Cannot delete item used in orders. Consider marking it as unavailable instead.', {
            duration: 5000,
            action: {
              label: 'Mark Unavailable',
              onClick: () => markItemUnavailable(itemId)
            }
          })
        } else {
          toast.error(errorData.error || 'Failed to delete menu item')
        }
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Error deleting menu item')
    }
  }

  const markItemUnavailable = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: false
        }),
      })

      if (response.ok) {
        toast.success('Menu item marked as unavailable')
        fetchMenuItems()
      } else {
        toast.error('Failed to update menu item')
      }
    } catch (error) {
      toast.error('Error updating menu item')
    }
  }

  const clearDashboard = async () => {
    setIsClearing(true)
    try {
      const response = await fetch('/api/clear', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Order data cleared successfully!')
        // Reset only order-related state to initial values
        setOrders([])
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          preparingOrders: 0,
          readyOrders: 0,
          totalRevenue: 0
        })
        // Refetch data to ensure clean state
        setTimeout(() => {
          fetchOrders()
          // Note: We don't refetch menu items as they should be preserved
        }, 1000)
      } else {
        toast.error('Failed to clear order data')
      }
    } catch (error) {
      toast.error('Error clearing order data')
    } finally {
      setIsClearing(false)
    }
  }

  const exportOrderData = () => {
    try {
      // Create CSV content with detailed order information
      const headers = [
        'Order Number',
        'Customer Name',
        'Customer Phone',
        'Table Number',
        'Status',
        'Total Amount (₹)',
        'Order Date',
        'Order Time',
        'Items Count',
        'Item Names',
        'Item Quantities',
        'Item Prices (₹)'
      ]

      const csvContent = [
        headers.join(','),
        ...orders.map(order => {
          const itemNames = order.items.map(item => item.menuItem.name).join('; ')
          const itemQuantities = order.items.map(item => item.quantity).join('; ')
          const itemPrices = order.items.map(item => item.price).join('; ')
          const orderDate = new Date(order.createdAt).toLocaleDateString()
          const orderTime = new Date(order.createdAt).toLocaleTimeString()
          
          return [
            order.orderNumber,
            `"${order.customer.name}"`,
            `"${order.customer.phone || 'N/A'}"`,
            `"${order.table.number}"`,
            order.status,
            order.totalAmount.toFixed(2),
            `"${orderDate}"`,
            `"${orderTime}"`,
            order.items.length,
            `"${itemNames}"`,
            `"${itemQuantities}"`,
            `"${itemPrices}"`
          ].join(',')
        })
      ].join('\n')

      // Add summary statistics at the end
      const summaryStats = [
        '',
        '',
        '',
        'SUMMARY STATISTICS',
        '',
        `Total Orders,${stats.totalOrders}`,
        `Pending Orders,${stats.pendingOrders}`,
        `Preparing Orders,${stats.preparingOrders}`,
        `Ready Orders,${stats.readyOrders}`,
        `Completed Orders,${stats.totalOrders - stats.pendingOrders - stats.preparingOrders - stats.readyOrders}`,
        `Total Revenue (₹),${stats.totalRevenue.toFixed(2)}`,
        `Average Order Value (₹),${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}`,
        `Export Date,${new Date().toLocaleString()}`
      ].join('\n')

      const finalContent = csvContent + '\n' + summaryStats

      // Create blob and download
      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      link.setAttribute('href', url)
      link.setAttribute('download', `smartdine_orders_export_${timestamp}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Successfully exported ${orders.length} orders with summary statistics!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export order data')
    }
  }

  const generateQRCode = async () => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qrForm),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setQrData(result.data)
          toast.success('QR code generated successfully')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to generate QR code')
      }
    } catch (error) {
      toast.error('Error generating QR code')
    }
  }

  const downloadQRCode = async () => {
    if (!qrData) return

    try {
      // Create a proper download link
      const link = document.createElement('a')
      
      if (qrData.format === 'svg') {
        // For SVG format, create a blob
        const svgBlob = new Blob([qrData.qrCode], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(svgBlob)
        link.href = svgUrl
        link.download = `qrcode-${Date.now()}.svg`
        
        // Clean up the object URL after download
        setTimeout(() => URL.revokeObjectURL(svgUrl), 100)
      } else {
        // For PNG/JPG, fetch the image and create a blob
        try {
          const response = await fetch(qrData.qrCode)
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)
          link.href = blobUrl
          link.download = `qrcode-${Date.now()}.${qrData.format}`
          
          // Clean up the object URL after download
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
        } catch (fetchError) {
          // Fallback to direct URL if fetch fails
          link.href = qrData.qrCode
          link.download = `qrcode-${Date.now()}.${qrData.format}`
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
        }
      }
      
      // Ensure proper download attributes
      link.style.display = 'none'
      document.body.appendChild(link)
      
      // Trigger the download
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      
      toast.success('QR code downloaded successfully to Downloads folder')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed. Try right-clicking the QR code and selecting "Save image as..."')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'PREPARING': return <ChefHat className="w-4 h-4" />
      case 'READY': return <CheckCircle className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'PREPARING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'READY': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-muted rounded w-48 sm:w-64 mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Manage your restaurant orders and menu
              </p>
              {adminUser && (
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate">Welcome, {adminUser.name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isClearing} className="text-xs sm:text-sm">
                      {isClearing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="hidden sm:inline">Clearing...</span>
                          <span className="sm:hidden">Clear</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Clear Order Data</span>
                          <span className="sm:hidden">Clear</span>
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Clear All Order Data
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm">
                        This action will permanently delete all orders and order items from the dashboard. 
                        Menu items and users will be preserved. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearDashboard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm">
                        Clear Order Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Customer View</span>
                  <span className="sm:hidden">View</span>
                </Button>
                <Button onClick={fetchOrders} variant="outline" size="sm" className="text-xs sm:text-sm">
                  <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">↻</span>
                </Button>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={exportOrderData} variant="outline" size="sm" disabled={orders.length === 0} className="text-xs sm:text-sm">
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Export {orders.length > 0 ? `(${orders.length})` : ''}</span>
                        <span className="sm:hidden">📊</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Download order data as CSV (compatible with Google Sheets)</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Preparing</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.preparingOrders}</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">₹{stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getOrderStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => window.innerWidth >= 640 ? `${name}: ${value}` : value}
                    outerRadius={window.innerWidth >= 640 ? 80 : 60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getOrderStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Category Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getCategoryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: window.innerWidth >= 640 ? 12 : 10 }}
                    angle={window.innerWidth >= 640 ? 0 : -45}
                    textAnchor={window.innerWidth >= 640 ? 'middle' : 'end'}
                    height={window.innerWidth >= 640 ? 60 : 80}
                  />
                  <YAxis tick={{ fontSize: window.innerWidth >= 640 ? 12 : 10 }} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Sales']}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Orders and Menu Management */}
        <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="orders" className="text-xs sm:text-sm">Orders</TabsTrigger>
            <TabsTrigger value="menu" className="text-xs sm:text-sm">Menu</TabsTrigger>
            <TabsTrigger value="tables" className="text-xs sm:text-sm">Tables</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{order.customer.name}</p>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-xs`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Table:</span> {order.table.number}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span> ₹{order.totalAmount}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Items:</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-xs flex justify-between">
                                  <span>{item.menuItem.name}</span>
                                  <span>×{item.quantity} = ₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-full text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PREPARING">Preparing</SelectItem>
                                <SelectItem value="READY">Ready</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Order #</TableHead>
                          <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                          <TableHead className="text-xs sm:text-sm">Table</TableHead>
                          <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                          <TableHead className="text-xs sm:text-sm">Status</TableHead>
                          <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">{order.orderNumber}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{order.customer.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{order.table.number}</TableCell>
                            <TableCell className="text-xs sm:text-sm">₹{order.totalAmount}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(order.status)} text-xs`}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  <span>{order.status}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-24 sm:w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pending</SelectItem>
                                  <SelectItem value="PREPARING">Preparing</SelectItem>
                                  <SelectItem value="READY">Ready</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {orders.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No orders found
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-base sm:text-lg">Menu Items</CardTitle>
                <Dialog open={isAddMenuItemOpen} onOpenChange={setIsAddMenuItemOpen}>
                  <DialogTrigger asChild>
                    <Button className="text-xs sm:text-sm">
                      <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Add Item</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Add Menu Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
                        <Input
                          id="name"
                          value={newMenuItem.name}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
                        <Textarea
                          id="description"
                          value={newMenuItem.description}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                          className="text-xs sm:text-sm"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price" className="text-xs sm:text-sm">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newMenuItem.price}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-xs sm:text-sm">Category</Label>
                        <Select value={newMenuItem.category} onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}>
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Starters">Starters</SelectItem>
                            <SelectItem value="Main Course">Main Course</SelectItem>
                            <SelectItem value="Desserts">Desserts</SelectItem>
                            <SelectItem value="Beverages">Beverages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="rating" className="text-xs sm:text-sm">Rating</Label>
                        <Input
                          id="rating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={newMenuItem.rating}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, rating: parseFloat(e.target.value) || 0 })}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="imageUrl" className="text-xs sm:text-sm">Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={newMenuItem.imageUrl}
                          onChange={(e) => setNewMenuItem({ ...newMenuItem, imageUrl: e.target.value })}
                          className="text-xs sm:text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isAvailable"
                          checked={newMenuItem.isAvailable}
                          onCheckedChange={(checked) => setNewMenuItem({ ...newMenuItem, isAvailable: checked })}
                        />
                        <Label htmlFor="isAvailable" className="text-xs sm:text-sm">Available</Label>
                      </div>
                      <Button onClick={addMenuItem} className="w-full text-xs sm:text-sm">
                        Add Item
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                  {menuItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No menu items found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex gap-3">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{item.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-xs">
                                  {item.isAvailable ? "Available" : "Unavailable"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{item.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-sm">₹{item.price}</span>
                              <div className="flex items-center">
                                <StarRating rating={item.rating || 0} readonly size="sm" />
                                <span className="ml-1 text-xs text-muted-foreground">({item.rating || 0})</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditMenuItem(item)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-base sm:text-lg">Delete Menu Item</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm">
                                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMenuItem(item.id)} className="text-sm">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Image</TableHead>
                          <TableHead className="text-xs sm:text-sm">Name</TableHead>
                          <TableHead className="text-xs sm:text-sm">Category</TableHead>
                          <TableHead className="text-xs sm:text-sm">Price</TableHead>
                          <TableHead className="text-xs sm:text-sm">Rating</TableHead>
                          <TableHead className="text-xs sm:text-sm">Available</TableHead>
                          <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{item.category}</TableCell>
                            <TableCell className="text-xs sm:text-sm">₹{item.price}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <StarRating rating={item.rating || 0} readonly />
                                <span className="ml-2 text-xs sm:text-sm text-muted-foreground">({item.rating || 0})</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-xs">
                                {item.isAvailable ? "Available" : "Unavailable"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditMenuItem(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-base sm:text-lg">Delete Menu Item</AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm">
                                        Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMenuItem(item.id)} className="text-sm">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {menuItems.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No menu items found
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Menu Item Dialog */}
            <Dialog open={isEditMenuItemOpen} onOpenChange={setIsEditMenuItemOpen}>
              <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Edit Menu Item</DialogTitle>
                </DialogHeader>
                {editingMenuItem && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name" className="text-xs sm:text-sm">Name</Label>
                      <Input
                        id="edit-name"
                        value={editingMenuItem.name}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, name: e.target.value })}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description" className="text-xs sm:text-sm">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editingMenuItem.description}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, description: e.target.value })}
                        className="text-xs sm:text-sm"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-price" className="text-xs sm:text-sm">Price</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={editingMenuItem.price}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, price: parseFloat(e.target.value) })}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-category" className="text-xs sm:text-sm">Category</Label>
                      <Select value={editingMenuItem.category} onValueChange={(value) => setEditingMenuItem({ ...editingMenuItem, category: value })}>
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Starters">Starters</SelectItem>
                          <SelectItem value="Main Course">Main Course</SelectItem>
                          <SelectItem value="Desserts">Desserts</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-rating" className="text-xs sm:text-sm">Rating</Label>
                      <Input
                        id="edit-rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editingMenuItem.rating}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, rating: parseFloat(e.target.value) })}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-imageUrl" className="text-xs sm:text-sm">Image URL</Label>
                      <Input
                        id="edit-imageUrl"
                        value={editingMenuItem.imageUrl}
                        onChange={(e) => setEditingMenuItem({ ...editingMenuItem, imageUrl: e.target.value })}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-isAvailable"
                        checked={editingMenuItem.isAvailable}
                        onCheckedChange={(checked) => setEditingMenuItem({ ...editingMenuItem, isAvailable: checked })}
                      />
                      <Label htmlFor="edit-isAvailable" className="text-xs sm:text-sm">Available</Label>
                    </div>
                    <Button onClick={updateMenuItem} className="w-full text-xs sm:text-sm">
                      Update Item
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="tables">
            <TableManagement />
          </TabsContent>
        </Tabs>

        {/* QR Generator Dialog */}
        <Dialog open={isQrGeneratorOpen} onOpenChange={setIsQrGeneratorOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">QR Code Generator</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Generate QR codes for menus, or any URL
              </p>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qrUrl" className="text-xs sm:text-sm">URL</Label>
                  <Input
                    id="qrUrl"
                    value={qrForm.url}
                    onChange={(e) => setQrForm({ ...qrForm, url: e.target.value })}
                    placeholder="https://your-restaurant.com/menu?table=1"
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qrSize" className="text-xs sm:text-sm">Size</Label>
                    <Select value={qrForm.size} onValueChange={(value) => setQrForm({ ...qrForm, size: value })}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">150x150</SelectItem>
                        <SelectItem value="200">200x200</SelectItem>
                        <SelectItem value="300">300x300</SelectItem>
                        <SelectItem value="500">500x500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="qrFormat" className="text-xs sm:text-sm">Format</Label>
                    <Select value={qrForm.format} onValueChange={(value) => setQrForm({ ...qrForm, format: value })}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={generateQRCode} 
                  className="w-full text-xs sm:text-sm"
                  disabled={!qrForm.url.trim()}
                >
                  Generate QR Code
                </Button>
              </div>

              {qrData && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-center mb-4">
                      {qrData.format === 'svg' ? (
                        <div dangerouslySetInnerHTML={{ __html: qrData.qrCode }} />
                      ) : (
                        <img 
                          src={qrData.qrCode} 
                          alt="QR Code" 
                          className="max-w-full h-auto cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => downloadQRCode()}
                          title="Click to download or right-click to save image as..."
                        />
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xs text-muted-foreground break-all">
                        {qrData.url}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button onClick={downloadQRCode} variant="outline" size="sm" className="text-xs">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          onClick={() => navigator.clipboard.writeText(qrData.url)}
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                        >
                          Copy URL
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Right-click the QR code and select "Save image as..." if download doesn't work
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}