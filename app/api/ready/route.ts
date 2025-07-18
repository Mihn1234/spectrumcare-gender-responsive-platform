import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if the application is ready to receive traffic

    // 1. Database connection check
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    // 2. Check if migrations are up to date (in production)
    if (process.env.NODE_ENV === 'production') {
      // This would typically check migration status
      // For now, we'll assume migrations are handled externally
    }

    // 3. Check external service connectivity
    const externalServices = {
      openai: false,
      nhs: false,
      monitoring: false
    };

    // Quick OpenAI API check (if configured)
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(3000)
        });
        externalServices.openai = openaiResponse.ok;
      } catch (error) {
        // OpenAI check failed, but don't fail readiness
        console.warn('OpenAI API check failed:', error);
      }
    }

    // NHS API check (if configured)
    if (process.env.NHS_API_KEY && process.env.NHS_API_ENDPOINT) {
      try {
        const nhsResponse = await fetch(`${process.env.NHS_API_ENDPOINT}/health`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.NHS_API_KEY}`
          },
          signal: AbortSignal.timeout(3000)
        });
        externalServices.nhs = nhsResponse.ok;
      } catch (error) {
        // NHS check failed, but don't fail readiness for optional service
        console.warn('NHS API check failed:', error);
      }
    }

    // Monitoring service check
    if (process.env.MONITORING_ENDPOINT) {
      try {
        const monitoringResponse = await fetch(`${process.env.MONITORING_ENDPOINT}/ping`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        externalServices.monitoring = monitoringResponse.ok;
      } catch (error) {
        // Monitoring check failed, but don't fail readiness
        console.warn('Monitoring service check failed:', error);
      }
    }

    // Check critical system metrics
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Fail readiness if memory usage is too high
    if (memoryUsagePercent > 95) {
      return NextResponse.json(
        {
          status: 'not_ready',
          message: 'High memory usage detected',
          memoryUsage: memoryUsagePercent
        },
        { status: 503 }
      );
    }

    // Fail readiness if database latency is too high
    if (dbLatency > 5000) {
      return NextResponse.json(
        {
          status: 'not_ready',
          message: 'Database latency too high',
          dbLatency
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'healthy',
          latency: dbLatency
        },
        memory: {
          status: memoryUsagePercent < 80 ? 'healthy' : 'warning',
          usage: Math.round(memoryUsagePercent)
        },
        externalServices
      },
      version: process.env.npm_package_version || 'unknown'
    });

  } catch (error) {
    console.error('Readiness check failed:', error);

    return NextResponse.json(
      {
        status: 'not_ready',
        message: 'System not ready to receive traffic',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
