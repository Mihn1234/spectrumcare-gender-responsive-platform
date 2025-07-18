'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Lightbulb,
  Target,
  BarChart3,
  Save,
  Send,
  Eye
} from 'lucide-react';

// Assessment Types
interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'likert_scale' | 'yes_no' | 'text' | 'checkbox' | 'rating';
  options?: string[];
  required: boolean;
  domain?: string;
  scoring?: {
    weights: Record<string, number>;
    interpretation: Record<string, string>;
  };
}

interface AssessmentTool {
  id: string;
  name: string;
  description: string;
  ageRange: string;
  duration: string;
  domains: string[];
  questions: AssessmentQuestion[];
  scoring: {
    maxScore: number;
    cutoffScores: Record<string, number>;
    interpretation: Record<string, string>;
  };
  standardization: {
    norms: string;
    reliability: number;
    validity: string;
  };
}

interface AssessmentResponse {
  questionId: string;
  response: string | string[] | number;
  notes?: string;
}

interface AssessmentSession {
  id: string;
  toolId: string;
  childId: string;
  assessorId: string;
  startTime: Date;
  endTime?: Date;
  responses: AssessmentResponse[];
  status: 'in_progress' | 'completed' | 'interrupted';
  observationalNotes: string;
  environmentalFactors: string[];
  totalScore?: number;
  domainScores?: Record<string, number>;
  interpretation?: string;
  recommendations?: string[];
}

