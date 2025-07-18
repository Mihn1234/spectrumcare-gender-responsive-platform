import crypto from 'crypto';
import { EncryptionService } from './encryption';
import { AuditLogger } from './audit-logger';
import { prisma } from '@/lib/prisma';

export class GDPRComplianceService {
  private encryptionService: EncryptionService;
  private auditLogger: AuditLogger;

  constructor() {
    this.encryptionService = new EncryptionService();
    this.auditLogger = new AuditLogger();
  }

  async processDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    await this.auditLogger.logUserAction({
      userId: request.userId,
      action: 'DATA_SUBJECT_REQUEST',
      resource: 'PERSONAL_DATA',
      resourceId: request.subjectId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      sessionId: request.sessionId,
      result: 'INITIATED',
      details: {
        requestType: request.type,
        requestId: request.id
      }
    });

    switch (request.type) {
      case 'ACCESS':
        return await this.processAccessRequest(request);
      case 'RECTIFICATION':
        return await this.processRectificationRequest(request);
      case 'ERASURE':
        return await this.processErasureRequest(request);
      case 'PORTABILITY':
        return await this.processPortabilityRequest(request);
      case 'RESTRICTION':
        return await this.processRestrictionRequest(request);
      default:
        throw new Error(`Unsupported request type: ${request.type}`);
    }
  }

  private async processAccessRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    try {
      const personalData = await this.gatherPersonalData(request.subjectId);

      const exportData = {
        personalInformation: personalData.profile,
        healthRecords: personalData.healthData,
        assessments: personalData.assessments,
        communications: personalData.messages,
        systemLogs: personalData.auditLogs,
        dataProcessingHistory: personalData.processingHistory
      };

      const encryptedData = await this.encryptionService.encryptSensitiveData(exportData);

      return {
        requestId: request.id,
        status: 'COMPLETED',
        data: encryptedData,
        format: 'JSON',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        downloadUrl: await this.createSecureDownloadUrl(encryptedData)
      };
    } catch (error) {
      console.error('Error processing access request:', error);
      return {
        requestId: request.id,
        status: 'FAILED',
        error: 'Failed to process access request'
      };
    }
  }

  private async processRectificationRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    try {
      const updates = request.details.updates;

      await prisma.patient.update({
        where: { id: request.subjectId },
        data: updates
      });

      return {
        requestId: request.id,
        status: 'COMPLETED',
        confirmationCode: crypto.randomUUID()
      };
    } catch (error) {
      console.error('Error processing rectification request:', error);
      return {
        requestId: request.id,
        status: 'FAILED',
        error: 'Failed to process rectification request'
      };
    }
  }

  private async processErasureRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    try {
      const canErase = await this.checkErasurePermissibility(request.subjectId);

      if (!canErase.permitted) {
        return {
          requestId: request.id,
          status: 'REJECTED',
          reason: canErase.reason
        };
      }

      await this.performSecureErasure(request.subjectId);

      return {
        requestId: request.id,
        status: 'COMPLETED',
        confirmationCode: crypto.randomUUID()
      };
    } catch (error) {
      console.error('Error processing erasure request:', error);
      return {
        requestId: request.id,
        status: 'FAILED',
        error: 'Failed to process erasure request'
      };
    }
  }

  private async processPortabilityRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    try {
      const personalData = await this.gatherPersonalData(request.subjectId);

      const portableData = {
        format: 'FHIR_R4',
        data: this.transformToFHIR(personalData)
      };

      return {
        requestId: request.id,
        status: 'COMPLETED',
        data: portableData,
        format: 'FHIR',
        downloadUrl: await this.createSecureDownloadUrl(portableData)
      };
    } catch (error) {
      console.error('Error processing portability request:', error);
      return {
        requestId: request.id,
        status: 'FAILED',
        error: 'Failed to process portability request'
      };
    }
  }

  private async processRestrictionRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    try {
      const restrictions = request.details.restrictions;

      await prisma.patient.update({
        where: { id: request.subjectId },
        data: {
          preferences: {
            dataProcessingRestrictions: restrictions
          }
        }
      });

      return {
        requestId: request.id,
        status: 'COMPLETED',
        confirmationCode: crypto.randomUUID()
      };
    } catch (error) {
      console.error('Error processing restriction request:', error);
      return {
        requestId: request.id,
        status: 'FAILED',
        error: 'Failed to process restriction request'
      };
    }
  }

  private async gatherPersonalData(subjectId: string): Promise<PersonalDataExport> {
    const patient = await prisma.patient.findUnique({
      where: { id: subjectId },
      include: {
        assessments: true,
        appointments: true,
        healthRecords: true,
        treatments: true,
        documents: true,
        alerts: true
      }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    return {
      profile: patient,
      healthData: patient.healthRecords,
      assessments: patient.assessments,
      messages: [],
      auditLogs: [],
      processingHistory: []
    };
  }

  private async checkErasurePermissibility(subjectId: string): Promise<{ permitted: boolean; reason?: string }> {
    const activeEHCP = await this.checkActiveEHCP(subjectId);
    const legalObligations = await this.checkLegalObligations(subjectId);

    if (activeEHCP) {
      return { permitted: false, reason: 'Active EHCP requires data retention' };
    }

    if (legalObligations.length > 0) {
      return { permitted: false, reason: 'Legal obligations require data retention' };
    }

    return { permitted: true };
  }

  private async performSecureErasure(subjectId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.healthRecord.deleteMany({ where: { patientId: subjectId } });
      await tx.assessment.deleteMany({ where: { patientId: subjectId } });
      await tx.appointment.deleteMany({ where: { patientId: subjectId } });
      await tx.treatment.deleteMany({ where: { patientId: subjectId } });
      await tx.document.deleteMany({ where: { patientId: subjectId } });
      await tx.alert.deleteMany({ where: { patientId: subjectId } });
      await tx.patient.delete({ where: { id: subjectId } });
    });
  }

  private async createSecureDownloadUrl(data: any): Promise<string> {
    const token = crypto.randomUUID();
    return `${process.env.APP_URL}/download/${token}`;
  }

  private async checkActiveEHCP(subjectId: string): Promise<boolean> {
    return false;
  }

  private async checkLegalObligations(subjectId: string): Promise<string[]> {
    return [];
  }

  private transformToFHIR(data: PersonalDataExport): any {
    return {
      resourceType: 'Bundle',
      id: crypto.randomUUID(),
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: data.profile.id,
            name: [{
              family: data.profile.lastName,
              given: [data.profile.firstName]
            }],
            birthDate: data.profile.dateOfBirth,
            gender: data.profile.gender?.toLowerCase()
          }
        }
      ]
    };
  }
}

export interface DataSubjectRequest {
  id: string;
  type: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'RESTRICTION';
  subjectId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  details: any;
}

export interface DataSubjectResponse {
  requestId: string;
  status: 'COMPLETED' | 'FAILED' | 'REJECTED';
  data?: any;
  format?: string;
  expiresAt?: Date;
  downloadUrl?: string;
  error?: string;
  reason?: string;
  confirmationCode?: string;
}

export interface PersonalDataExport {
  profile: any;
  healthData: any[];
  assessments: any[];
  messages: any[];
  auditLogs: any[];
  processingHistory: any[];
}
