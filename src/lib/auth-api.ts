import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; user?: JWTPayload; error?: string }> {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('admin-token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    return { 
      success: true, 
      user: decoded 
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Invalid token' };
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}