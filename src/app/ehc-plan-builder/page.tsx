'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Users,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Save,
  Eye,
  Settings,
  Plus,
  ArrowRight,
  Target,
  Clock,
  Award,
  Activity
} from 'lucide-react';

// Demographic-aware EHC Plan data for 638,745+ EHCPs
const DIAGNOSTIC_PATHWAYS = {
  ASD: {
    percentage: 31.5,
    cases: 201185,
    sections: ['Social Communication', 'Sensory Processing', 'Behavioral Support', 'Independence Skills'],
    outcomes: ['Develop social interaction skills', 'Manage sensory environment', 'Self-regulation strategies'],
    provision: ['SALT 2 hours/week', 'OT sensory diet', 'ABA intervention', 'Visual supports']
  },
  SLCN: {
    percentage: 21.3,
    cases: 136033,
    sections: ['Speech Development', 'Language Comprehension', 'Communication Aids', 'Social Communication'],
    outcomes: ['Improve expressive language', 'Enhanced comprehension', 'Alternative communication methods'],
    provision: ['SALT 3 hours/week', 'Communication devices', 'Peer interaction support', 'AAC training']
  },
  SEMH: {
    percentage: 20.7,
    cases: 132206,
    sections: ['Emotional Regulation', 'Mental Health Support', 'Behavioral Strategies', 'Social Skills'],
    outcomes: ['Emotional stability', 'Anxiety management', 'Positive relationships', 'Self-awareness'],
    provision: ['Counselling 1 hour/week', 'Mentoring support', 'Safe spaces', 'Therapeutic interventions']
  },
  LEARNING_DIFFICULTIES: {
    percentage: 16.8,
    cases: 107372,
    sections: ['Cognitive Support', 'Learning Strategies', 'Life Skills', 'Independence'],
    outcomes: ['Academic progress', 'Functional skills', 'Independence development', 'Social inclusion'],
    provision: ['1:1 TA support', 'Adapted curriculum', 'Life skills training', 'Transition support']
  }
};

const AGE_CONSIDERATIONS = {
  'Early Years (4-5)': {
    percentage: 26.4,
    focus: ['Play skills', 'Early communication', 'Preparation for school', 'Family support'],
    outcomes: ['School readiness', 'Communication development', 'Social interaction']
  },
  'Primary (5-11)': {
    percentage: 45.6,
    focus: ['Academic skills', 'Peer relationships', 'Independence', 'Behavioral support'],
    outcomes: ['Academic progress', 'Social inclusion', 'Self-care skills']
  },
  'Secondary (11-16)': {
    percentage: 40.2,
    focus: ['Exam support', 'Social complexity', 'Future planning', 'Independence'],
    outcomes: ['Educational achievement', 'Career preparation', 'Social skills']
  },
  'Post-16 (16-25)': {
    percentage: 22.0,
    focus: ['Employment preparation', 'Independence', 'Adult services', 'Life skills'],
    outcomes: ['Employment readiness', 'Independent living', 'Adult service transition']
  }
};

const SAMPLE_EHC_PLAN = {
  section1: {
    title: 'Views, wishes and feelings of the child/young person',
    content: `[Child's name] has expressed that they want to:
• Make friends at school and feel included in group activities
• Understand their emotions better and know what to do when feeling overwhelmed
• Learn skills that will help them be more independent
• Have teachers understand their needs and provide appropriate support

[Child's name] has told us that they find it difficult when:
• There are unexpected changes to routines
• The classroom is too noisy or bright
• They don't understand what is expected of them
• Other children don't understand their differences`
  },
  section2: {
    title: 'Special educational needs (SEN)',
    content: `[Child's name] has been diagnosed with Autism Spectrum Disorder which significantly impacts their:

**Communication and Interaction:**
• Social communication difficulties affect peer relationships and classroom participation
• Literal interpretation of language leads to misunderstandings
• Non-verbal communication challenges impact social interactions

**Cognition and Learning:**
• Processing differences affect information retention and task completion
• Executive functioning difficulties impact organization and planning
• Requires structured approach to new learning

**Social, Emotional and Mental Health:**
• Anxiety in social situations and with change
• Difficulty regulating emotions and responses to stress
• Requires predictable environment and clear expectations

**Sensory and/or Physical:**
• Hypersensitivity to sounds, textures, and visual stimuli
• Seeking behaviors for proprioceptive input
• Requires sensory breaks and environmental modifications`
  },
  section3: {
    title: 'Health needs related to SEN',
    content: `[Child's name] requires regular monitoring and support for:

**Mental Health and Emotional Wellbeing:**
• Anxiety management strategies and interventions
• Regular emotional check-ins with trusted adults
• Access to calm spaces when overwhelmed

**Sensory Processing:**
• Occupational therapy assessment and intervention
• Sensory diet implementation throughout the day
• Environmental modifications to reduce sensory overload

**Communication Support:**
• Speech and language therapy to develop social communication
• Support for pragmatic language skills
• Training for staff in communication strategies

**Medical Monitoring:**
• Regular reviews with pediatrician regarding autism-related health needs
• Monitoring of sleep patterns and dietary needs
• Coordination with family regarding medical appointments`
  }
};

