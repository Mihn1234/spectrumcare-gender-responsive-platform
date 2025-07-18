import { prisma } from '@/lib/prisma';

export class AuditLogger {
  private logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  private logStream: NodeJS.WritableStream;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as any) || 'INFO';
    this.logStream = process.stdout;
  }

  async logUserAction(action: UserAction): Promise<void> {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      userId: action.userId,
      action: action.action,
      resource: action.resource,
      resourceId: action.resourceId,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      sessionId: action.sessionId,
      result: action.result,
      details: action.details,
      severity: this.determineSeverity(action.action)
    };

    await this.writeAuditEntry(auditEntry);

    if (auditEntry.severity === 'HIGH' || auditEntry.severity === 'CRITICAL') {
      await this.sendSecurityAlert(auditEntry);
    }
  }

  async logDataAccess(access: DataAccess): Promise<void> {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      userId: access.userId,
      action: 'DATA_ACCESS',
      resource: access.resourceType,
      resourceId: access.resourceId,
      ipAddress: access.ipAddress,
      userAgent: access.userAgent,
      sessionId: access.sessionId,
      result: 'SUCCESS',
      details: {
        dataFields: access.dataFields,
        purpose: access.purpose,
        legalBasis: access.legalBasis
      },
      severity: 'MEDIUM'
    };

    await this.writeAuditEntry(auditEntry);
  }

  async logSystemEvent(event: SystemEvent): Promise<void> {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      userId: 'SYSTEM',
      action: event.eventType,
      resource: event.component,
      resourceId: event.resourceId,
      ipAddress: 'SYSTEM',
      userAgent: 'SYSTEM',
      sessionId: 'SYSTEM',
      result: event.result,
      details: event.details,
      severity: event.severity
    };

    await this.writeAuditEntry(auditEntry);
  }

  private async writeAuditEntry(entry: AuditEntry): Promise<void> {
    try {
      await this.persistAuditEntry(entry);

      const logMessage = JSON.stringify(entry);
      this.logStream.write(logMessage + '\n');

      await this.sendToMonitoringService(entry);
    } catch (error) {
      console.error('Failed to write audit entry:', error);
    }
  }

  private async persistAuditEntry(entry: AuditEntry): Promise<void> {
    try {
      await prisma.healthRecord.create({
        data: {
          patientId: entry.resourceId,
          recordType: 'AUDIT_LOG',
          data: entry,
          source: 'AI_GENERATED',
          timestamp: entry.timestamp,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any
      });
    } catch (error) {
      console.error('Failed to persist audit entry:', error);
    }
  }

  private async sendToMonitoringService(entry: AuditEntry): Promise<void> {
    if (process.env.MONITORING_ENDPOINT) {
      try {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_TOKEN}`
          },
          body: JSON.stringify(entry)
        });
      } catch (error) {
        console.error('Failed to send to monitoring service:', error);
      }
    }
  }

  private async sendSecurityAlert(entry: AuditEntry): Promise<void> {
    if (process.env.SECURITY_ALERT_WEBHOOK) {
      try {
        await fetch(process.env.SECURITY_ALERT_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            alert: 'Security Event Detected',
            severity: entry.severity,
            details: entry,
            timestamp: entry.timestamp
          })
        });
      } catch (error) {
        console.error('Failed to send security alert:', error);
      }
    }
  }

  private determineSeverity(action: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalActions = ['DELETE_PATIENT', 'EXPORT_DATA', 'ADMIN_ACCESS'];
    const highActions = ['CREATE_PATIENT', 'MODIFY_MEDICAL_RECORD', 'ACCESS_CRISIS_DATA'];
    const mediumActions = ['LOGIN', 'VIEW_PATIENT', 'CREATE_ASSESSMENT'];

    if (criticalActions.includes(action)) return 'CRITICAL';
    if (highActions.includes(action)) return 'HIGH';
    if (mediumActions.includes(action)) return 'MEDIUM';
    return 'LOW';
  }
}

export interface AuditEntry {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  result: string;
  details: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UserAction {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  result: string;
  details: any;
}

export interface DataAccess {
  userId: string;
  resourceType: string;
  resourceId: string;
  dataFields: string[];
  purpose: string;
  legalBasis: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface SystemEvent {
  eventType: string;
  component: string;
  resourceId: string;
  result: string;
  details: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
