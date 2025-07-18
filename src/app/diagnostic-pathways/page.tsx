'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  MessageSquare,
  Heart,
  Users,
  Activity,
  Eye,
  Ear,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Settings,
  Filter,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Multi-Diagnostic Pathway Engine for 638,745+ EHCPs
const DIAGNOSTIC_PATHWAYS = {
  ASD: {
    name: 'Autism Spectrum Disorder',
    prevalence: 31.5,
    totalCases: 201185,
    growthRate: 18.2,
    icon: Brain,
    color: 'from-purple-600 to-indigo-600',

    assessmentStages: [
      {
        stage: 1,
        title: 'Initial Screening',
        duration: '2-4 weeks',
        professionals: ['GP', 'School SENCO', 'Health Visitor'],
        tools: ['M-CHAT-R', 'SCQ', 'Developmental History'],
        outcomes: ['Referral to specialist team', 'Early intervention', 'Monitoring plan']
      },
      {
        stage: 2,
        title: 'Multi-Disciplinary Assessment',
        duration: '8-12 weeks',
        professionals: ['Clinical Psychologist', 'Paediatrician', 'SALT', 'OT'],
        tools: ['ADOS-2', 'ADI-R', 'Cognitive Assessment', 'Sensory Profile'],
        outcomes: ['Diagnostic formulation', 'Support recommendations', 'Intervention plan']
      },
      {
        stage: 3,
        title: 'Support Planning',
        duration: '4-6 weeks',
        professionals: ['Educational Psychologist', 'SENCO', 'Family Support'],
        tools: ['Educational assessment', 'Functional assessment', 'Environment audit'],
        outcomes: ['EHC plan draft', 'Provision mapping', 'Transition planning']
      }
    ],

    interventions: {
      communication: [
        'PECS (Picture Exchange Communication System)',
        'Social Stories',
        'Video modeling',
        'Peer-mediated interventions',
        'AAC (Augmentative and Alternative Communication)'
      ],
      sensory: [
        'Sensory diet implementation',
        'Environmental modifications',
        'Sensory breaks scheduling',
        'Proprioceptive activities',
        'Calming strategies'
      ],
      behavioral: [
        'Applied Behavior Analysis (ABA)',
        'Positive Behavior Support',
        'Visual schedules and supports',
        'Transition warnings',
        'Self-regulation techniques'
      ],
      social: [
        'Social skills groups',
        'Friendship clubs',
        'Lunchtime support',
        'Peer buddy systems',
        'Social narrative development'
      ]
    },

    ageSpecific: {
      'Early Years (4-5)': {
        focus: ['Play skills', 'Communication development', 'Routine establishment'],
        provision: ['Specialist nursery support', '1:1 TA', 'SALT 2hrs/week'],
        environment: ['Structured play areas', 'Visual timetables', 'Quiet spaces']
      },
      'Primary (5-11)': {
        focus: ['Academic access', 'Peer relationships', 'Independence skills'],
        provision: ['In-class support', 'Social skills groups', 'OT 1hr/week'],
        environment: ['Sensory regulation space', 'Movement breaks', 'Clear expectations']
      },
      'Secondary (11-16)': {
        focus: ['Subject-specific support', 'Exam adaptations', 'Future planning'],
        provision: ['Subject-specific TA', 'Study skills support', 'Careers guidance'],
        environment: ['Base room access', 'Alternative lunch arrangements', 'Modified timetable']
      },
      'Post-16 (16-25)': {
        focus: ['Independence preparation', 'Employment skills', 'Adult service transition'],
        provision: ['Supported internships', 'Life skills training', 'Transition coordinator'],
        environment: ['Workplace adaptations', 'Travel training', 'Independent living support']
      }
    }
  },

  SLCN: {
    name: 'Speech, Language & Communication Needs',
    prevalence: 21.3,
    totalCases: 136033,
    growthRate: 8.5,
    icon: MessageSquare,
    color: 'from-blue-600 to-cyan-600',

    assessmentStages: [
      {
        stage: 1,
        title: 'Language Screening',
        duration: '1-2 weeks',
        professionals: ['SALT', 'Teacher', 'Health Visitor'],
        tools: ['CELF-5', 'BPVS', 'Language samples'],
        outcomes: ['Baseline establishment', 'Referral pathway', 'Initial strategies']
      },
      {
        stage: 2,
        title: 'Comprehensive Assessment',
        duration: '6-8 weeks',
        professionals: ['Specialist SALT', 'Educational Psychologist', 'Audiologist'],
        tools: ['Detailed language assessment', 'Hearing tests', 'Cognitive evaluation'],
        outcomes: ['Specific diagnosis', 'Intervention targets', 'Communication profile']
      },
      {
        stage: 3,
        title: 'Intervention Planning',
        duration: '3-4 weeks',
        professionals: ['SALT', 'SENCO', 'Class Teacher'],
        tools: ['Goal setting framework', 'Intervention planning', 'Progress monitoring'],
        outcomes: ['Therapy plan', 'Classroom strategies', 'Family support plan']
      }
    ],

    interventions: {
      expressive: [
        'Vocabulary building programs',
        'Sentence structure practice',
        'Word retrieval strategies',
        'Narrative development',
        'Conversation skills training'
      ],
      receptive: [
        'Listening skills development',
        'Following instructions practice',
        'Comprehension strategies',
        'Key word identification',
        'Question understanding'
      ],
      pragmatic: [
        'Social communication groups',
        'Turn-taking practice',
        'Non-verbal communication',
        'Context understanding',
        'Repair strategies'
      ],
      phonological: [
        'Phonics intervention',
        'Sound discrimination',
        'Rhyming activities',
        'Syllable awareness',
        'Letter-sound correspondence'
      ]
    },

    ageSpecific: {
      'Early Years (4-5)': {
        focus: ['Vocabulary expansion', 'Pre-literacy skills', 'Social communication'],
        provision: ['SALT 3hrs/week', 'Language group', 'Pre-school support'],
        environment: ['Language-rich environment', 'Visual supports', 'Repetition and routine']
      },
      'Primary (5-11)': {
        focus: ['Curriculum access', 'Literacy development', 'Social interaction'],
        provision: ['In-class SALT support', 'Reading intervention', 'Communication group'],
        environment: ['Clear instructions', 'Processing time', 'Visual scaffolds']
      },
      'Secondary (11-16)': {
        focus: ['Subject vocabulary', 'Written expression', 'Exam access'],
        provision: ['Subject-specific vocabulary', 'Writing support', 'Oral exams'],
        environment: ['Extended time', 'Clear task breakdown', 'Communication aids']
      },
      'Post-16 (16-25)': {
        focus: ['Workplace communication', 'Independent living', 'Social relationships'],
        provision: ['Functional communication', 'Job interview skills', 'Social skills'],
        environment: ['Workplace adaptations', 'Communication supports', 'Advocacy training']
      }
    }
  },

  SEMH: {
    name: 'Social, Emotional & Mental Health',
    prevalence: 20.7,
    totalCases: 132206,
    growthRate: 15.3,
    icon: Heart,
    color: 'from-red-600 to-pink-600',

    assessmentStages: [
      {
        stage: 1,
        title: 'Initial Concerns Assessment',
        duration: '1-2 weeks',
        professionals: ['Class Teacher', 'SENCO', 'Mental Health Lead'],
        tools: ['SDQ', 'Boxall Profile', 'Behavior observations'],
        outcomes: ['Risk assessment', 'Immediate support', 'Referral decision']
      },
      {
        stage: 2,
        title: 'Mental Health Assessment',
        duration: '6-10 weeks',
        professionals: ['Clinical Psychologist', 'Psychiatrist', 'Mental Health Practitioner'],
        tools: ['Clinical interview', 'Standardized assessments', 'Family assessment'],
        outcomes: ['Mental health diagnosis', 'Risk formulation', 'Treatment plan']
      },
      {
        stage: 3,
        title: 'Educational Psychology Assessment',
        duration: '4-6 weeks',
        professionals: ['Educational Psychologist', 'SENCO', 'Family Support'],
        tools: ['Cognitive assessment', 'Educational needs analysis', 'Environmental assessment'],
        outcomes: ['Learning profile', 'Educational strategies', 'Provision recommendations']
      }
    ],

    interventions: {
      emotional: [
        'Emotional literacy programs',
        'Mindfulness and relaxation',
        'Emotion regulation strategies',
        'Cognitive behavioral techniques',
        'Therapeutic story work'
      ],
      behavioral: [
        'Positive behavior support',
        'Restorative approaches',
        'Clear boundaries and expectations',
        'Reward systems',
        'De-escalation strategies'
      ],
      social: [
        'Social skills training',
        'Friendship groups',
        'Conflict resolution',
        'Peer mediation',
        'Community involvement'
      ],
      academic: [
        'Differentiated curriculum',
        'Alternative assessments',
        'Flexible learning approaches',
        'Strengths-based learning',
        'Personalized learning plans'
      ]
    },

    ageSpecific: {
      'Early Years (4-5)': {
        focus: ['Emotional regulation', 'Attachment security', 'Play therapy'],
        provision: ['Nurture group', 'Play therapy', 'Family support'],
        environment: ['Consistent adults', 'Predictable routines', 'Safe spaces']
      },
      'Primary (5-11)': {
        focus: ['Emotional literacy', 'Friendship skills', 'Learning engagement'],
        provision: ['Counseling support', 'Social skills groups', 'Mentoring'],
        environment: ['Calm learning spaces', 'Regular check-ins', 'Flexible approaches']
      },
      'Secondary (11-16)': {
        focus: ['Mental health support', 'Academic resilience', 'Future planning'],
        provision: ['Therapeutic intervention', 'Alternative provision', 'Career guidance'],
        environment: ['Safe base', 'Flexible timetable', 'Mental health first aid']
      },
      'Post-16 (16-25)': {
        focus: ['Independence skills', 'Employment preparation', 'Adult mental health'],
        provision: ['Supported employment', 'Life skills training', 'Mental health services'],
        environment: ['Graduated independence', 'Support networks', 'Crisis planning']
      }
    }
  }
};

