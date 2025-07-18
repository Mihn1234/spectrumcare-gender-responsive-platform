'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CURRENT_DEMOGRAPHICS,
  FEMALE_SPECIFIC_TRAITS,
  getUndiagnosedEstimate,
  type Gender
} from '@/lib/gender-responsive';
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Heart,
  Brain,
  Eye,
  Target,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Star
} from 'lucide-react';

// Simulated regional data for analytics
const REGIONAL_DATA = [
  { region: 'London', male: 15234, female: 6891, population: 8900000 },
  { region: 'Birmingham', male: 8734, female: 3245, population: 1140000 },
  { region: 'Manchester', male: 7234, female: 2987, population: 2720000 },
  { region: 'Leeds', male: 5234, female: 2134, population: 793000 },
  { region: 'Liverpool', male: 4234, female: 1876, population: 498000 }
];

// Age group diagnostic data
const AGE_DIAGNOSTIC_DATA = [
  { ageGroup: 'Early Years (4-5)', male: 89234, female: 34567, gapPercentage: 61.2 },
  { ageGroup: 'Primary (5-11)', male: 178456, female: 89234, gapPercentage: 50.0 },
  { ageGroup: 'Secondary (11-16)', male: 134567, female: 45678, gapPercentage: 66.1 },
  { ageGroup: 'Post-16 (16-25)', male: 48481, female: 18428, gapPercentage: 62.0 }
];

