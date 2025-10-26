'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, ExternalLink, Smartphone, CheckCircle, AlertCircle, Globe, QrCode } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentMethod: string) => void
  paymentMethod: 'phonepe' | 'paytm'
  amount: number
  orderNumber: string
  upiId: string
  transactionNote: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
  paymentMethod,
  amount,
  orderNumber,
  upiId,
  transactionNote
}: PaymentModalProps) {
  const [isCopiedUpi, setIsCopiedUpi] = useState(false)
  const [isCopiedNote, setIsCopiedNote] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'instructions' | 'processing' | 'completed'>('instructions')
  const [isOpeningApp, setIsOpeningApp] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)

  const copyToClipboard = (text: string, type: 'upi' | 'note') => {
    navigator.clipboard.writeText(text)
    if (type === 'upi') {
      setIsCopiedUpi(true)
      setTimeout(() => setIsCopiedUpi(false), 2000)
    } else {
      setIsCopiedNote(true)
      setTimeout(() => setIsCopiedNote(false), 2000)
    }
    toast.success('Copied to clipboard!')
  }

  const getPaymentDetails = () => {
    if (paymentMethod === 'phonepe') {
      return {
        name: 'PhonePe',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        icon: 'P',
        // Direct PhonePe business URL
        appUrls: [
          `https://business.phonepe.com/register?utm_source=homepage_banner_pg`,
        ],
        webUrl: `https://business.phonepe.com/register?utm_source=homepage_banner_pg`,
        universalUrl: `https://business.phonepe.com/register?utm_source=homepage_banner_pg`,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=SmartDine&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
      }
    } else {
      return {
        name: 'Paytm',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        icon: 'T',
        // Direct Paytm URL
        appUrls: [
          `https://paytm.com/`,
        ],
        webUrl: `https://paytm.com/`,
        universalUrl: `https://paytm.com/`,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=SmartDine&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
      }
    }
  }

  const tryOpenUrl = (url: string, target: string = '_blank') => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.target = target
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return true
    } catch (error) {
      console.error('Failed to open URL:', error)
      return false
    }
  }

  const openPaymentApp = async () => {
    setIsOpeningApp(true)
    const paymentDetails = getPaymentDetails()
    
    try {
      setPaymentStep('processing')
      
      // Direct navigation to the payment provider's website
      const newWindow = window.open(paymentDetails.webUrl, '_blank', 'width=450,height=700')
      
      if (newWindow) {
        toast.success(`${paymentDetails.name} website opened`, {
          description: 'Complete the payment in the new window',
          duration: 3000
        })
      } else {
        // If popup is blocked, redirect in the same window
        window.location.href = paymentDetails.webUrl
      }
      
      // Auto-complete payment after 30 seconds (for demo purposes)
      setTimeout(() => {
        setPaymentStep('completed')
        setTimeout(() => {
          onPaymentComplete(paymentMethod.toUpperCase())
        }, 2000)
      }, 30000)
      
    } catch (error) {
      console.error('Error opening payment website:', error)
      toast.error('Failed to open payment website. Please try again.')
    } finally {
      setIsOpeningApp(false)
    }
  }

  const openWebPayment = () => {
    const paymentDetails = getPaymentDetails()
    const webWindow = window.open(paymentDetails.webUrl, '_blank', 'width=450,height=700')
    
    if (webWindow) {
      toast.success(`${paymentDetails.name} website opened`, {
        description: 'Complete the payment in the new window',
        duration: 3000
      })
      setPaymentStep('processing')
      
      // Auto-complete payment after 30 seconds
      setTimeout(() => {
        setPaymentStep('completed')
        setTimeout(() => {
          onPaymentComplete(paymentMethod.toUpperCase())
        }, 2000)
      }, 30000)
    } else {
      toast.error('Please allow popups to open the payment page')
    }
  }

  const handlePaymentCompleted = () => {
    setPaymentStep('completed')
    setTimeout(() => {
      onPaymentComplete(paymentMethod.toUpperCase())
    }, 2000)
  }

  const resetModal = () => {
    setPaymentStep('instructions')
    setIsOpeningApp(false)
    setShowQrCode(false)
    onClose()
  }

  const paymentDetails = getPaymentDetails()

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentDetails.color}`}>
              <span className="text-lg font-bold">{paymentDetails.icon}</span>
            </div>
            <div>
              <div className="text-lg font-semibold">{paymentDetails.name} Payment</div>
              <div className="text-sm text-muted-foreground">Order #{orderNumber}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Display */}
          <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-0">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  ₹{amount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total Amount</div>
              </div>
            </CardContent>
          </Card>

          {paymentStep === 'instructions' && (
            <>
              {/* Payment Options */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold">Choose Payment Method</h4>
                    </div>
                    
                    <div className="grid gap-3">
                      <Button 
                        onClick={openPaymentApp}
                        className="w-full h-12 text-base"
                        disabled={isOpeningApp}
                      >
                        {isOpeningApp ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Opening {paymentDetails.name}...
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4 mr-2" />
                            Pay with {paymentDetails.name}
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={openWebPayment}
                        className="w-full h-12 text-base"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Open {paymentDetails.name} Website
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="w-full h-12 text-base"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {showQrCode ? 'Hide' : 'Show'} QR Code
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              {showQrCode && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h4 className="font-semibold">Scan QR Code</h4>
                      <div className="flex justify-center">
                        <img 
                          src={paymentDetails.qrUrl} 
                          alt={`${paymentDetails.name} QR Code`}
                          className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code with any UPI app
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">UPI ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted/50 border rounded-lg px-3 py-2.5 text-sm font-mono">
                      {upiId}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(upiId, 'upi')}
                      className="shrink-0"
                    >
                      {isCopiedUpi ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction Note</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-muted/50 border rounded-lg px-3 py-2.5 text-sm">
                      {transactionNote}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(transactionNote, 'note')}
                      className="shrink-0"
                    >
                      {isCopiedNote ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={resetModal} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handlePaymentCompleted} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Payment Completed
                </Button>
              </div>
            </>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Payment in Progress</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Complete the payment in {paymentDetails.name}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Keep this page open. We'll automatically detect when payment is completed.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPaymentStep('instructions')} className="flex-1">
                  Back to Options
                </Button>
                <Button onClick={handlePaymentCompleted} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Payment Completed
                </Button>
              </div>
            </div>
          )}

          {paymentStep === 'completed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Payment Successful!</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Redirecting to order confirmation...
                </p>
              </div>
              <div className="w-full bg-green-100 dark:bg-green-900/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}