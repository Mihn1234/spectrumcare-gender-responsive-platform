export class LocalAuthorityIntegration {
  private laEndpoints: Map<string, LAConfig>;

  constructor() {
    this.laEndpoints = new Map();
    this.initializeLAEndpoints();
  }

  private initializeLAEndpoints() {
    this.laEndpoints.set('BIRMINGHAM', {
      apiEndpoint: process.env.BIRMINGHAM_LA_API || '',
      authToken: process.env.BIRMINGHAM_LA_TOKEN || '',
      supportedServices: ['ehcp', 'transport', 'funding']
    });

    this.laEndpoints.set('MANCHESTER', {
      apiEndpoint: process.env.MANCHESTER_LA_API || '',
      authToken: process.env.MANCHESTER_LA_TOKEN || '',
      supportedServices: ['ehcp', 'respite', 'funding']
    });
  }

  async submitEHCPApplication(application: EHCPApplication): Promise<EHCPApplicationResult> {
    const laCode = application.localAuthorityCode;
    const config = this.laEndpoints.get(laCode);

    if (!config) {
      throw new Error(`Local Authority not supported: ${laCode}`);
    }

    try {
      const response = await fetch(`${config.apiEndpoint}/ehcp/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(application)
      });

      const result = await response.json();
      return {
        applicationId: result.id,
        status: result.status,
        referenceNumber: result.reference,
        submissionDate: new Date(result.submitted_at),
        estimatedDecisionDate: new Date(result.estimated_decision_date),
        nextSteps: result.next_steps
      };
    } catch (error) {
      console.error('Error submitting EHCP application:', error);
      throw error;
    }
  }

  async checkEHCPStatus(applicationId: string, laCode: string): Promise<EHCPStatus> {
    const config = this.laEndpoints.get(laCode);
    if (!config) {
      throw new Error(`Local Authority not supported: ${laCode}`);
    }

    try {
      const response = await fetch(`${config.apiEndpoint}/ehcp/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${config.authToken}`
        }
      });

      const data = await response.json();
      return {
        status: data.status,
        lastUpdated: new Date(data.last_updated),
        currentStage: data.current_stage,
        daysRemaining: data.days_remaining,
        documents: data.documents,
        nextActions: data.next_actions
      };
    } catch (error) {
      console.error('Error checking EHCP status:', error);
      throw error;
    }
  }

  async requestFunding(fundingRequest: FundingRequest): Promise<FundingResult> {
    const laCode = fundingRequest.localAuthorityCode;
    const config = this.laEndpoints.get(laCode);

    if (!config || !config.supportedServices.includes('funding')) {
      throw new Error(`Funding requests not supported for: ${laCode}`);
    }

    try {
      const response = await fetch(`${config.apiEndpoint}/funding/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fundingRequest)
      });

      const result = await response.json();
      return {
        requestId: result.id,
        status: result.status,
        amount: result.amount,
        approvedAmount: result.approved_amount,
        conditions: result.conditions,
        reviewDate: new Date(result.review_date)
      };
    } catch (error) {
      console.error('Error requesting funding:', error);
      throw error;
    }
  }
}

export interface LAConfig {
  apiEndpoint: string;
  authToken: string;
  supportedServices: string[];
}

export interface EHCPApplication {
  id: string;
  localAuthorityCode: string;
  childDetails: any;
  parentDetails: any;
  currentProvision: any;
  requestedProvision: any;
  supportingDocuments: string[];
}

export interface EHCPApplicationResult {
  applicationId: string;
  status: string;
  referenceNumber: string;
  submissionDate: Date;
  estimatedDecisionDate: Date;
  nextSteps: string[];
}

export interface EHCPStatus {
  status: string;
  lastUpdated: Date;
  currentStage: string;
  daysRemaining: number;
  documents: any[];
  nextActions: string[];
}

export interface FundingRequest {
  localAuthorityCode: string;
  requestType: string;
  amount: number;
  purpose: string;
  justification: string;
  supportingDocuments: string[];
}

export interface FundingResult {
  requestId: string;
  status: string;
  amount: number;
  approvedAmount: number;
  conditions: string[];
  reviewDate: Date;
}
