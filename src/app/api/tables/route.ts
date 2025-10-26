import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tables = await db.table.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { number, qrCode } = await request.json();

    if (!number) {
      return NextResponse.json(
        { error: 'Table number is required' },
        { status: 400 }
      );
    }

    // Generate QR code URL if not provided
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const tableQrCode = qrCode || `${baseUrl}?table=${number}`;
    
    const table = await db.table.create({
      data: {
        number,
        qrCode: tableQrCode,
        isActive: true
      }
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}