'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, ChefHat, Truck, Phone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface OrderDetails {
  orderNumber: string
  totalAmount: number
  paymentMethod: string
  tableNumber: string
  customerName: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get order details from URL params or localStorage
    const urlOrderDetails = {
      orderNumber: searchParams.get('orderNumber') || '',
      totalAmount: parseFloat(searchParams.get('totalAmount') || '0'),
      paymentMethod: searchParams.get('paymentMethod') || '',
      tableNumber: searchParams.get('tableNumber') || '',
      customerName: searchParams.get('customerName') || ''
    }

    // Try to get from localStorage if URL params are incomplete
    if (!urlOrderDetails.orderNumber) {
      try {
        const storedOrder = localStorage.getItem('lastOrder')
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder)
          setOrderDetails(parsedOrder)
        }
      } catch (error) {
        console.error('Error parsing stored order:', error)
      }
    } else {
      setOrderDetails(urlOrderDetails)
    }

    setIsLoading(false)
  }, [searchParams])

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'phonepe':
        return { name: 'PhonePe', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' }
      case 'paytm':
        return { name: 'Paytm', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' }
      case 'cash_on_service':
        return { name: 'Cash on Service', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' }
      default:
        return { name: method, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' }
    }
  }

  const getStatusSteps = () => {
    return [
      { icon: CheckCircle, label: 'Order Placed', completed: true },
      { icon: Clock, label: 'Payment Confirmed', completed: true },
      { icon: ChefHat, label: 'Preparing', completed: false },
      { icon: Truck, label: 'Ready to Serve', completed: false }
    ]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find your order details. Please contact support.
            </p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const paymentMethod = getPaymentMethodDisplay(orderDetails.paymentMethod)
  const statusSteps = getStatusSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Order Successful!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your order. We're preparing it now.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Details
                  <Badge variant="outline" className="text-sm">
                    #{orderDetails.orderNumber}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{orderDetails.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Table Number</p>
                    <p className="font-medium">{orderDetails.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={paymentMethod.color}>
                        {paymentMethod.name}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-lg">₹{orderDetails.totalAmount}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Order Status</p>
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => (
                      <div key={index} className="flex flex-col items-center text-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          step.completed 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs ${
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      Your order has been received and confirmed by the restaurant.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Preparation</p>
                    <p className="text-sm text-muted-foreground">
                      Our chefs are preparing your delicious meal with care.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Ready to Serve</p>
                    <p className="text-sm text-muted-foreground">
                      We'll notify you when your order is ready to be served at your table.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimated Time */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    20-25
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Minutes Estimated
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    Your order will be ready soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Restaurant Support</p>
                    <p className="text-xs text-muted-foreground">Call our staff for assistance</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Staff
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Menu
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full">
                View Order Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}