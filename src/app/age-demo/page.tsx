'use client';

import React, { useState } from 'react';
import {
  AgeProvider,
  useAge,
  AgeCard,
  AgeButton,
  AgeHeader,
  AgeBadge,
  AgeText,
  AgeGroupSelector
} from '@/components/ui/age-responsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Users,
  Heart,
  Star,
  Gamepad2,
  BookOpen,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Play,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

// Demo Content for Each Age Group
const DEMO_CONTENT = {
  'early-years': {
    title: 'My Learning Adventure! 🌈',
    subtitle: 'Let\'s have fun learning together!',
    tasks: [
      { icon: '🎨', title: 'Draw My Feelings', description: 'Use colors to show how I feel today!' },
      { icon: '🧸', title: 'Story Time', description: 'Listen to a story about friendship' },
      { icon: '🎵', title: 'Sing Along', description: 'Learn a new song with movements' },
      { icon: '🏃', title: 'Movement Game', description: 'Dance and move with the music' }
    ],
    achievements: ['First Login! 🎉', 'Story Completed! 📖', 'New Friend Made! 👫'],
    colors: ['bg-pink-100', 'bg-yellow-100', 'bg-blue-100', 'bg-green-100']
  },
  'primary': {
    title: 'My Learning Journey 🚀',
    subtitle: 'Explore, discover, and achieve your goals!',
    tasks: [
      { icon: '📚', title: 'Reading Challenge', description: 'Complete your daily reading goal' },
      { icon: '🔬', title: 'Science Experiment', description: 'Discover how things work' },
      { icon: '🎯', title: 'Math Quest', description: 'Solve puzzles and earn points' },
      { icon: '🏆', title: 'Team Project', description: 'Work with friends on something cool' }
    ],
    achievements: ['Reading Streak: 7 days! 📚', 'Math Champion! 🏆', 'Team Player! 🤝'],
    colors: ['bg-purple-100', 'bg-blue-100', 'bg-green-100', 'bg-orange-100']
  },
  'secondary': {
    title: 'Academic Progress Dashboard',
    subtitle: 'Track your achievements and plan your future',
    tasks: [
      { icon: '📊', title: 'Grade Analysis', description: 'Review your performance across subjects' },
      { icon: '🎓', title: 'University Prep', description: 'Plan your higher education path' },
      { icon: '💼', title: 'Career Exploration', description: 'Discover potential career options' },
      { icon: '📝', title: 'Exam Preparation', description: 'Organize your study schedule' }
    ],
    achievements: ['A* in Mathematics', 'Leadership Award', 'Community Service: 50 hours'],
    colors: ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-gray-50']
  },
  'post-16': {
    title: 'Independence Development Hub',
    subtitle: 'Building skills for independent living and career success',
    tasks: [
      { icon: '💼', title: 'Employment Preparation', description: 'CV writing and interview skills' },
      { icon: '🏠', title: 'Life Skills Training', description: 'Budgeting, cooking, and daily tasks' },
      { icon: '🚌', title: 'Travel Training', description: 'Independent transport planning' },
      { icon: '📋', title: 'Support Planning', description: 'Transition to adult services' }
    ],
    achievements: ['Employment Ready Certificate', 'Independent Living Assessment', 'Transport Confidence'],
    colors: ['bg-gray-50', 'bg-blue-50', 'bg-green-50', 'bg-indigo-50']
  }
};

