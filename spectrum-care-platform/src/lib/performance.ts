// Performance Monitoring and Caching System for SpectrumCare Platform
import Redis from 'ioredis';
import { z } from 'zod';
import { Database } from './database';

// Performance configuration schema
const performanceConfigSchema = z.object({
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(6379),
    password: z.string().optional(),
    db: z.number().default(0),
    keyPrefix: z.string().default('spectrum:'),
    retryDelayOnFailover: z.number().default(100),
    maxRetriesPerRequest: z.number().default(3),
    lazyConnect: z.boolean().default(true)
  }),
  cache: z.object({
    defaultTTL: z.number().default(3600), // 1 hour
    maxMemory: z.string().default('256mb'),
    evictionPolicy: z.string().default('allkeys-lru')
  }),
  metrics: z.object({
    collectInterval: z.number().default(60000), // 1 minute
    retentionDays: z.number().default(30),
    alertThresholds: z.object({
      responseTime: z.number().default(1000), // 1 second
      errorRate: z.number().default(0.05), // 5%
      cpuUsage: z.number().default(0.8), // 80%
      memoryUsage: z.number().default(0.9) // 90%
    })
  })
});

type PerformanceConfig = z.infer<typeof performanceConfigSchema>;

// ============================================================================
// REDIS CACHE SERVICE
// ============================================================================

export class CacheService {
  private static instance: CacheService;
  private redis: Redis;
  private config: PerformanceConfig['redis'];

  private constructor() {
    this.config = this.getConfig().redis;
    this.redis = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      lazyConnect: this.config.lazyConnect,
      family: 4, // Use IPv4
      keepAlive: 30000,
      commandTimeout: 5000,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      MetricsCollector.incrementCounter('cache_errors_total');
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      console.log('Redis ready for operations');
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private getConfig(): PerformanceConfig {
    return performanceConfigSchema.parse({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'spectrum:',
        retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
        maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
        lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false'
      },
      cache: {
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
        maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
        evictionPolicy: process.env.REDIS_EVICTION_POLICY || 'allkeys-lru'
      },
      metrics: {
        collectInterval: parseInt(process.env.METRICS_COLLECT_INTERVAL || '60000'),
        retentionDays: parseInt(process.env.METRICS_RETENTION_DAYS || '30'),
        alertThresholds: {
          responseTime: parseInt(process.env.ALERT_RESPONSE_TIME || '1000'),
          errorRate: parseFloat(process.env.ALERT_ERROR_RATE || '0.05'),
          cpuUsage: parseFloat(process.env.ALERT_CPU_USAGE || '0.8'),
          memoryUsage: parseFloat(process.env.ALERT_MEMORY_USAGE || '0.9')
        }
      }
    });
  }

  // Basic cache operations
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const start = Date.now();
      const value = await this.redis.get(key);
      const duration = Date.now() - start;

      MetricsCollector.recordHistogram('cache_operation_duration', duration, { operation: 'get' });

      if (value === null) {
        MetricsCollector.incrementCounter('cache_misses_total');
        return null;
      }

      MetricsCollector.incrementCounter('cache_hits_total');
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      MetricsCollector.incrementCounter('cache_errors_total', { operation: 'get' });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const start = Date.now();
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds || this.getConfig().cache.defaultTTL;

      await this.redis.setex(key, ttl, serialized);

      const duration = Date.now() - start;
      MetricsCollector.recordHistogram('cache_operation_duration', duration, { operation: 'set' });
      MetricsCollector.incrementCounter('cache_sets_total');

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      MetricsCollector.incrementCounter('cache_errors_total', { operation: 'set' });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const start = Date.now();
      const result = await this.redis.del(key);