// Standardized Assessment Tools
const assessmentTools: AssessmentTool[] = [
  {
    id: 'ados-2',
    name: 'ADOS-2 (Autism Diagnostic Observation Schedule)',
    description: 'Gold standard observational assessment for autism spectrum disorders',
    ageRange: '12 months - Adult',
    duration: '40-60 minutes',
    domains: ['Social Affect', 'Restricted and Repetitive Behaviors', 'Play/Imagination'],
    standardization: {
      norms: 'International multi-site validation',
      reliability: 0.91,
      validity: 'Excellent diagnostic validity'
    },
    questions: [
      {
        id: 'ados_sa_1',
        question: 'Response to Joint Attention',
        type: 'rating',
        options: ['0', '1', '2', '3'],
        required: true,
        domain: 'Social Affect',
        scoring: {
          weights: { '0': 0, '1': 1, '2': 2, '3': 3 },
          interpretation: {
            '0': 'Appropriate response',
            '1': 'Mild impairment',
            '2': 'Moderate impairment',
            '3': 'Severe impairment'
          }
        }
      },
      {
        id: 'ados_sa_2',
        question: 'Unusual Eye Contact',
        type: 'rating',
        options: ['0', '1', '2'],
        required: true,
        domain: 'Social Affect',
        scoring: {
          weights: { '0': 0, '1': 1, '2': 2 },
          interpretation: {
            '0': 'Appropriate eye contact',
            '1': 'Mild abnormality',
            '2': 'Marked abnormality'
          }
        }
      },
      {
        id: 'ados_rrb_1',
        question: 'Hand and Finger Mannerisms',
        type: 'rating',
        options: ['0', '1', '2', '3'],
        required: true,
        domain: 'Restricted and Repetitive Behaviors',
        scoring: {
          weights: { '0': 0, '1': 1, '2': 2, '3': 3 },
          interpretation: {
            '0': 'No unusual mannerisms',
            '1': 'Mild mannerisms',
            '2': 'Moderate mannerisms',
            '3': 'Severe mannerisms'
          }
        }
      }
    ],
    scoring: {
      maxScore: 28,
      cutoffScores: {
        'autism': 10,
        'autism_spectrum': 7,
        'little_to_no_concern': 6
      },
      interpretation: {
        'autism': 'Meets criteria for autism',
        'autism_spectrum': 'On the autism spectrum',
        'little_to_no_concern': 'Little to no concern for autism'
      }
    }
  },
  {
    id: 'adir',
    name: 'ADI-R (Autism Diagnostic Interview-Revised)',
    description: 'Comprehensive developmental history interview',
    ageRange: '2 years - Adult',
    duration: '90-120 minutes',
    domains: ['Language/Communication', 'Social Interaction', 'Restricted/Repetitive Behaviors'],
    standardization: {
      norms: 'International validation studies',
      reliability: 0.95,
      validity: 'Excellent concurrent validity with ADOS'
    },
    questions: [
      {
        id: 'adir_lang_1',
        question: 'Overall level of language (current)',
        type: 'multiple_choice',
        options: [
          'Uses complex sentences',
          'Uses simple sentences',
          'Uses phrases',
          'Uses single words',
          'No meaningful language'
        ],
        required: true,
        domain: 'Language/Communication'
      },
      {
        id: 'adir_social_1',
        question: 'Use of other\'s body to communicate',
        type: 'rating',
        options: ['0', '1', '2', '3'],
        required: true,
        domain: 'Social Interaction'
      }
    ],
    scoring: {
      maxScore: 60,
      cutoffScores: {
        'autism': 30,
        'broad_autism_phenotype': 20,
        'no_concerns': 15
      },
      interpretation: {
        'autism': 'Meets ADI-R criteria for autism',
        'broad_autism_phenotype': 'Broad autism phenotype',
        'no_concerns': 'Does not meet autism criteria'
      }
    }
  },
  {
    id: 'mchat-r',
    name: 'M-CHAT-R (Modified Checklist for Autism in Toddlers)',
    description: 'Screening tool for autism in toddlers',
    ageRange: '16-30 months',
    duration: '5-10 minutes',
    domains: ['Social Communication', 'Behavioral Indicators'],
    standardization: {
      norms: 'Large-scale population studies',
      reliability: 0.85,
      validity: 'Good screening validity'
    },
    questions: [
      {
        id: 'mchat_1',
        question: 'If you point at something across the room, does your child look at it?',
        type: 'yes_no',
        required: true,
        domain: 'Social Communication',
        scoring: {
          weights: { 'yes': 0, 'no': 1 },
          interpretation: {
            'yes': 'Typical development',
            'no': 'Potential concern'
          }
        }
      },
      {
        id: 'mchat_2',
        question: 'Does your child ever use his/her index finger to point, to ask for something?',
        type: 'yes_no',
        required: true,
        domain: 'Social Communication',
        scoring: {
          weights: { 'yes': 0, 'no': 1 },
          interpretation: {
            'yes': 'Typical development',
            'no': 'Potential concern'
          }
        }
      },
      {
        id: 'mchat_3',
        question: 'Does your child enjoy playing peek-a-boo/hide-and-seek?',
        type: 'yes_no',
        required: true,
        domain: 'Social Communication',
        scoring: {
          weights: { 'yes': 0, 'no': 1 },
          interpretation: {
            'yes': 'Typical development',
            'no': 'Potential concern'
          }
        }
      },
      {
        id: 'mchat_4',
        question: 'Does your child ever pretend, for example, to talk on the phone or take care of dolls, or pretend other things?',
        type: 'yes_no',
        required: true,
        domain: 'Behavioral Indicators',
        scoring: {
          weights: { 'yes': 0, 'no': 1 },
          interpretation: {
            'yes': 'Typical development',
            'no': 'Potential concern'
          }
        }
      },
      {
        id: 'mchat_5',
        question: 'Does your child seem oversensitive to noise?',
        type: 'yes_no',
        required: true,
        domain: 'Behavioral Indicators',
        scoring: {
          weights: { 'yes': 1, 'no': 0 },
          interpretation: {
            'yes': 'Potential concern',
            'no': 'Typical development'
          }
        }
      }
    ],
    scoring: {
      maxScore: 20,
      cutoffScores: {
        'high_risk': 8,
        'medium_risk': 3,
        'low_risk': 2
      },
      interpretation: {
        'high_risk': 'High risk for autism - immediate evaluation recommended',
        'medium_risk': 'Medium risk - follow-up screening recommended',
        'low_risk': 'Low risk for autism at this time'
      }
    }
  },
  {
    id: 'srs-2',
    name: 'SRS-2 (Social Responsiveness Scale)',
    description: 'Quantifies social communication impairments',
    ageRange: '2.5 years - Adult',
    duration: '15-20 minutes',
    domains: ['Social Awareness', 'Social Cognition', 'Social Communication', 'Social Motivation', 'Autistic Mannerisms'],
    standardization: {
      norms: 'Normative sample of 4,500 individuals',
      reliability: 0.97,
      validity: 'Strong construct validity'
    },
    questions: [
      {
        id: 'srs_sa_1',
        question: 'Is aware of what others are thinking or feeling',
        type: 'likert_scale',
        options: ['Never', 'Sometimes', 'Often', 'Almost Always'],
        required: true,
        domain: 'Social Awareness'
      },
      {
        id: 'srs_sc_1',
        question: 'Recognizes when something is unfair',
        type: 'likert_scale',
        options: ['Never', 'Sometimes', 'Often', 'Almost Always'],
        required: true,
        domain: 'Social Cognition'
      }
    ],
    scoring: {
      maxScore: 195,
      cutoffScores: {
        'severe_range': 76,
        'moderate_range': 66,
        'mild_range': 60,
        'normal_range': 59
      },
      interpretation: {
        'severe_range': 'Severe deficiencies in social behavior',
        'moderate_range': 'Moderate deficiencies in social behavior',
        'mild_range': 'Mild deficiencies in social behavior',
        'normal_range': 'Typical social behavior'
      }
    }
  },
  {
    id: 'cars-2',
    name: 'CARS-2 (Childhood Autism Rating Scale)',
    description: 'Standardized autism rating scale',
    ageRange: '2 years - Adult',
    duration: '20-30 minutes',
    domains: ['Social Interaction', 'Communication', 'Sensory Processing', 'Behavioral Patterns'],
    standardization: {
      norms: 'Clinical and community samples',
      reliability: 0.94,
      validity: 'Excellent diagnostic accuracy'
    },
    questions: [
      {
        id: 'cars_social_1',
        question: 'Relating to people',
        type: 'rating',
        options: ['1', '1.5', '2', '2.5', '3', '3.5', '4'],
        required: true,
        domain: 'Social Interaction'
      },
      {
        id: 'cars_comm_1',
        question: 'Verbal communication',
        type: 'rating',
        options: ['1', '1.5', '2', '2.5', '3', '3.5', '4'],
        required: true,
        domain: 'Communication'
      }
    ],
    scoring: {
      maxScore: 60,
      cutoffScores: {
        'severe_autism': 37,
        'mild_to_moderate_autism': 30,
        'no_autism': 29.5
      },
      interpretation: {
        'severe_autism': 'Severe autism symptoms',
        'mild_to_moderate_autism': 'Mild to moderate autism symptoms',
        'no_autism': 'No significant autism symptoms'
      }
    }
  }
];

