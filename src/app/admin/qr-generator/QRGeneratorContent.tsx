'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QrCode, Download, Copy, Link, Settings, ImageIcon, Globe } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface QRCodeData {
  qrCode: string;
  format: string;
  size: string;
  url: string;
  downloadUrl: string;
}

export default function QRGeneratorContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [size, setSize] = useState('200');
  const [format, setFormat] = useState('png');
  const [isHosted, setIsHosted] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<QRCodeData[]>([]);

  // Set URL from search params on mount
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

  const presetUrls = [
    { name: 'Restaurant Menu', url: 'http://localhost:3000' },
    { name: 'Hosted Menu', url: 'https://smartdine-demo.vercel.app' },
  ];

  const setPresetUrl = (presetUrl: string) => {
    setUrl(presetUrl);
  };

  const getFinalUrl = (inputUrl: string) => {
    if (!inputUrl.trim()) return '';
    
    // If hosted mode is enabled, and the URL looks like a local URL
    if (isHosted && (inputUrl.includes('localhost:3000') || inputUrl.includes('127.0.0.1:3000'))) {
      // Replace localhost with hosted URL
      const hostedBaseUrl = 'https://smartdine-demo.vercel.app';
      const tableParam = inputUrl.includes('?table=') ? inputUrl.split('?table=')[1] : '';
      return tableParam ? `${hostedBaseUrl}?table=${tableParam}` : hostedBaseUrl;
    }
    
    return inputUrl;
  };

  const generateQRCode = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsGenerating(true);
    try {
      const finalUrl = getFinalUrl(url);
      
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: finalUrl,
          size,
          format,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setQrData({ ...result.data, url: finalUrl });
        setHistory(prev => [{ ...result.data, url: finalUrl }, ...prev.slice(0, 4)]); // Keep last 5 items
        toast.success('QR code generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate QR code');
      }
    } catch (error) {
      toast.error('Error generating QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = async (data: QRCodeData) => {
    try {
      if (data.format === 'svg') {
        // Download SVG
        const blob = new Blob([data.qrCode], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Download PNG/JPG
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `qr-code-${Date.now()}.${data.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate QR codes for any URL or link with customizable options
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Generator Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                QR Code Settings
              </CardTitle>
              <CardDescription>
                Configure your QR code parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateQRCode()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger>
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
                  <Label htmlFor="format">Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hosted">Use Hosted URL</Label>
                  <p className="text-xs text-muted-foreground">
                    Convert localhost to production URL
                  </p>
                </div>
                <Switch
                  id="hosted"
                  checked={isHosted}
                  onCheckedChange={setIsHosted}
                />
              </div>

              <div>
                <Label>Quick Links</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {presetUrls.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setPresetUrl(preset.url)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateQRCode} 
                disabled={isGenerating}
                className="w-full"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                QR Code Preview
              </CardTitle>
              <CardDescription>
                Your generated QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qrData ? (
                <div className="space-y-4">
                  {/* URL Preview */}
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Final URL</span>
                      {isHosted && url.includes('localhost') && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Hosted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono truncate flex-1">
                        {qrData.url}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(qrData.url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center p-6 bg-muted rounded-lg">
                    {qrData.format === 'svg' ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: qrData.qrCode }}
                        className="w-48 h-48"
                      />
                    ) : (
                      <img 
                        src={qrData.qrCode} 
                        alt="QR Code" 
                        className="w-48 h-48"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => downloadQRCode(qrData)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => copyToClipboard(qrData.downloadUrl)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Format: {qrData.format.toUpperCase()} | Size: {qrData.size}x{qrData.size}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <QrCode className="h-12 w-12 mb-4" />
                  <p className="text-center">Enter a URL and click generate to create your QR code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent QR Codes</CardTitle>
              <CardDescription>
                Your recently generated QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {history.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {item.format === 'svg' ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: item.qrCode }}
                            className="w-16 h-16"
                          />
                        ) : (
                          <img 
                            src={item.qrCode} 
                            alt="QR Code" 
                            className="w-16 h-16"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.url}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.format.toUpperCase()} • {item.size}px
                        </p>
                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadQRCode(item)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.url)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}