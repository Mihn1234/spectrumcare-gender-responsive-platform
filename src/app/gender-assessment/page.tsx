'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  GENDER_RESPONSIVE_ASSESSMENT,
  GENDER_THEMES,
  CURRENT_DEMOGRAPHICS,
  getUndiagnosedEstimate,
  getGenderResponsiveInterventions,
  type Gender
} from '@/lib/gender-responsive';
import {
  Users,
  Heart,
  Brain,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Eye,
  Shield,
  Target,
  ArrowRight,
  UserCheck,
  BarChart3,
  Lightbulb,
  Star
} from 'lucide-react';

interface AssessmentResponse {
  questionId: string;
  value: number;
  femaleSpecific: boolean;
}

export default function GenderAssessmentPage() {
  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentTheme = GENDER_THEMES[selectedGender === 'female' ? 'femaleAffirming' :
                                   selectedGender === 'male' ? 'maleAffirming' : 'nonBinaryInclusive'];

  const assessmentData = GENDER_RESPONSIVE_ASSESSMENT[selectedGender === 'female' ? 'female' : 'male'];
  const undiagnosedEstimate = getUndiagnosedEstimate(selectedGender);

  const handleResponseChange = (questionId: string, value: number, femaleSpecific: boolean) => {
    setResponses(prev => {
      const updated = prev.filter(r => r.questionId !== questionId);
      return [...updated, { questionId, value, femaleSpecific }];
    });
  };

  const calculateScore = () => {
    const femaleSpecificResponses = responses.filter(r => r.femaleSpecific);
    const generalResponses = responses.filter(r => !r.femaleSpecific);

    const femaleSpecificScore = femaleSpecificResponses.reduce((sum, r) => sum + r.value, 0) / Math.max(1, femaleSpecificResponses.length);
    const generalScore = generalResponses.reduce((sum, r) => sum + r.value, 0) / Math.max(1, generalResponses.length);

    return {
      femaleSpecific: femaleSpecificScore,
      general: generalScore,
      overall: (femaleSpecificScore + generalScore) / 2
    };
  };

  const getRiskLevel = (score: number) => {
    if (score >= 4) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (score >= 3) return { level: 'Moderate', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (score >= 2) return { level: 'Low', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Minimal', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const LikertScale = ({ questionId, question, femaleSpecific }: { questionId: string; question: string; femaleSpecific: boolean }) => {
    const currentResponse = responses.find(r => r.questionId === questionId);

    return (
      <div className="space-y-4">
        <p className="text-lg font-medium">{question}</p>
        {femaleSpecific && (
          <Badge className="bg-pink-100 text-pink-800">
            <Heart className="h-3 w-3 mr-1" />
            Female-Specific Indicator
          </Badge>
        )}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleResponseChange(questionId, value, femaleSpecific)}
              className={`
                p-3 rounded-lg border-2 text-center transition-all
                ${currentResponse?.value === value
                  ? `border-2 shadow-md`
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              style={{
                borderColor: currentResponse?.value === value ? currentTheme.colors.primary : undefined,
                backgroundColor: currentResponse?.value === value ? currentTheme.colors.background : undefined
              }}
            >
              <div className="text-sm font-medium">{value}</div>
              <div className="text-xs text-gray-500">
                {value === 1 ? 'Never' : value === 2 ? 'Rarely' : value === 3 ? 'Sometimes' : value === 4 ? 'Often' : 'Always'}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (showResults && isCompleted) {
    const scores = calculateScore();
    const overallRisk = getRiskLevel(scores.overall);
    const femaleRisk = getRiskLevel(scores.femaleSpecific);
    const interventions = getGenderResponsiveInterventions(selectedGender, 'all-ages');

    return (
      <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: currentTheme.colors.primary }}>
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold" style={{ color: currentTheme.colors.text }}>
                  Assessment Results
                </h1>
                <p className="text-gray-600">Gender-responsive autism screening analysis</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Score Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`p-4 rounded-lg ${overallRisk.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Overall Autism Likelihood</span>
                    <span className={`font-bold ${overallRisk.color}`}>{overallRisk.level}</span>
                  </div>
                  <Progress value={scores.overall * 20} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">
                    Score: {scores.overall.toFixed(1)}/5.0
                  </p>
                </div>

                {selectedGender === 'female' && (
                  <div className={`p-4 rounded-lg ${femaleRisk.bgColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Female-Specific Traits</span>
                      <span className={`font-bold ${femaleRisk.color}`}>{femaleRisk.level}</span>
                    </div>
                    <Progress value={scores.femaleSpecific * 20} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">
                      Masking & Camouflaging: {scores.femaleSpecific.toFixed(1)}/5.0
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What this means:</h4>
                  <div className="text-blue-800 text-sm space-y-1">
                    {scores.overall >= 3.5 && (
                      <div>• Strong indication of autism traits present</div>
                    )}
                    {selectedGender === 'female' && scores.femaleSpecific >= 3 && (
                      <div>• Significant masking behaviors detected</div>
                    )}
                    <div>• Recommend professional autism assessment</div>
                    <div>• Consider gender-specific support strategies</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Primary Interventions
                  </h4>
                  <div className="space-y-2">
                    {interventions.primary.map((intervention, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{intervention}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Support Strategies
                  </h4>
                  <div className="space-y-2">
                    {interventions.support.map((support, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{support}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Next Steps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-purple-600" />
                      <span>Book autism assessment with specialist</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span>Access AI EHC Plan Builder</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>Connect with gender-responsive support network</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              className="text-white shadow-lg hover:shadow-xl"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <Brain className="h-5 w-5 mr-2" />
              Book Professional Assessment
            </Button>
            <Button variant="outline">
              <ArrowRight className="h-5 w-5 mr-2" />
              Access Support Resources
            </Button>
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: currentTheme.colors.text }}>
              Gender-Responsive Autism Assessment
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Addressing the diagnostic gap with gender-specific screening tools
            </p>

            {/* Critical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">29.4%</div>
                <div className="text-sm text-red-800">Female diagnosis rate</div>
                <div className="text-xs text-red-600">{CURRENT_DEMOGRAPHICS.female.count.toLocaleString()} diagnosed</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">70.6%</div>
                <div className="text-sm text-blue-800">Male diagnosis rate</div>
                <div className="text-xs text-blue-600">{CURRENT_DEMOGRAPHICS.male.count.toLocaleString()} diagnosed</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">~100K+</div>
                <div className="text-sm text-orange-800">Estimated undiagnosed females</div>
                <div className="text-xs text-orange-600">Critical support gap</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Gender Selection */}
        {!isCompleted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Gender for Assessment
              </CardTitle>
              <p className="text-gray-600">
                Our assessment adapts to different gender presentation patterns in autism
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['female', 'male', 'non-binary'] as Gender[]).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`
                      p-4 rounded-lg border-2 text-center transition-all
                      ${selectedGender === gender ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <div className="font-semibold capitalize">{gender === 'non-binary' ? 'Non-Binary' : gender}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {gender === 'female' && 'Female-specific traits & masking detection'}
                      {gender === 'male' && 'Traditional autism presentation patterns'}
                      {gender === 'non-binary' && 'Inclusive, individualized assessment'}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assessment Questions */}
        {!isCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{assessmentData.title}</span>
                <Badge variant="outline">
                  Section {currentSection + 1} of {assessmentData.sections.length}
                </Badge>
              </CardTitle>
              <p className="text-gray-600">{assessmentData.description}</p>
              <Progress
                value={((currentSection + 1) / assessmentData.sections.length) * 100}
                className="h-2"
              />
            </CardHeader>
            <CardContent>
              {assessmentData.sections[currentSection] && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      {selectedGender === 'female' && currentSection === 0 && <Eye className="h-5 w-5 text-pink-600" />}
                      {selectedGender === 'female' && currentSection === 1 && <Heart className="h-5 w-5 text-purple-600" />}
                      {selectedGender === 'female' && currentSection === 2 && <Brain className="h-5 w-5 text-blue-600" />}
                      {assessmentData.sections[currentSection].title}
                    </h3>
                  </div>

                  {assessmentData.sections[currentSection].questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-4">
                      <LikertScale
                        questionId={question.id}
                        question={`${qIndex + 1}. ${question.question}`}
                        femaleSpecific={question.femaleSpecific}
                      />
                      {qIndex < assessmentData.sections[currentSection].questions.length - 1 && (
                        <hr className="my-6" />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                      disabled={currentSection === 0}
                    >
                      Previous Section
                    </Button>

                    {currentSection === assessmentData.sections.length - 1 ? (
                      <Button
                        onClick={() => {
                          setIsCompleted(true);
                          setShowResults(true);
                        }}
                        disabled={responses.length < assessmentData.sections.reduce((sum, section) => sum + section.questions.length, 0)}
                        className="text-white"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Assessment
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentSection(currentSection + 1)}
                        className="text-white"
                        style={{ backgroundColor: currentTheme.colors.primary }}
                      >
                        Next Section
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Information Panel */}
        {selectedGender === 'female' && !isCompleted && (
          <Card className="mt-8 bg-pink-50 border-pink-200">
            <CardHeader>
              <CardTitle className="text-pink-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Why Female-Specific Assessment Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-pink-800">
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Females often mask autism traits, making traditional assessments less effective</span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Social camouflaging behaviors can hide underlying autism characteristics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Internalized behaviors and perfectionism are common but overlooked traits</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Many females receive late or missed diagnoses, limiting access to support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