export function AssessmentTools() {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<AssessmentSession | null>(null);
  const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [observationalNotes, setObservationalNotes] = useState('');
  const [environmentalFactors, setEnvironmentalFactors] = useState<string[]>([]);

  const selectedAssessment = assessmentTools.find(tool => tool.id === selectedTool);
  const progress = selectedAssessment ?
    (Object.keys(responses).length / selectedAssessment.questions.length) * 100 : 0;

  const startAssessment = (toolId: string, childId: string = 'demo-child') => {
    const session: AssessmentSession = {
      id: Date.now().toString(),
      toolId,
      childId,
      assessorId: 'current-user',
      startTime: new Date(),
      responses: [],
      status: 'in_progress',
      observationalNotes: '',
      environmentalFactors: []
    };

    setCurrentSession(session);
    setSelectedTool(toolId);
    setResponses({});
    setCurrentQuestionIndex(0);
    setObservationalNotes('');
    setEnvironmentalFactors([]);
  };

  const recordResponse = (questionId: string, response: string | string[] | number, notes?: string) => {
    const newResponse: AssessmentResponse = {
      questionId,
      response,
      notes
    };

    setResponses(prev => ({
      ...prev,
      [questionId]: newResponse
    }));

    // Auto-advance to next question for single-response questions
    if (selectedAssessment && currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 500);
    }
  };

  const calculateScore = (): { totalScore: number; domainScores: Record<string, number>; interpretation: string } => {
    if (!selectedAssessment) {
      return { totalScore: 0, domainScores: {}, interpretation: '' };
    }

    let totalScore = 0;
    const domainScores: Record<string, number> = {};

    // Initialize domain scores
    selectedAssessment.domains.forEach(domain => {
      domainScores[domain] = 0;
    });

    // Calculate scores
    selectedAssessment.questions.forEach(question => {
      const response = responses[question.id];
      if (response && question.scoring) {
        const weight = question.scoring.weights[String(response.response)] || 0;
        totalScore += weight;

        if (question.domain) {
          domainScores[question.domain] = (domainScores[question.domain] || 0) + weight;
        }
      }
    });

    // Determine interpretation
    let interpretation = '';
    const cutoffScores = selectedAssessment.scoring.cutoffScores;

    for (const [level, cutoff] of Object.entries(cutoffScores)) {
      if (totalScore >= cutoff) {
        interpretation = selectedAssessment.scoring.interpretation[level] || level;
        break;
      }
    }

    return { totalScore, domainScores, interpretation };
  };

  const completeAssessment = () => {
    if (!currentSession || !selectedAssessment) return;

    const { totalScore, domainScores, interpretation } = calculateScore();

    const completedSession: AssessmentSession = {
      ...currentSession,
      endTime: new Date(),
      status: 'completed',
      responses: Object.values(responses),
      observationalNotes,
      environmentalFactors,
      totalScore,
      domainScores,
      interpretation,
      recommendations: generateRecommendations(totalScore, domainScores, selectedAssessment)
    };

    setCurrentSession(completedSession);

    // Here you would typically save to database
    console.log('Assessment completed:', completedSession);
  };

  const generateRecommendations = (
    totalScore: number,
    domainScores: Record<string, number>,
    tool: AssessmentTool
  ): string[] => {
    const recommendations: string[] = [];

    // Tool-specific recommendations
    switch (tool.id) {
      case 'mchat-r':
        if (totalScore >= 8) {
          recommendations.push('Immediate comprehensive autism evaluation recommended');
          recommendations.push('Refer to developmental pediatrician or child psychologist');
          recommendations.push('Consider early intervention services');
        } else if (totalScore >= 3) {
          recommendations.push('Follow-up screening in 1-2 months');
          recommendations.push('Monitor developmental milestones closely');
        }
        break;

      case 'ados-2':
        if (totalScore >= 10) {
          recommendations.push('Meets criteria for autism spectrum disorder');
          recommendations.push('Recommend comprehensive diagnostic assessment');
          recommendations.push('Begin autism-specific interventions');
        } else if (totalScore >= 7) {
          recommendations.push('On the autism spectrum - consider additional assessment');
          recommendations.push('Monitor for changes over time');
        }
        break;

      case 'srs-2':
        if (totalScore >= 76) {
          recommendations.push('Severe social communication deficits identified');
          recommendations.push('Intensive social skills intervention recommended');
          recommendations.push('Consider specialized educational placement');
        } else if (totalScore >= 60) {
          recommendations.push('Social communication support needed');
          recommendations.push('Regular monitoring and intervention');
        }
        break;
    }

    // Domain-specific recommendations
    Object.entries(domainScores).forEach(([domain, score]) => {
      if (domain === 'Social Communication' && score > 5) {
        recommendations.push('Speech-language therapy evaluation recommended');
        recommendations.push('Social communication intervention needed');
      }
      if (domain === 'Restricted and Repetitive Behaviors' && score > 3) {
        recommendations.push('Behavioral intervention for repetitive behaviors');
        recommendations.push('Sensory assessment may be beneficial');
      }
    });

    return recommendations.length > 0 ? recommendations : ['No specific concerns identified at this time'];
  };

  const renderQuestion = (question: AssessmentQuestion, index: number) => {
    const response = responses[question.id];

    return (
      <Card key={question.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
              {question.domain && (
                <Badge variant="outline" className="mt-1">
                  {question.domain}
                </Badge>
              )}
            </div>
            <div className="text-sm text-slate-500">
              {question.required && <span className="text-red-500">*</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base font-medium">{question.question}</p>

          {question.type === 'yes_no' && (
            <RadioGroup
              value={String(response?.response || '')}
              onValueChange={(value) => recordResponse(question.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}_yes`} />
                <Label htmlFor={`${question.id}_yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}_no`} />
                <Label htmlFor={`${question.id}_no`}>No</Label>
              </div>
            </RadioGroup>
          )}

          {question.type === 'multiple_choice' && (
            <RadioGroup
              value={String(response?.response || '')}
              onValueChange={(value) => recordResponse(question.id, value)}
            >
              {question.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}_${idx}`} />
                  <Label htmlFor={`${question.id}_${idx}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'likert_scale' && (
            <RadioGroup
              value={String(response?.response || '')}
              onValueChange={(value) => recordResponse(question.id, value)}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {question.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2 border rounded">
                    <RadioGroupItem value={option} id={`${question.id}_${idx}`} />
                    <Label htmlFor={`${question.id}_${idx}`} className="text-sm">{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {question.type === 'rating' && (
            <div className="space-y-2">
              <div className="flex space-x-2">
                {question.options?.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={response?.response === option ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => recordResponse(question.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {question.scoring && (
                <div className="text-xs text-slate-500">
                  {Object.entries(question.scoring.interpretation).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {question.type === 'text' && (
            <Textarea
              value={String(response?.response || '')}
              onChange={(e) => recordResponse(question.id, e.target.value)}
              placeholder="Enter your response..."
              rows={3}
            />
          )}

          <div className="mt-4">
            <Label htmlFor={`notes_${question.id}`} className="text-sm text-slate-600">
              Observational Notes (Optional)
            </Label>
            <Textarea
              id={`notes_${question.id}`}
              value={response?.notes || ''}
              onChange={(e) => {
                const currentResponse = responses[question.id];
                if (currentResponse) {
                  setResponses(prev => ({
                    ...prev,
                    [question.id]: { ...currentResponse, notes: e.target.value }
                  }));
                }
              }}
              placeholder="Add any observational notes..."
              rows={2}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!selectedTool) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Professional Assessment Tools</h1>
            <p className="text-slate-600">Standardized autism assessment instruments</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {assessmentTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <CardDescription className="mt-1">{tool.description}</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {tool.questions.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Age Range:</span>
                    <br />
                    <span className="text-slate-600">{tool.ageRange}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Duration:</span>
                    <br />
                    <span className="text-slate-600">{tool.duration}</span>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-slate-700 text-sm">Domains:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tool.domains.map((domain, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Reliability: {tool.standardization.reliability}</div>
                  <div>Validity: {tool.standardization.validity}</div>
                </div>

                <Button
                  onClick={() => startAssessment(tool.id)}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (currentSession?.status === 'completed') {
    const { totalScore, domainScores, interpretation } = calculateScore();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assessment Complete</h1>
            <p className="text-slate-600">{selectedAssessment?.name}</p>
          </div>
          <Button onClick={() => setSelectedTool('')} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Total Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
              <div className="text-sm text-slate-500">
                out of {selectedAssessment?.scoring.maxScore}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Interpretation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-slate-900">{interpretation}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span>Duration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                {currentSession.endTime && currentSession.startTime && (
                  Math.round((currentSession.endTime.getTime() - currentSession.startTime.getTime()) / 60000)
                )} minutes
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(domainScores).map(([domain, score]) => (
                <div key={domain} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{domain}</span>
                  <span className="text-sm text-slate-900">{score}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentSession.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {observationalNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Observational Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{observationalNotes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-4">
          <Button className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send to Family
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{selectedAssessment?.name}</h1>
          <p className="text-slate-600">{selectedAssessment?.description}</p>
        </div>
        <Button onClick={() => setSelectedTool('')} variant="outline">
          Back to Tools
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium">Age Range</div>
              <div className="text-xs text-slate-500">{selectedAssessment?.ageRange}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-medium">Duration</div>
              <div className="text-xs text-slate-500">{selectedAssessment?.duration}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium">Questions</div>
              <div className="text-xs text-slate-500">{selectedAssessment?.questions.length} items</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-sm font-medium">Progress</div>
              <div className="text-xs text-slate-500">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assessment Progress</CardTitle>
            <div className="text-sm text-slate-500">
              {Object.keys(responses).length} of {selectedAssessment?.questions.length} completed
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="notes">Observational Notes</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {selectedAssessment?.questions.map((question, index) =>
            renderQuestion(question, index)
          )}

          {Object.keys(responses).length === selectedAssessment?.questions.length && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">All questions completed</span>
                  </div>
                  <Button onClick={completeAssessment} className="bg-green-600 hover:bg-green-700">
                    Complete Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Observational Notes</CardTitle>
              <CardDescription>
                Record behavioral observations, environmental factors, and other relevant information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={observationalNotes}
                onChange={(e) => setObservationalNotes(e.target.value)}
                placeholder="Record observations about behavior, attention, engagement, sensory responses, etc."
                rows={8}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Factors</CardTitle>
              <CardDescription>
                Note environmental conditions that may affect assessment results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Quiet environment',
                  'Noisy environment',
                  'Distractions present',
                  'Parent present',
                  'Sibling present',
                  'Familiar setting',
                  'Clinical setting',
                  'Morning session',
                  'Afternoon session',
                  'Child tired',
                  'Child alert',
                  'Sensory accommodations'
                ].map((factor) => (
                  <div key={factor} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor}
                      checked={environmentalFactors.includes(factor)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEnvironmentalFactors(prev => [...prev, factor]);
                        } else {
                          setEnvironmentalFactors(prev => prev.filter(f => f !== factor));
                        }
                      }}
                    />
                    <Label htmlFor={factor} className="text-sm">{factor}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