export default function GenderAnalyticsPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'regional' | 'age-groups' | 'traits'>('overview');
  const undiagnosedFemales = getUndiagnosedEstimate('female');

  const DiagnosticGapChart = () => {
    const totalDiagnosed = CURRENT_DEMOGRAPHICS.male.count + CURRENT_DEMOGRAPHICS.female.count;
    const malePercentage = (CURRENT_DEMOGRAPHICS.male.count / totalDiagnosed) * 100;
    const femalePercentage = (CURRENT_DEMOGRAPHICS.female.count / totalDiagnosed) * 100;
    const expectedPercentage = 50; // Assuming equal prevalence

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Diagnosis Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Diagnosis Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Male Diagnoses</span>
                  <span className="text-sm text-blue-600 font-bold">{malePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={malePercentage} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">{CURRENT_DEMOGRAPHICS.male.count.toLocaleString()} cases</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Female Diagnoses</span>
                  <span className="text-sm text-pink-600 font-bold">{femalePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={femalePercentage} className="h-3" />
                <p className="text-xs text-gray-500 mt-1">{CURRENT_DEMOGRAPHICS.female.count.toLocaleString()} cases</p>
              </div>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Expected vs Actual (Equal Prevalence Model)</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Expected Female Rate</span>
                  <span className="text-sm text-green-600 font-bold">{expectedPercentage}%</span>
                </div>
                <Progress value={expectedPercentage} className="h-3" />
                <p className="text-xs text-green-600 mt-1">Target: {(totalDiagnosed * 0.5).toLocaleString()} cases</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Actual Female Rate</span>
                  <span className="text-sm text-red-600 font-bold">{femalePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={femalePercentage} className="h-3" />
                <p className="text-xs text-red-600 mt-1">Gap: {undiagnosedFemales.toLocaleString()}+ undiagnosed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">20.8%</div>
            <div className="text-sm text-red-800">Diagnostic gap</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <TrendingDown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">35%</div>
            <div className="text-sm text-orange-800">Lower female diagnosis rate</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{undiagnosedFemales.toLocaleString()}</div>
            <div className="text-sm text-purple-800">Estimated undiagnosed females</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">50%</div>
            <div className="text-sm text-blue-800">Target female rate</div>
          </div>
        </div>
      </div>
    );
  };

  const RegionalAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Regional Diagnostic Patterns</h3>
      <div className="space-y-4">
        {REGIONAL_DATA.map((region, index) => {
          const total = region.male + region.female;
          const femalePercentage = (region.female / total) * 100;
          const gapSeverity = femalePercentage < 35 ? 'severe' : femalePercentage < 40 ? 'moderate' : 'mild';

          return (
            <div key={region.region} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{region.region}</h4>
                <Badge
                  variant={gapSeverity === 'severe' ? 'destructive' : 'secondary'}
                  className={
                    gapSeverity === 'severe' ? 'bg-red-100 text-red-800' :
                    gapSeverity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }
                >
                  {femalePercentage.toFixed(1)}% Female
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Male Diagnoses</div>
                  <div className="text-lg font-bold text-blue-600">{region.male.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Female Diagnoses</div>
                  <div className="text-lg font-bold text-pink-600">{region.female.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Female Diagnosis Rate</span>
                  <span className={
                    gapSeverity === 'severe' ? 'text-red-600' :
                    gapSeverity === 'moderate' ? 'text-orange-600' :
                    'text-yellow-600'
                  }>{femalePercentage.toFixed(1)}%</span>
                </div>
                <Progress value={femalePercentage} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const AgeGroupAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Age Group Diagnostic Gaps</h3>
      <div className="space-y-4">
        {AGE_DIAGNOSTIC_DATA.map((ageData, index) => {
          const total = ageData.male + ageData.female;
          const femalePercentage = (ageData.female / total) * 100;

          return (
            <div key={ageData.ageGroup} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{ageData.ageGroup}</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">{total.toLocaleString()} total</Badge>
                  <Badge variant="destructive">
                    {ageData.gapPercentage.toFixed(1)}% gap
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{ageData.male.toLocaleString()}</div>
                  <div className="text-sm text-blue-800">Male diagnoses</div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded">
                  <div className="text-2xl font-bold text-pink-600">{ageData.female.toLocaleString()}</div>
                  <div className="text-sm text-pink-800">Female diagnoses</div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between text-sm mb-1">
                  <span>Female representation</span>
                  <span className="text-red-600 font-semibold">{femalePercentage.toFixed(1)}% (Expected: 50%)</span>
                </div>
                <Progress value={femalePercentage} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  Estimated {((total * 0.5) - ageData.female).toLocaleString()} undiagnosed females in this age group
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const FemaleTraitsAnalysis = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Why Females Are Underdiagnosed</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-900">
              <Eye className="h-5 w-5" />
              Masking Behaviors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FEMALE_SPECIFIC_TRAITS.maskingBehaviors.slice(0, 4).map((behavior, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-pink-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{behavior}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-pink-50 rounded">
              <p className="text-sm text-pink-800">
                <strong>Impact:</strong> These behaviors make autism traits less visible to traditional screening methods.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Heart className="h-5 w-5" />
              Internalized Experiences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FEMALE_SPECIFIC_TRAITS.internalizedBehaviors.slice(0, 4).map((behavior, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{behavior}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded">
              <p className="text-sm text-purple-800">
                <strong>Result:</strong> High anxiety and self-blame often misattributed to other conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="h-5 w-5" />
            Social Camouflaging Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-semibold text-red-900">Late Diagnosis</div>
              <p className="text-sm text-red-700">Average age 32 for females vs 17 for males</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-orange-900">Missed Support</div>
              <p className="text-sm text-orange-700">Critical early intervention opportunities lost</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Activity className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-semibold text-yellow-900">Mental Health</div>
              <p className="text-sm text-yellow-700">Higher rates of anxiety and depression</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Gender Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Understanding and addressing the autism diagnostic gender gap
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">70.6%</div>
                <div className="text-sm opacity-90">Male diagnoses</div>
              </div>
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg">
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">29.4%</div>
                <div className="text-sm opacity-90">Female diagnoses</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                <TrendingDown className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-sm opacity-90">Undiagnosed females</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <div className="text-3xl font-bold">50%</div>
                <div className="text-sm opacity-90">Target equity rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'regional', label: 'Regional Analysis', icon: Users },
            { id: 'age-groups', label: 'Age Groups', icon: Activity },
            { id: 'traits', label: 'Female Traits', icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                  ${selectedView === tab.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="p-8">
            {selectedView === 'overview' && <DiagnosticGapChart />}
            {selectedView === 'regional' && <RegionalAnalysis />}
            {selectedView === 'age-groups' && <AgeGroupAnalysis />}
            {selectedView === 'traits' && <FemaleTraitsAnalysis />}
          </CardContent>
        </Card>

        {/* Action Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Take Action on Gender Equity</h2>
          <p className="text-xl mb-8 opacity-90">
            Help close the diagnostic gap with our gender-responsive assessment tools
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/gender-assessment'}
            >
              <Heart className="h-5 w-5 mr-2" />
              Start Gender Assessment
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <Lightbulb className="h-5 w-5 mr-2" />
              Learn About Female Traits
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              <Users className="h-5 w-5 mr-2" />
              Connect with Specialists
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