      const duration = Date.now() - start;
      MetricsCollector.recordHistogram('cache_operation_duration', duration, { operation: 'del' });
      MetricsCollector.incrementCounter('cache_deletes_total');

      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      MetricsCollector.incrementCounter('cache_errors_total', { operation: 'del' });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }

  // Advanced cache operations
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      const ttl = ttlSeconds || this.getConfig().cache.defaultTTL;

      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Cache invalidation
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.redis.del(...keys);
      MetricsCollector.incrementCounter('cache_invalidations_total');
      return result;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const pingTime = Date.now() - start;

      const info = await this.redis.info('memory');
      const memoryInfo = this.parseRedisInfo(info);

      return {
        status: 'healthy',
        details: {
          ping_time: `${pingTime}ms`,
          connected: this.redis.status === 'ready',
          memory_usage: memoryInfo.used_memory_human,
          total_commands_processed: memoryInfo.total_commands_processed
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    info.split('\r\n').forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    });
    return result;
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

// ============================================================================
// METRICS COLLECTION SERVICE
// ============================================================================

interface MetricData {
  name: string;
  type: 'counter' | 'histogram' | 'gauge';
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

interface HistogramBucket {
  le: number; // Less than or equal to
  count: number;
}

export class MetricsCollector {
  private static metrics: Map<string, MetricData> = new Map();
  private static histograms: Map<string, number[]> = new Map();
  private static db = Database.getInstance();

  // Counter metrics
  static incrementCounter(name: string, labels?: Record<string, string>, increment: number = 1): void {
    const key = this.generateKey(name, labels);
    const existing = this.metrics.get(key);

    const metric: MetricData = {
      name,
      type: 'counter',
      value: (existing?.value || 0) + increment,
      labels,
      timestamp: new Date()
    };

    this.metrics.set(key, metric);
  }

  // Histogram metrics (for timing, sizes, etc.)
  static recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.generateKey(name, labels);

    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }

    this.histograms.get(key)!.push(value);

    // Keep only last 1000 values to prevent memory bloat
    const values = this.histograms.get(key)!;
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
  }

  // Gauge metrics (current state)
  static setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.generateKey(name, labels);

    const metric: MetricData = {
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date()
    };

    this.metrics.set(key, metric);
  }

  // Get metric value
  static getMetric(name: string, labels?: Record<string, string>): MetricData | null {
    const key = this.generateKey(name, labels);
    return this.metrics.get(key) || null;
  }

  // Get histogram statistics
  static getHistogramStats(name: string, labels?: Record<string, string>): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const key = this.generateKey(name, labels);
    const values = this.histograms.get(key);

    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      count,
      sum,
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    };
  }

  // Export metrics in Prometheus format
  static exportPrometheusMetrics(): string {
    const lines: string[] = [];

    // Export counters and gauges
    for (const [key, metric] of this.metrics) {
      const labelsStr = metric.labels
        ? '{' + Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}'
        : '';

      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      lines.push(`${metric.name}${labelsStr} ${metric.value}`);
    }

    // Export histograms
    for (const [key, values] of this.histograms) {
      const [name, labelsJson] = key.split('|');
      const labels = labelsJson ? JSON.parse(labelsJson) : {};
      const stats = this.getHistogramStats(name, labels);

      if (stats) {
        const labelsStr = Object.keys(labels).length > 0
          ? '{' + Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}'
          : '';

        lines.push(`# TYPE ${name} histogram`);
        lines.push(`${name}_count${labelsStr} ${stats.count}`);
        lines.push(`${name}_sum${labelsStr} ${stats.sum}`);

        // Add histogram buckets
        const buckets = [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
        for (const bucket of buckets) {
          const count = values.filter(v => v <= bucket).length;
          const bucketLabelsStr = Object.keys(labels).length > 0
            ? '{' + Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',') + `,le="${bucket}"}`
            : `{le="${bucket}"}`;
          lines.push(`${name}_bucket${bucketLabelsStr} ${count}`);
        }
      }
    }

    return lines.join('\n');
  }

  // Persist metrics to database
  static async persistMetrics(): Promise<void> {
    try {
      const metricsArray = Array.from(this.metrics.values());

      if (metricsArray.length === 0) return;

      const values = metricsArray.map(metric =>
        `('${metric.name}', '${metric.type}', ${metric.value}, '${JSON.stringify(metric.labels || {})}', '${metric.timestamp.toISOString()}')`
      ).join(',');

      await this.db.query(`
        INSERT INTO metrics (name, type, value, labels, created_at)
        VALUES ${values}
        ON CONFLICT (name, labels, created_at) DO UPDATE SET value = EXCLUDED.value
      `);
    } catch (error) {
      console.error('Failed to persist metrics:', error);
    }
  }

  private static generateKey(name: string, labels?: Record<string, string>): string {
    return labels ? `${name}|${JSON.stringify(labels)}` : name;
  }

  // Clear old metrics
  static clearOldMetrics(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    for (const [key, metric] of this.metrics) {
      if (metric.timestamp < cutoff) {
        this.metrics.delete(key);
      }
    }
  }
}

