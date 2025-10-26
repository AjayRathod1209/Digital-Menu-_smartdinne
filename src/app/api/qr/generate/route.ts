import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, createAuthResponse } from '@/lib/auth-api';

const generateQRSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  size: z.enum(['150', '200', '300', '500']).default('200'),
  format: z.enum(['png', 'svg', 'jpg']).default('png'),
});

export async function POST(request: NextRequest) {
  // Verify authentication
  const auth = await verifyAuth(request);
  if (!auth.success) {
    return createAuthResponse('Unauthorized');
  }

  try {
    const body = await request.json();
    const { url, size, format } = generateQRSchema.parse(body);

    // Generate QR code using QR Server API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=${format}&data=${encodeURIComponent(url)}`;
    
    // For SVG format, we need to handle it differently
    if (format === 'svg') {
      const response = await fetch(qrApiUrl);
      const svgData = await response.text();
      
      return NextResponse.json({
        success: true,
        data: {
          qrCode: svgData,
          format: 'svg',
          size: size,
          url: url,
          downloadUrl: qrApiUrl
        }
      });
    }

    // For PNG/JPG, return the API URL
    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrApiUrl,
        format: format,
        size: size,
        url: url,
        downloadUrl: qrApiUrl
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}