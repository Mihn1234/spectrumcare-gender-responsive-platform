import type { Context } from "https://edge.netlify.com";

// Rate limiting configuration
const RATE_LIMITS = {
  // API endpoints with different limits
  '/api/auth': { requests: 10, window: 60 * 1000 }, // 10 requests per minute
  '/api/payments': { requests: 20, window: 60 * 1000 }, // 20 requests per minute
  '/api/upload': { requests: 5, window: 60 * 1000 }, // 5 uploads per minute
  '/api/realtime': { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  'default': { requests: 50, window: 60 * 1000 } // 50 requests per minute default
};

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(path: string) {
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (pattern !== 'default' && path.startsWith(pattern)) {
      return limit;
    }
  }
  return RATE_LIMITS.default;
}

function getClientIdentifier(request: Request): string {
  // Get client IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

  // Include user agent for additional identification
  const userAgent = request.headers.get('user-agent') || '';

  return `${ip}:${userAgent.slice(0, 50)}`;
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip rate limiting for non-API routes
  if (!path.startsWith('/api/')) {
    return;
  }

  const clientId = getClientIdentifier(request);
  const rateLimit = getRateLimit(path);
  const key = `${clientId}:${path}`;
  const now = Date.now();

  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }

  // Get or create rate limit entry
  let rateLimitData = rateLimitStore.get(key);

  if (!rateLimitData || rateLimitData.resetTime < now) {
    rateLimitData = {
      count: 0,
      resetTime: now + rateLimit.window
    };
  }

  // Increment request count
  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);

  // Check if limit exceeded
  if (rateLimitData.count > rateLimit.requests) {
    const resetInSeconds = Math.ceil((rateLimitData.resetTime - now) / 1000);

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${rateLimit.requests} requests per ${rateLimit.window / 1000} seconds`,
        retryAfter: resetInSeconds
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.requests.toString(),
          'X-RateLimit-Remaining': Math.max(0, rateLimit.requests - rateLimitData.count).toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitData.resetTime / 1000).toString(),
          'Retry-After': resetInSeconds.toString()
        }
      }
    );
  }

  // Add rate limit headers to successful requests
  const response = await context.next();

  if (response) {
    response.headers.set('X-RateLimit-Limit', rateLimit.requests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimit.requests - rateLimitData.count).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000).toString());
  }

  return response;
};
