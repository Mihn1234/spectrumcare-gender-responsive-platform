export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]>;
  private alertThresholds: Map<string, number>;

  constructor() {
    this.metrics = new Map();
    this.alertThresholds = new Map();
    this.initializeThresholds();
  }

  private initializeThresholds() {
    this.alertThresholds.set('response_time', 2000);
    this.alertThresholds.set('error_rate', 0.05);
    this.alertThresholds.set('cpu_usage', 80);
    this.alertThresholds.set('memory_usage', 85);
    this.alertThresholds.set('database_connections', 90);
  }

  async recordMetric(name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push(metric);

    if (this.metrics.get(name)!.length > 1000) {
      this.metrics.get(name)!.shift();
    }

    await this.checkThresholds(name, value);
    await this.sendToMonitoringService(metric);
  }

  async getMetrics(name: string, timeRange: number = 3600): Promise<PerformanceMetric[]> {
    const metrics = this.metrics.get(name) || [];
    const cutoff = new Date(Date.now() - timeRange * 1000);

    return metrics.filter(metric => metric.timestamp >= cutoff);
  }

  async calculateAggregates(name: string, timeRange: number = 3600): Promise<MetricAggregates> {
    const metrics = await this.getMetrics(name, timeRange);

    if (metrics.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0, sum: 0 };
    }

    const values = metrics.map(m => m.value);

    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0)
    };
  }

  private async checkThresholds(name: string, value: number): Promise<void> {
    const threshold = this.alertThresholds.get(name);
    if (threshold && value > threshold) {
      await this.sendAlert({
        metric: name,
        value,
        threshold,
        timestamp: new Date(),
        severity: 'HIGH'
      });
    }
  }

  private async sendToMonitoringService(metric: PerformanceMetric): Promise<void> {
    if (process.env.DATADOG_API_KEY) {
      try {
        await fetch('https://api.datadoghq.com/api/v1/series', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'DD-API-KEY': process.env.DATADOG_API_KEY
          },
          body: JSON.stringify({
            series: [{
              metric: metric.name,
              points: [[metric.timestamp.getTime() / 1000, metric.value]],
              tags: Object.entries(metric.tags).map(([k, v]) => `${k}:${v}`)
            }]
          })
        });
      } catch (error) {
        console.error('Failed to send metric to DataDog:', error);
      }
    }
  }

  private async sendAlert(alert: PerformanceAlert): Promise<void> {
    console.warn('Performance Alert:', alert);

    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: `🚨 Performance Alert: ${alert.metric} is ${alert.value} (threshold: ${alert.threshold})`
          })
        });
      } catch (error) {
        console.error('Failed to send alert to Slack:', error);
      }
    }
  }
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface MetricAggregates {
  average: number;
  min: number;
  max: number;
  count: number;
  sum: number;
}

export interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
