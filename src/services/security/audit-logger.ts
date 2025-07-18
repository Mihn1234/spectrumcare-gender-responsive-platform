export interface AuditEvent {
  event: string;
  userId?: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
  ip?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    // In production, this would write to a secure audit log
    console.log('Audit:', JSON.stringify({
      ...event,
      timestamp: event.timestamp || new Date()
    }));
  }

  static async logSecurityEvent(event: string, details?: Record<string, unknown>): Promise<void> {
    await this.log({
      event: `SECURITY_${event}`,
      details,
      timestamp: new Date()
    });
  }

  static async logUserAction(userId: string, action: string, details?: Record<string, unknown>): Promise<void> {
    await this.log({
      event: `USER_ACTION_${action}`,
      userId,
      details,
      timestamp: new Date()
    });
  }
}

export default AuditLogger;
