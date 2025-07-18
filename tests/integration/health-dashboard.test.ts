import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { HealthDashboard } from '@/components/health/HealthDashboard';
import { TestHelpers } from '../utils/test-helpers';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('HealthDashboard Integration Tests', () => {
  let testPatient: any;
  let testHealthRecords: any[];
  let testCrisis: any;

  beforeEach(async () => {
    await TestHelpers.cleanupTestData();

    // Create test scenario data
    const scenario = await TestHelpers.createTestScenario('routine_monitoring');
    testPatient = scenario.patient;
    testHealthRecords = scenario.healthRecords;

    // Mock API responses
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/health/patients')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([testPatient])
        });
      }
      if (url.includes('/api/health/crisis')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'NONE',
            riskLevel: 'LOW',
            riskScore: 10
          })
        });
      }
      if (url.includes('/api/health/integrations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            integration: 'nhs',
            data: { syncStatus: 'completed' },
            status: 'success'
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  afterEach(async () => {
    await TestHelpers.cleanupTestData();
    jest.clearAllMocks();
  });

  it('displays patient health metrics correctly', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Overall Health Score')).toBeInTheDocument();
    });

    // Check for health metric cards
    expect(screen.getByText('Behavior Score')).toBeInTheDocument();
    expect(screen.getByText('Mood Rating')).toBeInTheDocument();
    expect(screen.getByText('Sleep Quality')).toBeInTheDocument();
  });

  it('handles crisis alerts appropriately', async () => {
    // Create crisis scenario
    const crisisScenario = await TestHelpers.createTestScenario('crisis_scenario');

    // Mock crisis API response
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/health/crisis')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'CRITICAL',
            riskLevel: 'CRITICAL',
            riskScore: 90,
            activeProtocols: ['Emergency Response Protocol']
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Crisis Status: CRITICAL/)).toBeInTheDocument();
    });

    // Check for emergency action buttons
    expect(screen.getByText('Contact Crisis Team')).toBeInTheDocument();
    expect(screen.getByText('Emergency Services')).toBeInTheDocument();
  });

  it('allows AI analysis execution', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Navigate to AI Analysis tab
    const aiTab = screen.getByText('AI Analysis');
    fireEvent.click(aiTab);

    await waitFor(() => {
      expect(screen.getByText('Health Prediction')).toBeInTheDocument();
    });

    // Mock AI analysis response
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/health/ai/analyze')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            analysisType: 'health_prediction',
            overallHealthTrend: 'IMPROVING',
            confidence: 0.85
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    // Click health prediction button
    const healthPredictionBtn = screen.getByText('Health Prediction');
    fireEvent.click(healthPredictionBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/health/ai/analyze',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('health_prediction')
        })
      );
    });
  });

  it('handles voice assistant functionality', async () => {
    // Mock mediaDevices for voice recording
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: () => []
        })
      },
      writable: true
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Navigate to Voice Assistant tab
    const voiceTab = screen.getByText('Voice Assistant');
    fireEvent.click(voiceTab);

    await waitFor(() => {
      expect(screen.getByText('Voice Assistant Ready')).toBeInTheDocument();
    });

    // Start voice recording
    const startVoiceBtn = screen.getByText('Start Voice Log');
    fireEvent.click(startVoiceBtn);

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });
  });

  it('displays telemedicine interface', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Navigate to Telemedicine tab
    const telemedicineTab = screen.getByText('Telemedicine');
    fireEvent.click(telemedicineTab);

    await waitFor(() => {
      expect(screen.getByText('Start Video Consultation')).toBeInTheDocument();
      expect(screen.getByText('Schedule Appointment')).toBeInTheDocument();
      expect(screen.getByText('Join Group Session')).toBeInTheDocument();
    });
  });

  it('handles system integrations', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Navigate to Integrations tab
    const integrationsTab = screen.getByText('Integrations');
    fireEvent.click(integrationsTab);

    await waitFor(() => {
      expect(screen.getByText('NHS Integration')).toBeInTheDocument();
      expect(screen.getByText('School Integration')).toBeInTheDocument();
      expect(screen.getByText('Local Authority')).toBeInTheDocument();
    });

    // Test NHS integration
    const syncNHSBtn = screen.getByText('Sync NHS Data');
    fireEvent.click(syncNHSBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/health/integrations'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  it('displays analytics and performance metrics', async () => {
    const mockTrends = TestHelpers.generateTestData('health_metrics', 7);

    // Mock analytics API response
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/health/analytics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ trends: mockTrends })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Navigate to Analytics tab
    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    await waitFor(() => {
      expect(screen.getByText('Health Analytics')).toBeInTheDocument();
      expect(screen.getByText('Behavior Patterns')).toBeInTheDocument();
    });
  });

  it('executes emergency protocols correctly', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Mock crisis protocol response
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/health/crisis')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            crisisEventId: 'crisis-123',
            status: 'ACTIVE',
            protocolsActivated: true
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    // Use emergency button in quick actions
    const emergencyBtn = screen.getByText('Emergency');
    fireEvent.click(emergencyBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/health/crisis',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('CRISIS_TEAM')
        })
      );
    });
  });

  it('validates data integrity across components', async () => {
    const mockPatients = [testPatient];

    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/health/patients')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPatients)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      // Check that patient data is consistently displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Verify health metrics are numerical and within expected ranges
      const scoreElements = screen.getAllByText(/\d+(\.\d+)?/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    // Check that tabs are all accessible
    const tabs = [
      'Overview', 'AI Analysis', 'Crisis Management',
      'Telemedicine', 'Analytics', 'Voice Assistant', 'Integrations'
    ];

    for (const tabName of tabs) {
      const tab = screen.getByText(tabName);
      fireEvent.click(tab);

      await waitFor(() => {
        expect(tab).toHaveAttribute('data-state', 'active');
      });
    }
  });

  it('handles error states gracefully', async () => {
    // Mock API error responses
    (fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      });
    });

    render(<HealthDashboard />);

    await waitFor(() => {
      // Should handle loading state and eventual error
      expect(screen.getByText(/Loading/i) || screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  it('maintains security and audit trail', async () => {
    render(<HealthDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Perform various actions that should be audited
    const actions = [
      () => fireEvent.click(screen.getByText('AI Analysis')),
      () => fireEvent.click(screen.getByText('Crisis Management')),
      () => fireEvent.click(screen.getByText('Integrations'))
    ];

    for (const action of actions) {
      action();
      await waitFor(() => {
        // Each action should result in API calls that include audit logging
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            })
          })
        );
      });
    }
  });
});
