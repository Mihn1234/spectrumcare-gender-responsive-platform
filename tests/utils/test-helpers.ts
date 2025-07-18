import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export class TestHelpers {
  static async createTestPatient(overrides: Partial<any> = {}): Promise<any> {
    const defaultPatient = {
      id: `test-${crypto.randomUUID()}`,
      userId: 'test-user-1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2015-01-01'),
      gender: 'MALE',
      nhsNumber: '1234567890',
      diagnosis: [{ condition: 'Autism Spectrum Disorder', severity: 'Moderate' }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return await prisma.patient.create({
      data: defaultPatient
    });
  }

  static async createTestHealthRecord(patientId: string, overrides: Partial<any> = {}): Promise<any> {
    const defaultRecord = {
      id: `test-${crypto.randomUUID()}`,
      patientId,
      recordType: 'BEHAVIOR',
      source: 'MANUAL',
      timestamp: new Date(),
      data: { score: 7, notes: 'Good day' },
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return await prisma.healthRecord.create({
      data: defaultRecord
    });
  }

  static async createTestAssessment(patientId: string, userId: string, overrides: Partial<any> = {}): Promise<any> {
    const defaultAssessment = {
      id: `test-${crypto.randomUUID()}`,
      patientId,
      userId,
      type: 'AUTISM_SCREENING',
      status: 'PENDING',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return await prisma.assessment.create({
      data: defaultAssessment
    });
  }

  static async createTestCrisisEvent(patientId: string, overrides: Partial<any> = {}): Promise<any> {
    const defaultCrisis = {
      id: `test-${crypto.randomUUID()}`,
      patientId,
      crisisType: 'BEHAVIORAL_CRISIS',
      severity: 'HIGH',
      description: 'Test crisis event',
      aiDetected: false,
      triggeredAt: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return await prisma.crisisEvent.create({
      data: defaultCrisis
    });
  }

  static async createTestAlert(patientId: string, overrides: Partial<any> = {}): Promise<any> {
    const defaultAlert = {
      id: `test-${crypto.randomUUID()}`,
      patientId,
      type: 'HEALTH_CONCERN',
      severity: 'MEDIUM',
      title: 'Test Alert',
      message: 'This is a test alert',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return await prisma.alert.create({
      data: defaultAlert
    });
  }

  static async createTestAppointment(patientId: string, userId: string, overrides: Partial<any> = {}): Promise<any> {
    const defaultAppointment = {
      id: `test-${crypto.randomUUID()}`,
      patientId,
      userId,
      title: 'Test Appointment',
      type: 'CONSULTATION',
      status: 'SCHEDULED',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return await prisma.appointment.create({
      data: defaultAppointment
    });
  }

  static async cleanupTestData(): Promise<void> {
    try {
      await prisma.healthRecord.deleteMany({
        where: {
          OR: [
            { patientId: { startsWith: 'test-' } },
            { id: { startsWith: 'test-' } }
          ]
        }
      });

      await prisma.assessment.deleteMany({
        where: {
          OR: [
            { patientId: { startsWith: 'test-' } },
            { id: { startsWith: 'test-' } }
          ]
        }
      });

      await prisma.appointment.deleteMany({
        where: {
          OR: [
            { patientId: { startsWith: 'test-' } },
            { id: { startsWith: 'test-' } }
          ]
        }
      });

      await prisma.alert.deleteMany({
        where: {
          OR: [
            { patientId: { startsWith: 'test-' } },
            { id: { startsWith: 'test-' } }
          ]
        }
      });

      await prisma.crisisEvent.deleteMany({
        where: {
          OR: [
            { patientId: { startsWith: 'test-' } },
            { id: { startsWith: 'test-' } }
          ]
        }
      });

      await prisma.patient.deleteMany({
        where: { id: { startsWith: 'test-' } }
      });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  static mockAIResponse(response: any): void {
    if (typeof jest !== 'undefined') {
      jest.mock('@/services/ai/health-predictor', () => ({
        HealthPredictor: jest.fn().mockImplementation(() => ({
          predictHealthOutcome: jest.fn().mockResolvedValue(response)
        }))
      }));
    }
  }

  static async createTestScenario(scenarioName: string): Promise<any> {
    switch (scenarioName) {
      case 'crisis_scenario':
        return await this.createCrisisScenario();
      case 'assessment_scenario':
        return await this.createAssessmentScenario();
      case 'routine_monitoring':
        return await this.createRoutineMonitoringScenario();
      default:
        throw new Error(`Unknown test scenario: ${scenarioName}`);
    }
  }

  private static async createCrisisScenario(): Promise<any> {
    const patient = await this.createTestPatient({
      firstName: 'Emergency',
      lastName: 'Test'
    });

    const crisis = await this.createTestCrisisEvent(patient.id, {
      severity: 'CRITICAL',
      description: 'Test crisis scenario'
    });

    const alert = await this.createTestAlert(patient.id, {
      type: 'CRISIS_WARNING',
      severity: 'CRITICAL',
      title: 'Crisis Alert'
    });

    return { patient, crisis, alert };
  }

  private static async createAssessmentScenario(): Promise<any> {
    const patient = await this.createTestPatient();

    const assessment = await this.createTestAssessment(patient.id, 'test-professional-1', {
      type: 'ADOS_2',
      status: 'IN_PROGRESS'
    });

    return { patient, assessment };
  }

  private static async createRoutineMonitoringScenario(): Promise<any> {
    const patient = await this.createTestPatient();

    const healthRecords = await Promise.all([
      this.createTestHealthRecord(patient.id, {
        recordType: 'BEHAVIOR',
        data: { score: 6, notes: 'Moderate behavior' }
      }),
      this.createTestHealthRecord(patient.id, {
        recordType: 'MOOD',
        data: { score: 7, notes: 'Good mood' }
      }),
      this.createTestHealthRecord(patient.id, {
        recordType: 'SLEEP',
        data: { quality: 8, hours: 9, notes: 'Good sleep' }
      })
    ]);

    return { patient, healthRecords };
  }

  static generateTestData(type: string, count: number = 1): any[] {
    const data = [];

    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'health_metrics':
          data.push({
            timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            behavior: Math.floor(Math.random() * 10) + 1,
            mood: Math.floor(Math.random() * 10) + 1,
            sleep: Math.floor(Math.random() * 10) + 1
          });
          break;
        case 'crisis_events':
          data.push({
            id: `crisis-${i}`,
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
            severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
            type: 'BEHAVIORAL_CRISIS'
          });
          break;
        default:
          throw new Error(`Unknown test data type: ${type}`);
      }
    }

    return data;
  }

  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 5000
  ): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  static createMockRequest(overrides: Partial<any> = {}): any {
    return {
      method: 'GET',
      url: '/api/test',
      headers: new Map([
        ['user-agent', 'test-agent'],
        ['x-forwarded-for', '127.0.0.1']
      ]),
      json: async () => ({}),
      ...overrides
    };
  }

  static createMockResponse(): any {
    const response = {
      status: 200,
      statusText: 'OK',
      headers: new Map(),
      json: async (data: any) => data,
      setHeader: (name: string, value: string) => response.headers.set(name, value),
      getHeader: (name: string) => response.headers.get(name)
    };

    return response;
  }
}