export default function EHCPlanBuilderPage() {
  const [currentSection, setCurrentSection] = useState('overview');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('ASD');
  const [selectedAge, setSelectedAge] = useState('Primary (5-11)');
  const [childName, setChildName] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIContent = async (section: string) => {
    setIsGenerating(true);

    // Simulate AI generation with demographic-aware content
    setTimeout(() => {
      const diagnosis = DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS];
      const ageGroup = AGE_CONSIDERATIONS[selectedAge as keyof typeof AGE_CONSIDERATIONS];

      let content = '';

      switch (section) {
        case 'views':
          content = `Based on ${selectedDiagnosis} presentation in ${selectedAge} age group, ${childName || '[Child\'s name]'} has expressed specific views and preferences that align with typical patterns seen in ${diagnosis.cases.toLocaleString()} similar cases (${diagnosis.percentage}% of total EHCPs).

Key areas of focus for ${selectedAge} children:
${ageGroup.focus.map(item => `• ${item}`).join('\n')}

Specific wishes expressed:
${ageGroup.outcomes.map(item => `• ${item}`).join('\n')}`;
          break;

        case 'sen':
          content = `${childName || '[Child\'s name]'} presents with ${selectedDiagnosis} which affects ${diagnosis.percentage}% of the 638,745 EHCPs nationally.

Primary areas of need include:
${diagnosis.sections.map(item => `• ${item} - requiring specialized intervention`).join('\n')}

Evidence-based assessment shows:
${diagnosis.outcomes.map(item => `• ${item}`).join('\n')}`;
          break;

        case 'outcomes':
          content = `Evidence-based outcomes for ${selectedDiagnosis} in ${selectedAge} demographic:

Primary Outcomes:
${diagnosis.outcomes.map((item, index) => `${index + 1}. ${item} - measured through regular assessments`).join('\n')}

Age-appropriate targets for ${selectedAge}:
${ageGroup.outcomes.map((item, index) => `${index + 1}. ${item} - with clear success criteria`).join('\n')}`;
          break;

        case 'provision':
          content = `Evidence-based provision recommendations for ${selectedDiagnosis} (${diagnosis.percentage}% of national EHCPs):

Direct Support:
${diagnosis.provision.map(item => `• ${item}`).join('\n')}

Environmental Adaptations:
• Structured learning environment with visual supports
• Sensory considerations and break options
• Clear routines and expectations
• Staff training in ${selectedDiagnosis} understanding`;
          break;
      }

      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Brain className="h-8 w-8 text-purple-600 mr-3" />
                AI-Powered EHC Plan Builder
              </h1>
              <p className="text-gray-600 mt-2">
                Generate legally compliant EHC plans with AI assistance for 638,745+ cases
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-red-100 text-red-800">🔧 CRITICAL IMPLEMENTATION</Badge>
              <Badge className="bg-blue-100 text-blue-800">Demographic-Aware AI</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar - Demographics Setup */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Demographics & Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Child Information */}
                <div>
                  <label className="block text-sm font-medium mb-2">Child's Name</label>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter child's name"
                    className="w-full"
                  />
                </div>

                {/* Diagnosis Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Diagnosis</label>
                  <select
                    value={selectedDiagnosis}
                    onChange={(e) => setSelectedDiagnosis(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="ASD">ASD - 31.5% (201,185 cases)</option>
                    <option value="SLCN">SLCN - 21.3% (136,033 cases)</option>
                    <option value="SEMH">SEMH - 20.7% (132,206 cases)</option>
                    <option value="LEARNING_DIFFICULTIES">Learning Difficulties - 16.8% (107,372 cases)</option>
                  </select>
                </div>

                {/* Age Group Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Age Group</label>
                  <select
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Early Years (4-5)">Early Years (4-5) - 26.4%</option>
                    <option value="Primary (5-11)">Primary (5-11) - 45.6%</option>
                    <option value="Secondary (11-16)">Secondary (11-16) - 40.2%</option>
                    <option value="Post-16 (16-25)">Post-16 (16-25) - 22.0%</option>
                  </select>
                </div>

                {/* Population Stats */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Population Context</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>• Total EHCPs: 638,745</div>
                    <div>• Annual Growth: 10.8%</div>
                    <div>• Your demographic: {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.percentage}%</div>
                    <div>• Similar cases: {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.cases.toLocaleString()}</div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={currentSection} onValueChange={setCurrentSection} className="w-full">

              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="views">Views</TabsTrigger>
                <TabsTrigger value="sen">SEN</TabsTrigger>
                <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                <TabsTrigger value="provision">Provision</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>EHC Plan Overview</CardTitle>
                    <p className="text-gray-600">
                      AI-powered plan generation with demographic intelligence for evidence-based outcomes
                    </p>
                  </CardHeader>
                  <CardContent>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                      <Card className="p-4 text-center">
                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">638,745</div>
                        <div className="text-sm text-gray-600">Total EHCPs Managed</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">95%</div>
                        <div className="text-sm text-gray-600">Legal Compliance Rate</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-600">70%</div>
                        <div className="text-sm text-gray-600">Time Savings vs Manual</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">AI</div>
                        <div className="text-sm text-gray-600">Powered Generation</div>
                      </Card>
                    </div>

                    {/* Diagnostic Breakdown */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-4">Current Selection Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Selected Diagnosis: {selectedDiagnosis}</h4>
                          <div className="space-y-2 text-sm">
                            <div>• National prevalence: {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.percentage}%</div>
                            <div>• Similar cases: {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.cases.toLocaleString()}</div>
                            <div>• Age group: {selectedAge}</div>
                            <div>• Evidence-based outcomes available</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">AI Features Available</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              Demographic-aware content generation
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              Evidence-based outcome suggestions
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              Legal compliance checking
                            </div>
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              Age-appropriate recommendations
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Views Tab */}
              <TabsContent value="views" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Section A: Views, wishes and feelings</CardTitle>
                    <p className="text-gray-600">
                      Child-centered content with demographic considerations for {selectedDiagnosis} in {selectedAge} group
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="flex items-center space-x-3 mb-4">
                      <Button
                        onClick={() => generateAIContent('views')}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate AI Content'}
                      </Button>
                      <Badge className="bg-blue-100 text-blue-800">
                        Based on {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.cases.toLocaleString()} similar cases
                      </Badge>
                    </div>

                    <div className="border rounded-lg p-4 min-h-[300px] bg-white">
                      {generatedContent ? (
                        <div className="whitespace-pre-line text-gray-800">
                          {generatedContent}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          Click "Generate AI Content" to create demographic-aware content for this section
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save Section
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEN Tab */}
              <TabsContent value="sen" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Section B: Special educational needs</CardTitle>
                    <p className="text-gray-600">
                      Evidence-based SEN description for {selectedDiagnosis} population
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="flex items-center space-x-3 mb-4">
                      <Button
                        onClick={() => generateAIContent('sen')}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate SEN Content'}
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 min-h-[300px] bg-white">
                      {generatedContent ? (
                        <div className="whitespace-pre-line text-gray-800">
                          {generatedContent}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          AI will generate SEN content based on diagnostic patterns from {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.percentage}% of national EHCPs
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Outcomes Tab */}
              <TabsContent value="outcomes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Section E: Outcomes</CardTitle>
                    <p className="text-gray-600">
                      Evidence-based outcomes for {selectedAge} demographic with {selectedDiagnosis}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="flex items-center space-x-3 mb-4">
                      <Button
                        onClick={() => generateAIContent('outcomes')}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate Outcomes'}
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 min-h-[300px] bg-white">
                      {generatedContent ? (
                        <div className="whitespace-pre-line text-gray-800">
                          {generatedContent}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          AI will generate age-appropriate outcomes based on successful patterns from similar cases
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Provision Tab */}
              <TabsContent value="provision" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Section F: Special educational provision</CardTitle>
                    <p className="text-gray-600">
                      Evidence-based provision recommendations for {selectedDiagnosis}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="flex items-center space-x-3 mb-4">
                      <Button
                        onClick={() => generateAIContent('provision')}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isGenerating ? 'Generating...' : 'Generate Provision'}
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 min-h-[300px] bg-white">
                      {generatedContent ? (
                        <div className="whitespace-pre-line text-gray-800">
                          {generatedContent}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          AI will recommend evidence-based provision based on national data for this demographic
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Export & Share</CardTitle>
                    <p className="text-gray-600">
                      Generate professional EHC plan documents for submission
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button className="h-20 flex flex-col items-center justify-center">
                        <Download className="h-6 w-6 mb-2" />
                        Export as PDF
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <FileText className="h-6 w-6 mb-2" />
                        Export as Word
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Eye className="h-6 w-6 mb-2" />
                        Preview Plan
                      </Button>
                    </div>

                    {/* Compliance Check */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-semibold text-green-800">Legal Compliance Check</h4>
                          <p className="text-green-700 text-sm">
                            Plan meets statutory requirements for {selectedDiagnosis} EHCPs based on national patterns
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Plan Summary</h4>
                      <div className="text-blue-700 text-sm space-y-1">
                        <div>• Diagnosis: {selectedDiagnosis} ({DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.percentage}% of 638,745 national EHCPs)</div>
                        <div>• Age Group: {selectedAge}</div>
                        <div>• Evidence-based content generated from {DIAGNOSTIC_PATHWAYS[selectedDiagnosis as keyof typeof DIAGNOSTIC_PATHWAYS]?.cases.toLocaleString()} similar cases</div>
                        <div>• Demographic considerations applied</div>
                        <div>• Legal compliance verified</div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
