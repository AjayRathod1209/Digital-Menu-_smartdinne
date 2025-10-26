'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, QrCode, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner'
import { generateQRCodeDataURL, downloadQRCode } from '@/lib/qr-code';

interface Table {
  id: string;
  number: string;
  qrCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [isHosted, setIsHosted] = useState(false);
  const [customHostedUrl, setCustomHostedUrl] = useState('');
  const [formData, setFormData] = useState({
    number: '',
    qrCode: '',
    isActive: true
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTable ? `/api/tables/${editingTable.id}` : '/api/tables';
      const method = editingTable ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingTable ? 'Table updated successfully' : 'Table added successfully');
        fetchTables();
        setIsAddDialogOpen(false);
        setEditingTable(null);
        setFormData({ number: '', qrCode: '', isActive: true });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save table');
      }
    } catch (error) {
      toast.error('Failed to save table');
    }
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      qrCode: table.qrCode,
      isActive: table.isActive
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (table: Table) => {
    // Check if table has existing orders first
    try {
      const response = await fetch(`/api/tables/${table.id}/orders`);
      if (response.ok) {
        const data = await response.json();
        if (data.orderCount > 0) {
          // Show detailed error with order information
          const confirmMessage = `Table ${table.number} has ${data.orderCount} order(s). You must delete the orders first before deleting the table.\n\nOrders: ${data.orders?.map((o: any) => o.orderNumber).join(', ') || 'Unknown'}\n\nDo you want to proceed with deleting the orders and table?`;
          
          if (confirm(confirmMessage)) {
            // Delete all orders first
            for (const order of data.orders || []) {
              await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
            }
            
            // Then delete the table
            const deleteResponse = await fetch(`/api/tables/${table.id}`, {
              method: 'DELETE',
            });

            if (deleteResponse.ok) {
              toast.success('Table and associated orders deleted successfully');
              fetchTables();
            } else {
              const error = await deleteResponse.json();
              toast.error(error.error || 'Failed to delete table');
            }
          }
          return;
        }
      }
    } catch (error) {
      console.error('Error checking table orders:', error);
    }

    // Original delete logic for tables without orders
    if (!confirm(`Are you sure you want to delete ${table.number}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Table deleted successfully');
        fetchTables();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete table');
      }
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const toggleTableStatus = async (table: Table) => {
    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !table.isActive }),
      });

      if (response.ok) {
        toast.success(`Table ${!table.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchTables();
      } else {
        toast.error('Failed to update table status');
      }
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  const getQrCodeUrl = (tableNumber: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const localUrl = `${baseUrl}?table=${tableNumber}`;
    
    // If hosted mode is enabled, use custom hosted URL or default
    if (isHosted) {
      if (customHostedUrl.trim()) {
        // Use custom hosted URL
        const url = customHostedUrl.trim();
        // Add table parameter if not already present
        if (url.includes('?table=')) {
          return url;
        } else if (url.includes('?')) {
          return `${url}&table=${tableNumber}`;
        } else {
          return `${url}?table=${tableNumber}`;
        }
      } else {
        // Use default hosted URL
        const hostedBaseUrl = 'https://smartdine-demo.vercel.app';
        return `${hostedBaseUrl}?table=${tableNumber}`;
      }
    }
    
    return localUrl;
  };

  const generateQRCode = async (table: Table) => {
    try {
      setQrCodeDataURL(''); // Clear previous QR code
      const dataURL = await generateQRCodeDataURL(getQrCodeUrl(table.number), 200);
      setQrCodeDataURL(dataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      // Fallback to external service
      setQrCodeDataURL(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getQrCodeUrl(table.number))}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Table Management</h2>
          <p className="text-muted-foreground">Manage restaurant tables and generate QR codes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTable(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="number">Table Number</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="e.g., TABLE1, T1, Window-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="qrCode">QR Code URL (Optional)</Label>
                <Input
                  id="qrCode"
                  value={formData.qrCode}
                  onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                  placeholder="Auto-generated if left empty"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingTable(null);
                    setFormData({ number: '', qrCode: '', isActive: true });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTable ? 'Update' : 'Create'} Table
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{table.number}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={table.isActive ? "default" : "secondary"}>
                      {table.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(table)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(table)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(table.createdAt).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleTableStatus(table)}
                  >
                    {table.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setQrTable(table);
                          // Reset states when opening dialog
                          setIsHosted(false);
                          setCustomHostedUrl('');
                          await generateQRCode(table);
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>QR Code for {table.number}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Hosted URL Toggle */}
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="space-y-0.5">
                            <Label htmlFor="hosted-qr" className="text-sm font-medium">Use Hosted URL</Label>
                            <p className="text-xs text-muted-foreground">
                              Generate QR code with production URL
                            </p>
                          </div>
                          <Switch
                            id="hosted-qr"
                            checked={isHosted}
                            onCheckedChange={(checked) => {
                              setIsHosted(checked);
                              // Regenerate QR code with new URL setting
                              if (qrTable) {
                                generateQRCode(qrTable);
                              }
                            }}
                          />
                        </div>

                        {/* Custom Hosted URL Input */}
                        {isHosted && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-hosted-url" className="text-sm font-medium">
                              Custom Hosted URL (Optional)
                            </Label>
                            <Input
                              id="custom-hosted-url"
                              type="url"
                              placeholder="https://your-restaurant-domain.com"
                              value={customHostedUrl}
                              onChange={(e) => {
                                setCustomHostedUrl(e.target.value);
                                // Auto-regenerate QR code when URL changes
                                if (qrTable) {
                                  setTimeout(() => generateQRCode(qrTable), 500);
                                }
                              }}
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty to use default hosted URL. Table parameter will be added automatically.
                            </p>
                          </div>
                        )}

                        <div className="bg-white p-4 rounded-lg flex justify-center">
                          {qrCodeDataURL ? (
                            <img
                              src={qrCodeDataURL}
                              alt={`QR Code for ${qrTable?.number}`}
                              className="w-48 h-48"
                            />
                          ) : (
                            <div className="w-48 h-48 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                            <p className="text-sm text-muted-foreground">
                              Customers can scan this QR code to access the menu directly at {qrTable?.number}
                            </p>
                            {isHosted && customHostedUrl.trim() && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Custom Hosted
                              </span>
                            )}
                            {isHosted && !customHostedUrl.trim() && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Default Hosted
                              </span>
                            )}
                            {!isHosted && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                Local
                              </span>
                            )}
                          </div>
                          <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                            {qrTable && getQrCodeUrl(qrTable.number)}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (qrTable) {
                                navigator.clipboard.writeText(getQrCodeUrl(qrTable.number));
                                toast.success('URL copied to clipboard');
                              }
                            }}
                          >
                            Copy URL
                          </Button>
                          <Button
                            onClick={async () => {
                              if (qrTable) {
                                try {
                                  toast.loading('Downloading QR code...');
                                  
                                  // Try local download first
                                  try {
                                    await downloadQRCode(getQrCodeUrl(qrTable.number), `qr-${qrTable.number}.png`, 300);
                                    toast.success('QR Code downloaded successfully!');
                                  } catch (localError) {
                                    // Fallback to external QR code download
                                    const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getQrCodeUrl(qrTable.number))}`);
                                    const blob = await response.blob();
                                    
                                    const blobUrl = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = blobUrl;
                                    link.download = `qr-${qrTable.number}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(blobUrl);
                                    
                                    toast.success('QR Code downloaded successfully!');
                                  }
                                } catch (error) {
                                  console.error('Download failed:', error);
                                  toast.error('Failed to download QR code. Please try copying the URL instead.');
                                }
                              }
                            }}
                          >
                            Download QR
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No tables found</h3>
              <p className="mb-4">Add your first table to get started with QR code menu ordering</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Table
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}