// ============================================================================
// PERFORMANCE MONITORING SERVICE
// ============================================================================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private intervalId?: NodeJS.Timeout;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start monitoring
  start(intervalMs: number = 60000): void {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(async () => {
      await this.collectSystemMetrics();
      await this.collectDatabaseMetrics();
      await this.collectCacheMetrics();
      await MetricsCollector.persistMetrics();
    }, intervalMs);

    console.log(`Performance monitoring started with ${intervalMs}ms interval`);
  }

  // Stop monitoring
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('Performance monitoring stopped');
    }
  }

  // Collect system metrics
  private async collectSystemMetrics(): Promise<void> {
    const process = await import('process');
    const os = await import('os');

    // Memory usage
    const memUsage = process.memoryUsage();
    MetricsCollector.setGauge('nodejs_memory_usage_bytes', memUsage.rss, { type: 'rss' });
    MetricsCollector.setGauge('nodejs_memory_usage_bytes', memUsage.heapUsed, { type: 'heap_used' });
    MetricsCollector.setGauge('nodejs_memory_usage_bytes', memUsage.heapTotal, { type: 'heap_total' });
    MetricsCollector.setGauge('nodejs_memory_usage_bytes', memUsage.external, { type: 'external' });

    // CPU usage (approximation)
    const cpuUsage = process.cpuUsage();
    MetricsCollector.setGauge('nodejs_cpu_usage_seconds', cpuUsage.user / 1000000, { type: 'user' });
    MetricsCollector.setGauge('nodejs_cpu_usage_seconds', cpuUsage.system / 1000000, { type: 'system' });

    // Event loop lag
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      MetricsCollector.recordHistogram('nodejs_eventloop_lag_milliseconds', lag);
    });

    // System load
    const loadAvg = os.loadavg();
    MetricsCollector.setGauge('system_load_average', loadAvg[0], { period: '1m' });
    MetricsCollector.setGauge('system_load_average', loadAvg[1], { period: '5m' });
    MetricsCollector.setGauge('system_load_average', loadAvg[2], { period: '15m' });

    // Free memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    MetricsCollector.setGauge('system_memory_total_bytes', totalMem);
    MetricsCollector.setGauge('system_memory_free_bytes', freeMem);
    MetricsCollector.setGauge('system_memory_usage_ratio', (totalMem - freeMem) / totalMem);
  }

  // Collect database metrics
  private async collectDatabaseMetrics(): Promise<void> {
    try {
      const db = Database.getInstance();
      const healthCheck = await db.healthCheck();

      if (healthCheck.status === 'healthy') {
        MetricsCollector.setGauge('database_connections_total', healthCheck.details.poolSize || 0);
        MetricsCollector.setGauge('database_connections_idle', healthCheck.details.idleConnections || 0);
        MetricsCollector.setGauge('database_connections_waiting', healthCheck.details.waitingClients || 0);
        MetricsCollector.setGauge('database_health', 1);
      } else {
        MetricsCollector.setGauge('database_health', 0);
      }
    } catch (error) {
      MetricsCollector.setGauge('database_health', 0);
      MetricsCollector.incrementCounter('database_errors_total');
    }
  }

  // Collect cache metrics
  private async collectCacheMetrics(): Promise<void> {
    try {
      const cache = CacheService.getInstance();
      const healthCheck = await cache.healthCheck();

      if (healthCheck.status === 'healthy') {
        MetricsCollector.setGauge('cache_health', 1);
        // Additional cache-specific metrics would go here
      } else {
        MetricsCollector.setGauge('cache_health', 0);
      }
    } catch (error) {
      MetricsCollector.setGauge('cache_health', 0);
      MetricsCollector.incrementCounter('cache_errors_total');
    }
  }

  // Get performance summary
  async getPerformanceSummary(): Promise<{
    system: any;
    database: any;
    cache: any;
    metrics: any;
  }> {
    const systemMemory = MetricsCollector.getMetric('system_memory_usage_ratio');
    const eventLoopLag = MetricsCollector.getHistogramStats('nodejs_eventloop_lag_milliseconds');
    const databaseHealth = MetricsCollector.getMetric('database_health');
    const cacheHealth = MetricsCollector.getMetric('cache_health');

    return {
      system: {
        memory_usage: systemMemory?.value || 0,
        event_loop_lag_avg: eventLoopLag?.avg || 0,
        event_loop_lag_p95: eventLoopLag?.p95 || 0
      },
      database: {
        health: databaseHealth?.value || 0,
        connections: {
          total: MetricsCollector.getMetric('database_connections_total')?.value || 0,
          idle: MetricsCollector.getMetric('database_connections_idle')?.value || 0,
          waiting: MetricsCollector.getMetric('database_connections_waiting')?.value || 0
        }
      },
      cache: {
        health: cacheHealth?.value || 0,
        hits: MetricsCollector.getMetric('cache_hits_total')?.value || 0,
        misses: MetricsCollector.getMetric('cache_misses_total')?.value || 0,
        errors: MetricsCollector.getMetric('cache_errors_total')?.value || 0
      },
      metrics: {
        total_metrics: MetricsCollector['metrics'].size,
        total_histograms: MetricsCollector['histograms'].size
      }
    };
  }
}