// Age-Specific Feature Demo Component
const AgeFeatureDemo: React.FC = () => {
  const { ageGroup, ageInfo } = useAge();
  const content = DEMO_CONTENT[ageGroup];
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <AgeHeader level={1} className="mb-4">
          {content.title}
        </AgeHeader>
        <AgeText size="lg" className="mb-6 opacity-80">
          {content.subtitle}
        </AgeText>

        <div className="flex justify-center items-center gap-4 mb-6">
          <AgeBadge variant="info">
            {ageInfo.icon} {ageInfo.label}
          </AgeBadge>
          <AgeBadge variant="success">
            {ageInfo.totalUsers.toLocaleString()} users
          </AgeBadge>
          <AgeBadge variant={ageGroup === 'early-years' ? 'fun' : 'info'}>
            {ageInfo.percentage}% of platform
          </AgeBadge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Tasks Section */}
        <AgeCard variant="interactive">
          <CardHeader>
            <AgeHeader level={2}>
              {ageGroup === 'early-years' ? '🎮 Fun Activities' :
               ageGroup === 'primary' ? '🎯 My Tasks' :
               ageGroup === 'secondary' ? '📋 Academic Goals' : '💼 Development Areas'}
            </AgeHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.tasks.map((task, index) => (
              <div
                key={index}
                onClick={() => setSelectedTask(selectedTask === index ? null : index)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedTask === index ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                  ${content.colors[index % content.colors.length]}
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{task.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{task.title}</h4>
                    <AgeText size="sm" className="opacity-75">
                      {task.description}
                    </AgeText>
                    {selectedTask === index && (
                      <div className="mt-3">
                        <AgeButton
                          variant="primary"
                          size={ageGroup === 'early-years' ? 'lg' : 'md'}
                        >
                          {ageGroup === 'early-years' ? '🎉 Let\'s Play!' :
                           ageGroup === 'primary' ? '🚀 Start Task' :
                           ageGroup === 'secondary' ? '📊 View Details' : '💼 Access Tool'}
                        </AgeButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </AgeCard>

        {/* Progress/Achievements Section */}
        <AgeCard variant={ageGroup === 'early-years' ? 'playful' : 'default'}>
          <CardHeader>
            <AgeHeader level={2}>
              {ageGroup === 'early-years' ? '🏆 My Achievements!' :
               ageGroup === 'primary' ? '⭐ Progress Tracker' :
               ageGroup === 'secondary' ? '📈 Academic Achievements' : '🎯 Development Milestones'}
            </AgeHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border"
              >
                {ageGroup === 'early-years' ? (
                  <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                <AgeText>{achievement}</AgeText>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t">
              <AgeButton
                variant={ageGroup === 'early-years' ? 'fun' : 'secondary'}
                className="w-full"
              >
                {ageGroup === 'early-years' ? '🎊 See All My Stars!' :
                 ageGroup === 'primary' ? '🏆 View All Achievements' :
                 ageGroup === 'secondary' ? '📊 Full Progress Report' : '📈 Complete Assessment'}
              </AgeButton>
            </div>
          </CardContent>
        </AgeCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <AgeButton variant="primary" size="lg">
          {ageGroup === 'early-years' ? '🌈 Start Playing!' :
           ageGroup === 'primary' ? '🚀 Continue Learning' :
           ageGroup === 'secondary' ? '📚 Access Study Tools' : '💼 View Support Plan'}
          <ArrowRight className="h-5 w-5 ml-2" />
        </AgeButton>

        <AgeButton variant="secondary" size="lg">
          {ageGroup === 'early-years' ? '👨‍👩‍👧‍👦 Ask for Help' :
           ageGroup === 'primary' ? '🙋‍♀️ Get Support' :
           ageGroup === 'secondary' ? '💬 Contact Teacher' : '📞 Speak to Advisor'}
        </AgeButton>
      </div>
    </div>
  );
};

// Main Demo Page Component
const AgeDemoContent: React.FC = () => {
  const { ageGroup, theme } = useAge();

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Age-Appropriate Interface Demo
              </h1>
              <p className="text-gray-600 mt-2">
                Experience how SpectrumCare adapts to different age groups
              </p>
            </div>

            {/* Age Group Selector */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Choose Age Group:</p>
              <AgeGroupSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <AgeFeatureDemo />
      </div>

      {/* Footer with Theme Info */}
      <div className="mt-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎨 Current Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Primary: <span className="font-mono">{theme.colors.primary}</span></div>
                  <div>Typography: <span className="font-mono">{theme.typography.headerSize}</span></div>
                  <div>Spacing: <span className="font-mono">{theme.spacing.borderRadius}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Users: {DEMO_CONTENT[ageGroup as keyof typeof DEMO_CONTENT] && '291,228'}</div>
                  <div>Percentage: 45.6%</div>
                  <div>Growth: +12.3%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Animations: {theme.animations.enabled ? '✅ Enabled' : '❌ Disabled'}</div>
                  <div>High Contrast: {theme.accessibility.highContrast ? '✅ Yes' : '❌ No'}</div>
                  <div>Large Text: {theme.accessibility.largeText ? '✅ Yes' : '❌ No'}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✅ Age-appropriate design</div>
                  <div>✅ Improved engagement</div>
                  <div>✅ Better accessibility</div>
                  <div>✅ Personalized experience</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component with Provider
export default function AgeDemoPage() {
  return (
    <AgeProvider defaultAge="primary">
      <AgeDemoContent />
    </AgeProvider>
  );
}