export default function DiagnosticPathwaysPage() {
  const [selectedPathway, setSelectedPathway] = useState('ASD');
  const [selectedAge, setSelectedAge] = useState('Primary (5-11)');
  const [currentStage, setCurrentStage] = useState(1);

  const pathway = DIAGNOSTIC_PATHWAYS[selectedPathway as keyof typeof DIAGNOSTIC_PATHWAYS];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                Multi-Diagnostic Pathway Engine
              </h1>
              <p className="text-gray-600 mt-2">
                Specialized workflows for ASD, SLCN, SEMH addressing 638,745+ EHCPs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800">✅ IMPLEMENTED</Badge>
              <Badge className="bg-blue-100 text-blue-800">Evidence-Based Pathways</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Diagnostic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(DIAGNOSTIC_PATHWAYS).map(([key, diagnosis]) => {
            const Icon = diagnosis.icon;
            const isSelected = selectedPathway === key;

            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? 'border-2 border-blue-500 shadow-lg' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPathway(key)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${diagnosis.color} flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {isSelected && <CheckCircle2 className="h-6 w-6 text-blue-500" />}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{diagnosis.name}</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prevalence:</span>
                      <span className="font-medium">{diagnosis.prevalence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cases:</span>
                      <span className="font-medium">{diagnosis.totalCases.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className="font-medium text-orange-600">+{diagnosis.growthRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pathway Content */}
        <Tabs defaultValue="overview" className="space-y-6">

          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="age-specific">Age-Specific</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {React.createElement(pathway.icon, { className: "h-6 w-6 mr-2" })}
                    {pathway.name} Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{pathway.prevalence}%</div>
                        <div className="text-sm text-blue-800">of all EHCPs</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{pathway.totalCases.toLocaleString()}</div>
                        <div className="text-sm text-green-800">current cases</div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center mb-2">
                        <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="font-semibold text-orange-900">Growth Trend</span>
                      </div>
                      <div className="text-sm text-orange-800">
                        {pathway.growthRate}% annual increase - requiring specialized resource scaling
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Pathway Characteristics</h4>
                      <div className="text-sm text-purple-800 space-y-1">
                        <div>• Evidence-based assessment protocols</div>
                        <div>• Multi-disciplinary team approach</div>
                        <div>• Age-appropriate interventions</div>
                        <div>• Outcome-focused planning</div>
                        <div>• Family-centered support</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Journey Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pathway.assessmentStages.map((stage, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          currentStage === stage.stage
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Stage {stage.stage}: {stage.title}</h4>
                          <Badge variant="outline">{stage.duration}</Badge>
                        </div>

                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Professionals:</span> {stage.professionals.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Key Tools:</span> {stage.tools.join(', ')}
                          </div>
                        </div>

                        {currentStage === stage.stage && (
                          <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                            <strong>Expected Outcomes:</strong> {stage.outcomes.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Pathway for {pathway.name}</CardTitle>
                <p className="text-gray-600">
                  Comprehensive {pathway.assessmentStages.length}-stage assessment process
                </p>
              </CardHeader>
              <CardContent>

                {/* Stage Navigation */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-2">
                    {pathway.assessmentStages.map((stage, index) => (
                      <React.Fragment key={stage.stage}>
                        <button
                          onClick={() => setCurrentStage(stage.stage)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            currentStage === stage.stage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {stage.stage}
                        </button>
                        {index < pathway.assessmentStages.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Current Stage Details */}
                {(() => {
                  const stage = pathway.assessmentStages.find(s => s.stage === currentStage);
                  if (!stage) return null;

                  return (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">Stage {stage.stage}: {stage.title}</h3>
                        <Badge className="bg-blue-100 text-blue-800">Duration: {stage.duration}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <Users className="h-5 w-5 mr-2" />
                              Professionals Involved
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {stage.professionals.map((prof, index) => (
                                <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="text-sm">{prof}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <FileText className="h-5 w-5 mr-2" />
                              Assessment Tools
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {stage.tools.map((tool, index) => (
                                <div key={index} className="flex items-center p-2 bg-blue-50 rounded">
                                  <Star className="h-4 w-4 text-blue-500 mr-2" />
                                  <span className="text-sm">{tool}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <Target className="h-5 w-5 mr-2" />
                              Expected Outcomes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {stage.outcomes.map((outcome, index) => (
                                <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                                  <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="text-sm">{outcome}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })()}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidence-Based Interventions for {pathway.name}</CardTitle>
                <p className="text-gray-600">
                  Specialized intervention categories based on {pathway.totalCases.toLocaleString()} cases
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(pathway.interventions).map(([category, interventions]) => (
                    <Card key={category} className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg capitalize">{category} Interventions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {interventions.map((intervention, index) => (
                            <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                              <Sparkles className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium text-sm">{intervention}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Age-Specific Tab */}
          <TabsContent value="age-specific" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Age-Appropriate Pathways for {pathway.name}</CardTitle>
                <div className="flex items-center space-x-3 mt-3">
                  <label className="text-sm font-medium">Select Age Group:</label>
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    {Object.keys(pathway.ageSpecific).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const ageData = pathway.ageSpecific[selectedAge as keyof typeof pathway.ageSpecific];
                  if (!ageData) return null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <CardTitle className="text-lg">Key Focus Areas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {ageData.focus.map((focus, index) => (
                              <div key={index} className="flex items-center p-2 bg-blue-50 rounded">
                                <Target className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="text-sm">{focus}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                          <CardTitle className="text-lg">Recommended Provision</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {ageData.provision.map((provision, index) => (
                              <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm">{provision}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-orange-500">
                        <CardHeader>
                          <CardTitle className="text-lg">Environment Adaptations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {ageData.environment.map((env, index) => (
                              <div key={index} className="flex items-center p-2 bg-orange-50 rounded">
                                <Settings className="h-4 w-4 text-orange-600 mr-2" />
                                <span className="text-sm">{env}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Monitoring & Outcomes</CardTitle>
                <p className="text-gray-600">
                  Continuous assessment and adjustment based on evidence
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <Card className="border border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Monitoring Framework</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Weekly Monitoring</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Intervention fidelity checks</li>
                            <li>• Immediate outcome tracking</li>
                            <li>• Environmental assessment</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2">Monthly Reviews</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Progress toward outcomes</li>
                            <li>• Intervention effectiveness</li>
                            <li>• Stakeholder feedback</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h5 className="font-semibold text-purple-900 mb-2">Termly Assessment</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Comprehensive outcome review</li>
                            <li>• Provision adjustment</li>
                            <li>• Transition planning</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Success Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2">Quantitative Measures</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Standardized assessment scores</li>
                            <li>• Frequency of target behaviors</li>
                            <li>• Academic progress metrics</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Qualitative Indicators</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Quality of relationships</li>
                            <li>• Participation in activities</li>
                            <li>• Well-being and happiness</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-orange-50 rounded-lg">
                          <h5 className="font-semibold text-orange-900 mb-2">Functional Outcomes</h5>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Independence in daily tasks</li>
                            <li>• Community participation</li>
                            <li>• Future readiness</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
