import type { Context } from "https://edge.netlify.com";

// Performance monitoring configuration
const MONITORING_CONFIG = {
  // Sample rate for performance metrics (10% of requests)
  performanceSampleRate: 0.1,
  // Sample rate for error tracking (100% of errors)
  errorSampleRate: 1.0,
  // Endpoints to monitor
  monitoredPaths: ['/api/', '/auth/', '/portal/'],
  // Performance thresholds
  thresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05 // 5%
  }
};

// In-memory metrics store (in production, use time-series database)
const metricsStore = {
  requests: new Map<string, number>(),
  errors: new Map<string, number>(),
  responseTimes: new Map<string, number[]>(),
  lastCleanup: Date.now()
};

function shouldMonitor(path: string): boolean {
  return MONITORING_CONFIG.monitoredPaths.some(prefix => path.startsWith(prefix));
}

function shouldSample(sampleRate: number): boolean {
  return Math.random() < sampleRate;
}

function recordMetric(key: string, value: number) {
  const current = metricsStore.requests.get(key) || 0;
  metricsStore.requests.set(key, current + 1);

  if (!metricsStore.responseTimes.has(key)) {
    metricsStore.responseTimes.set(key, []);
  }

  const times = metricsStore.responseTimes.get(key)!;
  times.push(value);

  // Keep only last 100 measurements
  if (times.length > 100) {
    times.shift();
  }
}

function recordError(key: string, error: any) {
  const current = metricsStore.errors.get(key) || 0;
  metricsStore.errors.set(key, current + 1);

  // Log error details (in production, send to error tracking service)
  console.error(`API Error [${key}]:`, {
    timestamp: new Date().toISOString(),
    error: error.message || 'Unknown error',
    stack: error.stack
  });
}

function cleanupMetrics() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Clean up old metrics every hour
  if (now - metricsStore.lastCleanup > oneHour) {
    // Reset counters (in production, archive to time-series DB)
    metricsStore.requests.clear();
    metricsStore.errors.clear();
    metricsStore.responseTimes.clear();
    metricsStore.lastCleanup = now;
  }
}

function getPerformanceReport() {
  const report: any = {
    timestamp: new Date().toISOString(),
    endpoints: {}
  };

  for (const [endpoint, requestCount] of metricsStore.requests.entries()) {
    const errorCount = metricsStore.errors.get(endpoint) || 0;
    const responseTimes = metricsStore.responseTimes.get(endpoint) || [];

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const errorRate = requestCount > 0 ? errorCount / requestCount : 0;

    report.endpoints[endpoint] = {
      requests: requestCount,
      errors: errorCount,
      errorRate: errorRate,
      avgResponseTime: Math.round(avgResponseTime),
      status: {
        healthy: errorRate < MONITORING_CONFIG.thresholds.errorRate &&
                avgResponseTime < MONITORING_CONFIG.thresholds.responseTime,
        warnings: []
      }
    };

    // Add warnings for performance issues
    if (errorRate >= MONITORING_CONFIG.thresholds.errorRate) {
      report.endpoints[endpoint].status.warnings.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    if (avgResponseTime >= MONITORING_CONFIG.thresholds.responseTime) {
      report.endpoints[endpoint].status.warnings.push(`Slow response time: ${avgResponseTime}ms`);
    }
  }

  return report;
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle performance report requests
  if (path === '/api/monitoring/performance' && request.method === 'GET') {
    const authHeader = request.headers.get('authorization');

    // Simple auth check (in production, use proper authentication)
    if (!authHeader?.includes('monitoring-token')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    cleanupMetrics();
    const report = getPerformanceReport();

    return new Response(
      JSON.stringify(report, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }

  // Skip monitoring for non-monitored paths
  if (!shouldMonitor(path)) {
    return;
  }

  // Skip sampling if not selected
  if (!shouldSample(MONITORING_CONFIG.performanceSampleRate)) {
    return;
  }

  const startTime = Date.now();
  let response: Response | undefined;
  let error: any = null;

  try {
    response = await context.next();
  } catch (e) {
    error = e;
    // Create error response
    response = new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const endTime = Date.now();
  const responseTime = endTime - startTime;
  const endpoint = path;

  // Record metrics
  recordMetric(endpoint, responseTime);

  // Record errors
  if (error || (response && response.status >= 400)) {
    recordError(endpoint, error || new Error(`HTTP ${response?.status}`));
  }

  // Add performance headers
  if (response) {
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('X-Timestamp', new Date().toISOString());

    // Add performance warning headers if thresholds exceeded
    if (responseTime > MONITORING_CONFIG.thresholds.responseTime) {
      response.headers.set('X-Performance-Warning', 'slow-response');
    }
  }

  // Clean up old metrics periodically
  cleanupMetrics();

  return response;
};
