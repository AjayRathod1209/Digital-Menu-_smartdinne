'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentInstructionsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  paymentMethod: 'phonepe' | 'paytm'
  amount: number
  upiId: string
  transactionNote: string
  orderNumber: string
}

export function PaymentInstructionsModal({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  amount,
  upiId,
  transactionNote,
  orderNumber
}: PaymentInstructionsModalProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  const getPaymentColor = () => {
    return paymentMethod === 'phonepe' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  const getPaymentIcon = () => {
    return paymentMethod === 'phonepe' ? 'P' : 'T'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPaymentColor()}`}>
              <span className="text-sm font-bold">{getPaymentIcon()}</span>
            </div>
            {paymentMethod === 'phonepe' ? 'PhonePe' : 'Paytm'} Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">₹{amount}</div>
            <Badge variant="outline" className="text-xs">
              Order {orderNumber}
            </Badge>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm">Payment Instructions:</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>{paymentMethod === 'phonepe' ? 'PhonePe' : 'Paytm'} app will open automatically</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>If app doesn't open, your UPI app will open</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>Pay to the UPI ID below</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                <span>Use the transaction note exactly as shown</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">5.</span>
                <span>Return to this page after payment</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">UPI ID</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-background border rounded px-3 py-2 text-sm font-mono">
                  {upiId}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(upiId)}
                  className="shrink-0"
                >
                  {isCopied ? 'Copied!' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Transaction Note</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-background border rounded px-3 py-2 text-sm">
                  {transactionNote}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(transactionNote)}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Keep this page open while making payment
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Payment App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}