import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { memoryDatabase } from './memory-database';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header'
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check for developer bypass
    if (token === 'dev-bypass-token') {
      // Return default parent user for development
      return {
        success: true,
        user: {
          id: 'user-1',
          email: 'parent@test.com',
          role: 'parent',
          firstName: 'Sarah',
          lastName: 'Johnson'
        }
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded.userId) {
      return {
        success: false,
        error: 'Invalid token payload'
      };
    }

    // Get user from database
    const user = await memoryDatabase.getUserByEmail(decoded.email);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

// Alias for API route compatibility
export const authenticateUser = authenticateRequest;

// Generate token function
export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    {
      userId,
      role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    JWT_SECRET
  );
}

export function generateJWT(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