// ============================================================================
// MIDDLEWARE FOR PERFORMANCE TRACKING
// ============================================================================

export const performanceMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  const startHrTime = process.hrtime.bigint();

  // Track request
  MetricsCollector.incrementCounter('http_requests_total', {
    method: req.method,
    route: req.route?.path || req.path
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const durationHr = Number(process.hrtime.bigint() - startHrTime) / 1000000; // Convert to milliseconds

    // Record response time
    MetricsCollector.recordHistogram('http_request_duration_milliseconds', duration, {
      method: req.method,
      status_code: res.statusCode.toString(),
      route: req.route?.path || req.path
    });

    // Record more precise timing
    MetricsCollector.recordHistogram('http_request_duration_precise_milliseconds', durationHr, {
      method: req.method,
      status_code: res.statusCode.toString()
    });

    // Track status codes
    MetricsCollector.incrementCounter('http_responses_total', {
      method: req.method,
      status_code: res.statusCode.toString()
    });

    // Track errors
    if (res.statusCode >= 400) {
      MetricsCollector.incrementCounter('http_errors_total', {
        method: req.method,
        status_code: res.statusCode.toString()
      });
    }
  });

  next();
};

// ============================================================================
// EXPORTS
// ============================================================================

export const cache = CacheService.getInstance();
export const monitor = PerformanceMonitor.getInstance();

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  monitor.start();
}

// Cleanup on process exit
process.on('SIGTERM', async () => {
  console.log('Shutting down performance monitoring...');
  monitor.stop();
  await cache.close();
});

process.on('SIGINT', async () => {
  console.log('Shutting down performance monitoring...');
  monitor.stop();
  await cache.close();
});
