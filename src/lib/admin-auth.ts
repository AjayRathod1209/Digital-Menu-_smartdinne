import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminUser {
  userId: string
  email: string
  role: string
}

export function verifyAdminToken(request: NextRequest): AdminUser | null {
  try {
    // Get token from cookies
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function createAdminAuthMiddleware(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]) => {
    const admin = verifyAdminToken(request)

    if (!admin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Add admin user to request headers for downstream use
    request.headers.set('x-admin-user', JSON.stringify(admin))

    return handler(request, ...args)
  }
}