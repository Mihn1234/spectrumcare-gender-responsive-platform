import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor } from '@/services/monitoring/performance-monitor';

const monitor = new PerformanceMonitor();

export async function performanceMiddleware(req: NextRequest) {
  const startTime = Date.now();

  await monitor.recordMetric('request_count', 1, {
    method: req.method,
    path: req.nextUrl.pathname,
    user_agent: req.headers.get('User-Agent') || 'unknown'
  });

  const response = NextResponse.next();

  const duration = Date.now() - startTime;

  await monitor.recordMetric('response_time', duration, {
    method: req.method,
    path: req.nextUrl.pathname,
    status_code: response.status.toString()
  });

  if (response.status >= 400) {
    await monitor.recordMetric('error_count', 1, {
      method: req.method,
      path: req.nextUrl.pathname,
      status_code: response.status.toString()
    });
  }

  return response;
}

export function createPerformanceTracker() {
  return {
    recordMetric: (name: string, value: number, tags?: Record<string, string>) =>
      monitor.recordMetric(name, value, tags),
    getMetrics: (name: string, timeRange?: number) =>
      monitor.getMetrics(name, timeRange),
    calculateAggregates: (name: string, timeRange?: number) =>
      monitor.calculateAggregates(name, timeRange)
  };
}
