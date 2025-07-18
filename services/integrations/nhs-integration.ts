import { Patient, HealthRecord } from '@prisma/client';

export class NHSIntegration {
  private apiEndpoint: string;
  private apiKey: string;
  private certificatePath: string;

  constructor() {
    this.apiEndpoint = process.env.NHS_API_ENDPOINT || 'https://api.nhs.uk';
    this.apiKey = process.env.NHS_API_KEY || '';
    this.certificatePath = process.env.NHS_CERTIFICATE_PATH || '';
  }

  async validateNHSNumber(nhsNumber: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/validate-nhs-number`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nhsNumber })
      });

      const result = await response.json();
      return result.valid;
    } catch (error) {
      console.error('NHS number validation error:', error);
      return false;
    }
  }

  async fetchPatientRecord(nhsNumber: string): Promise<NHSPatientRecord | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/patient/${nhsNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`NHS API error: ${response.status}`);
      }

      const fhirData = await response.json();
      return this.transformFHIRToPatientRecord(fhirData);
    } catch (error) {
      console.error('Error fetching NHS patient record:', error);
      return null;
    }
  }

  async syncMedicalHistory(patientId: string, nhsNumber: string): Promise<HealthRecord[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/patient/${nhsNumber}/history`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/fhir+json'
        }
      });

      const fhirData = await response.json();
      return this.transformFHIRToHealthRecords(fhirData, patientId);
    } catch (error) {
      console.error('Error syncing medical history:', error);
      return [];
    }
  }

  private transformFHIRToPatientRecord(fhirData: any): NHSPatientRecord {
    return {
      nhsNumber: fhirData.identifier?.find((id: any) => id.system === 'https://fhir.nhs.uk/Id/nhs-number')?.value,
      firstName: fhirData.name?.[0]?.given?.[0],
      lastName: fhirData.name?.[0]?.family,
      dateOfBirth: new Date(fhirData.birthDate),
      gender: fhirData.gender,
      address: fhirData.address?.[0],
      gpPractice: fhirData.generalPractitioner?.[0]?.reference,
      allergies: fhirData.allergyIntolerance || [],
      medications: fhirData.medicationStatement || [],
      conditions: fhirData.condition || []
    };
  }

  private transformFHIRToHealthRecords(fhirData: any, patientId: string): HealthRecord[] {
    const records: HealthRecord[] = [];

    if (fhirData.observation) {
      fhirData.observation.forEach((obs: any) => {
        records.push({
          id: crypto.randomUUID(),
          patientId,
          recordType: this.mapObservationToRecordType(obs.code) as any,
          source: 'IMPORTED',
          timestamp: new Date(obs.effectiveDateTime),
          data: {
            value: obs.valueQuantity?.value,
            unit: obs.valueQuantity?.unit,
            code: obs.code.coding?.[0]?.code,
            display: obs.code.coding?.[0]?.display
          },
          isVerified: true,
          verifiedBy: 'NHS_SYSTEM',
          verifiedAt: new Date(),
          tags: ['nhs', 'official'],
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      });
    }

    return records;
  }

  private mapObservationToRecordType(code: any): string {
    const codeValue = code.coding?.[0]?.code;

    switch (codeValue) {
      case '8480-6': return 'VITAL_SIGNS';
      case '8462-4': return 'VITAL_SIGNS';
      case '8310-5': return 'VITAL_SIGNS';
      case '8867-4': return 'VITAL_SIGNS';
      case '9279-1': return 'VITAL_SIGNS';
      case '29463-7': return 'VITAL_SIGNS';
      case '8302-2': return 'VITAL_SIGNS';
      default: return 'SYMPTOMS';
    }
  }
}

export interface NHSPatientRecord {
  nhsNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  address: any;
  gpPractice: string;
  allergies: any[];
  medications: any[];
  conditions: any[];
}
