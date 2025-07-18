import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/health',
  '/api/status',
  '/api/professionals', // Public professional listings
  '/api/seed' // For demo purposes
];

// Routes that require specific roles
const roleBasedRoutes = {
  '/api/admin': ['admin'],
  '/api/professionals/verify': ['admin'],
  '/api/la-staff': ['la_staff', 'admin']
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check authentication for API routes
  if (pathname.startsWith('/api/')) {
    return handleAPIAuth(request);
  }

  // For non-API routes, check if user is authenticated via localStorage on client side
  // In a real app, this would use httpOnly cookies
  return NextResponse.next();
}

async function handleAPIAuth(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');

  // For development, also allow x-user-id header for testing
  const userIdHeader = request.headers.get('x-user-id');
  if (userIdHeader && process.env.NODE_ENV === 'development') {
    const response = NextResponse.next();
    response.headers.set('x-authenticated-user', userIdHeader);
    response.headers.set('x-user-id', userIdHeader);
    response.headers.set('x-user-role', 'parent'); // Default role for demo
    return response;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  try {
    // Simple token validation for Edge Runtime compatibility
    // In production, you would use a more secure validation method
    const decoded = await verifyTokenEdgeCompatible(token);

    // For demo purposes, trust the JWT token without additional user validation
    // In production, you would validate against the database
    const user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      firstName: 'Demo',
      lastName: 'User',
      isActive: true
    };

    // Check role-based access
    const { pathname } = request.nextUrl;
    const requiredRoles = Object.entries(roleBasedRoutes).find(([route]) =>
      pathname.startsWith(route)
    )?.[1];

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user info to request headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-authenticated-user', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    }));

    return response;

  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}

// Edge Runtime compatible token verification
async function verifyTokenEdgeCompatible(token: string): Promise<any> {
  // For demo purposes, we'll do basic token parsing
  // In production, use a proper JWT library compatible with Edge Runtime
  // or verify tokens against a service

  try {
    // Basic base64 decoding for demo
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(parts[1]));

    // Basic validation
    if (!payload.userId || !payload.email || !payload.role) {
      throw new Error('Invalid token payload');
    }

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
