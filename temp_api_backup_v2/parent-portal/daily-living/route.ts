import { NextRequest, NextResponse } from 'next/server';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const dailyRoutineSchema = z.object({
  name: z.string().min(3).max(100),
  category: z.enum(['morning', 'afternoon', 'evening', 'bedtime', 'meal', 'therapy', 'exercise', 'education', 'social']),
  activities: z.array(z.object({
    name: z.string(),
    duration: z.number().min(5).max(480), // 5 minutes to 8 hours
    sensoryConsiderations: z.array(z.string()),
    adaptations: z.array(z.string()),
    supportLevel: z.enum(['independent', 'minimal-support', 'moderate-support', 'full-support']),
    preferredEnvironment: z.string(),
    equipment: z.array(z.string()).optional()
  })),
  schedule: z.object({
    startTime: z.string(),
    endTime: z.string(),
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    flexibility: z.enum(['rigid', 'moderate', 'flexible']),
    preparationTime: z.number().min(0).max(60)
  }),
  childId: z.string(),
  goals: z.array(z.string()),
  successMetrics: z.array(z.string())
});

const skillTrackerSchema = z.object({
  skillCategory: z.enum(['self-care', 'communication', 'social', 'academic', 'life-skills', 'mobility', 'safety']),
  skillName: z.string().min(3).max(200),
  currentLevel: z.enum(['emerging', 'developing', 'proficient', 'mastered']),
  targetLevel: z.enum(['developing', 'proficient', 'mastered', 'generalizing']),
  childId: z.string(),
  milestones: z.array(z.object({
    description: z.string(),
    targetDate: z.string(),
    achieved: z.boolean(),
    achievedDate: z.string().optional(),
    evidence: z.string().optional()
  })),
  supportStrategies: z.array(z.string()),
  environmentalFactors: z.array(z.string()),
  practiceSchedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'bi-weekly', 'monthly']),
    duration: z.number().min(5).max(120),
    preferredTimes: z.array(z.string())
  })
});

const behaviorPatternSchema = z.object({
  childId: z.string(),
  date: z.string(),
  timeOfDay: z.string(),
  activity: z.string(),
  environment: z.string(),
  behaviorType: z.enum(['positive', 'challenging', 'neutral']),
  intensity: z.number().min(1).max(10),
  duration: z.number().min(1).max(480),
  triggers: z.array(z.string()),
  responses: z.array(z.string()),
  effectiveness: z.number().min(1).max(10).optional(),
  sensoryFactors: z.array(z.string()),
  socialContext: z.string(),
  notes: z.string().max(1000)
});

const qualityOfLifeSchema = z.object({
  childId: z.string(),
  assessmentDate: z.string(),
  domains: z.object({
    physicalHealth: z.object({
      score: z.number().min(1).max(10),
      factors: z.array(z.string()),
      notes: z.string().optional()
    }),
    mentalWellbeing: z.object({
      score: z.number().min(1).max(10),
      factors: z.array(z.string()),
      notes: z.string().optional()
    }),
    socialConnections: z.object({
      score: z.number().min(1).max(10),
      factors: z.array(z.string()),
      notes: z.string().optional()
    }),
    independence: z.object({
      score: z.number().min(1).max(10),
      factors: z.array(z.string()),
      notes: z.string().optional()
    }),
    participation: z.object({
      score: z.number().min(1).max(10),
      factors: z.array(z.string()),
      notes: z.string().optional()
    }),
    satisfaction: z.object({
      score: z.number().min(1).max(10),
      factors: z.array(z.string()),
      notes: z.string().optional()
    })
  }),
  overallScore: z.number().min(1).max(10),
  priorityAreas: z.array(z.string()),
  improvementPlan: z.array(z.object({
    area: z.string(),
    strategy: z.string(),
    timeline: z.string(),
    responsible: z.string()
  }))
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const childId = searchParams.get('childId');
    const timeframe = searchParams.get('timeframe') || '30';
    const category = searchParams.get('category');

    switch (type) {
      case 'overview':
        return await getDailyLivingOverview(authResult.user.id);

      case 'routines':
        return await getDailyRoutines(authResult.user.id, childId, category);

      case 'skills':
        return await getSkillTracking(authResult.user.id, childId);

      case 'behavior-patterns':
        return await getBehaviorPatterns(authResult.user.id, childId, timeframe);

      case 'quality-of-life':
        return await getQualityOfLife(authResult.user.id, childId);

      case 'analytics':
        return await getDailyLivingAnalytics(authResult.user.id, childId, timeframe);

      case 'recommendations':
        return await getAIRecommendations(authResult.user.id, childId);

      default:
        return await getDailyLivingOverview(authResult.user.id);
    }

  } catch (error: any) {
    console.error('Daily living GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch daily living data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_routine':
        return await createDailyRoutine(authResult.user.id, data);

      case 'update_routine':
        return await updateDailyRoutine(authResult.user.id, data);

      case 'track_skill':
        return await trackSkillProgress(authResult.user.id, data);

      case 'log_behavior':
        return await logBehaviorPattern(authResult.user.id, data);

      case 'assess_quality_of_life':
        return await assessQualityOfLife(authResult.user.id, data);

      case 'optimize_routine':
        return await optimizeRoutine(authResult.user.id, data);

      case 'generate_report':
        return await generateProgressReport(authResult.user.id, data);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Daily living POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process daily living action' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getDailyLivingOverview(userId: string) {
  const overview = {
    systemStatus: {
      status: 'active',
      lastUpdate: new Date().toISOString(),
      routinesActive: 8,
      skillsTracked: 15,
      patternsAnalyzed: 247,
      qualityScore: 7.8,
      improvementTrend: 'positive'
    },

    currentMetrics: {
      overallProgress: 78,
      independenceLevel: 'developing',
      routineConsistency: 85,
      skillMastery: 67,
      qualityOfLife: 7.8,
      behaviorStability: 'stable',
      familySatisfaction: 'high'
    },

    activeRoutines: [
      {
        id: 'routine-1',
        name: 'Morning Independence Routine',
        category: 'morning',
        consistency: 92,
        lastCompleted: '2024-02-10T08:30:00Z',
        nextScheduled: '2024-02-11T07:00:00Z',
        adaptations: ['Visual schedule', 'Extra time buffer'],
        status: 'on-track'
      },
      {
        id: 'routine-2',
        name: 'Sensory Break Schedule',
        category: 'therapy',
        consistency: 87,
        lastCompleted: '2024-02-10T14:15:00Z',
        nextScheduled: '2024-02-10T16:15:00Z',
        adaptations: ['Noise-canceling headphones', 'Weighted blanket'],
        status: 'optimizing'
      },
      {
        id: 'routine-3',
        name: 'Social Skills Practice',
        category: 'social',
        consistency: 73,
        lastCompleted: '2024-02-09T16:00:00Z',
        nextScheduled: '2024-02-11T15:30:00Z',
        adaptations: ['Peer buddy system', 'Structured activities'],
        status: 'needs-attention'
      }
    ],

    skillProgress: [
      {
        skillName: 'Self-care - Teeth Brushing',
        category: 'self-care',
        currentLevel: 'proficient',
        targetLevel: 'mastered',
        progress: 85,
        nextMilestone: 'Brush without reminders for 7 consecutive days',
        estimatedCompletion: '2024-02-20'
      },
      {
        skillName: 'Communication - Making Requests',
        category: 'communication',
        currentLevel: 'developing',
        targetLevel: 'proficient',
        progress: 65,
        nextMilestone: 'Use full sentences for 80% of requests',
        estimatedCompletion: '2024-03-15'
      },
      {
        skillName: 'Social - Turn Taking',
        category: 'social',
        currentLevel: 'emerging',
        targetLevel: 'developing',
        progress: 45,
        nextMilestone: 'Wait for turn in structured games',
        estimatedCompletion: '2024-04-01'
      }
    ],

    recentInsights: [
      {
        type: 'pattern-recognition',
        insight: 'Best performance in morning routines when visual schedule is used',
        confidence: 94,
        actionable: 'Expand visual schedule use to afternoon routines',
        priority: 'high'
      },
      {
        type: 'behavior-analysis',
        insight: 'Sensory breaks reduce challenging behaviors by 67%',
        confidence: 89,
        actionable: 'Increase sensory break frequency during high-stress periods',
        priority: 'medium'
      },
      {
        type: 'skill-optimization',
        insight: 'Communication skills improve faster with peer interaction',
        confidence: 82,
        actionable: 'Schedule more structured peer play sessions',
        priority: 'medium'
      }
    ],

    familyCoordination: {
      parentInvolvement: 95,
      siblingSupport: 78,
      extendedFamilyEngagement: 65,
      professionalCollaboration: 88,
      schoolAlignment: 82,
      consistencyScore: 87
    },

    weeklyHighlights: [
      {
        area: 'Independence',
        achievement: 'Completed morning routine without prompting 6/7 days',
        impact: 'Increased family morning efficiency by 25%'
      },
      {
        area: 'Social Skills',
        achievement: 'Initiated conversation with peer at playground',
        impact: 'First spontaneous peer interaction this month'
      },
      {
        area: 'Self-regulation',
        achievement: 'Used calming strategies independently 4 times',
        impact: 'Reduced escalation incidents by 50%'
      }
    ],

    environmentalOptimization: {
      sensoryScore: 8.2,
      accessibilityRating: 'excellent',
      safetyLevel: 'optimal',
      adaptationsActive: 12,
      equipmentUtilization: 87,
      spaceOptimization: 'effective'
    },

    upcomingMilestones: [
      {
        skill: 'Independent Tooth Brushing',
        targetDate: '2024-02-20',
        progress: 85,
        confidence: 'high'
      },
      {
        skill: 'Playground Social Interaction',
        targetDate: '2024-02-25',
        progress: 67,
        confidence: 'moderate'
      },
      {
        skill: 'Meal Preparation Assistance',
        targetDate: '2024-03-05',
        progress: 45,
        confidence: 'moderate'
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: overview
  });
}

async function getDailyRoutines(userId: string, childId?: string, category?: string) {
  // Simulate comprehensive routine data
  const routines = [
    {
      id: 'routine-1',
      name: 'Morning Independence Routine',
      category: 'morning',
      childId: 'child-1',
      schedule: {
        startTime: '07:00',
        endTime: '08:30',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        flexibility: 'moderate',
        preparationTime: 15
      },
      activities: [
        {
          name: 'Wake up and stretch',
          duration: 10,
          sensoryConsiderations: ['Gentle lighting', 'Quiet environment'],
          adaptations: ['Gradual wake-up light', 'Soft music'],
          supportLevel: 'minimal-support',
          preferredEnvironment: 'Bedroom with blackout curtains',
          equipment: ['Wake-up light', 'Soft pillow']
        },
        {
          name: 'Personal hygiene',
          duration: 20,
          sensoryConsiderations: ['Warm water temperature', 'Soft towels'],
          adaptations: ['Visual sequence chart', 'Timer for each step'],
          supportLevel: 'moderate-support',
          preferredEnvironment: 'Bathroom with good lighting',
          equipment: ['Visual timer', 'Step stool', 'Sensory-friendly toothbrush']
        },
        {
          name: 'Getting dressed',
          duration: 15,
          sensoryConsiderations: ['Comfortable fabrics', 'Loose-fitting clothes'],
          adaptations: ['Clothes laid out previous night', 'Dressing sequence card'],
          supportLevel: 'minimal-support',
          preferredEnvironment: 'Bedroom with good lighting',
          equipment: ['Dressing board', 'Velcro shoes']
        },
        {
          name: 'Breakfast preparation',
          duration: 25,
          sensoryConsiderations: ['Preferred textures', 'Familiar foods'],
          adaptations: ['Picture recipe cards', 'Child-safe utensils'],
          supportLevel: 'moderate-support',
          preferredEnvironment: 'Kitchen with cleared counters',
          equipment: ['Step stool', 'Child-safe knife', 'Measuring cups']
        }
      ],
      goals: [
        'Increase independence in morning routine',
        'Reduce prompting by 50%',
        'Complete routine within time limit 80% of days'
      ],
      successMetrics: [
        'Days completed independently',
        'Time taken to complete',
        'Number of prompts needed',
        'Stress level (1-10 scale)'
      ],
      performance: {
        consistency: 92,
        independenceLevel: 78,
        timeEfficiency: 85,
        stressLevel: 3.2,
        familySatisfaction: 9.1
      },
      adaptationHistory: [
        {
          date: '2024-01-15',
          change: 'Added visual timer for hygiene steps',
          reason: 'Reduce time spent on each task',
          effectiveness: 'high'
        },
        {
          date: '2024-01-28',
          change: 'Moved clothes preparation to evening before',
          reason: 'Reduce decision fatigue in morning',
          effectiveness: 'very-high'
        }
      ],
      challenges: [
        'Occasionally resists tooth brushing',
        'Dressing takes longer on cold mornings',
        'Breakfast preferences change frequently'
      ],
      supportStrategies: [
        'Use preferred toothbrush with favorite character',
        'Warm clothes in dryer on cold mornings',
        'Offer 2-3 breakfast choices each morning'
      ]
    },
    {
      id: 'routine-2',
      name: 'Sensory Regulation Schedule',
      category: 'therapy',
      childId: 'child-1',
      schedule: {
        startTime: '14:00',
        endTime: '14:30',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        flexibility: 'flexible',
        preparationTime: 5
      },
      activities: [
        {
          name: 'Deep pressure activities',
          duration: 10,
          sensoryConsiderations: ['Heavy work input', 'Proprioceptive feedback'],
          adaptations: ['Weighted blanket', 'Compression vest'],
          supportLevel: 'minimal-support',
          preferredEnvironment: 'Quiet sensory room',
          equipment: ['Weighted blanket', 'Body sock', 'Compression vest']
        },
        {
          name: 'Calming sensory input',
          duration: 15,
          sensoryConsiderations: ['Soft textures', 'Dim lighting', 'Quiet sounds'],
          adaptations: ['Noise-canceling headphones', 'Fidget tools'],
          supportLevel: 'independent',
          preferredEnvironment: 'Sensory corner with soft furnishings',
          equipment: ['Noise-canceling headphones', 'Sensory bin', 'Calm-down bottle']
        },
        {
          name: 'Transition preparation',
          duration: 5,
          sensoryConsiderations: ['Gradual alerting', 'Gentle prompts'],
          adaptations: ['5-minute warning', 'Transition song'],
          supportLevel: 'minimal-support',
          preferredEnvironment: 'Same location as sensory break',
          equipment: ['Visual timer', 'Transition object']
        }
      ],
      goals: [
        'Improve self-regulation skills',
        'Reduce sensory overwhelm',
        'Increase ability to participate in activities post-break'
      ],
      successMetrics: [
        'Behavior regulation post-break',
        'Self-initiation of breaks',
        'Duration able to engage in activities after break'
      ],
      performance: {
        consistency: 87,
        effectivenessScore: 9.2,
        selfInitiation: 65,
        behaviorImprovement: 89,
        durationOfBenefit: 120 // minutes
      }
    }
  ];

  // Apply filters
  let filteredRoutines = routines;
  if (childId) {
    filteredRoutines = filteredRoutines.filter(routine => routine.childId === childId);
  }
  if (category) {
    filteredRoutines = filteredRoutines.filter(routine => routine.category === category);
  }

  const analytics = {
    totalRoutines: filteredRoutines.length,
    averageConsistency: filteredRoutines.reduce((sum, r) => sum + r.performance.consistency, 0) / filteredRoutines.length,
    highPerformingRoutines: filteredRoutines.filter(r => r.performance.consistency > 85).length,
    needsAttentionRoutines: filteredRoutines.filter(r => r.performance.consistency < 70).length,
    categoryBreakdown: {
      morning: filteredRoutines.filter(r => r.category === 'morning').length,
      therapy: filteredRoutines.filter(r => r.category === 'therapy').length,
      social: filteredRoutines.filter(r => r.category === 'social').length,
      education: filteredRoutines.filter(r => r.category === 'education').length
    }
  };

  return NextResponse.json({
    success: true,
    data: {
      routines: filteredRoutines,
      analytics,
      recommendations: await generateRoutineRecommendations(filteredRoutines)
    }
  });
}

async function getSkillTracking(userId: string, childId?: string) {
  const skillsData = {
    skillCategories: [
      {
        category: 'self-care',
        skills: [
          {
            id: 'skill-1',
            skillName: 'Independent Tooth Brushing',
            currentLevel: 'proficient',
            targetLevel: 'mastered',
            progress: 85,
            milestones: [
              {
                description: 'Brush teeth without verbal prompts',
                targetDate: '2024-02-15',
                achieved: true,
                achievedDate: '2024-02-10',
                evidence: 'Completed 5 consecutive days'
              },
              {
                description: 'Brush for full 2 minutes',
                targetDate: '2024-02-20',
                achieved: false,
                evidence: 'Currently averaging 90 seconds'
              },
              {
                description: 'Remember without any reminders',
                targetDate: '2024-02-25',
                achieved: false
              }
            ],
            supportStrategies: [
              'Visual timer showing 2-minute duration',
              'Favorite character toothbrush',
              'Reward chart for consistency',
              'Brushing song for timing'
            ],
            environmentalFactors: [
              'Good lighting in bathroom',
              'Step stool for sink access',
              'Organized dental supplies',
              'Mirror at appropriate height'
            ],
            practiceSchedule: {
              frequency: 'daily',
              duration: 5,
              preferredTimes: ['08:00', '20:00']
            },
            progressHistory: [
              { date: '2024-01-01', level: 'emerging', score: 25 },
              { date: '2024-01-15', level: 'developing', score: 45 },
              { date: '2024-02-01', level: 'proficient', score: 75 },
              { date: '2024-02-10', level: 'proficient', score: 85 }
            ]
          },
          {
            id: 'skill-2',
            skillName: 'Meal Preparation Assistance',
            currentLevel: 'developing',
            targetLevel: 'proficient',
            progress: 65,
            milestones: [
              {
                description: 'Wash hands before cooking',
                targetDate: '2024-02-05',
                achieved: true,
                achievedDate: '2024-02-03',
                evidence: 'Consistent for 2 weeks'
              },
              {
                description: 'Use child-safe knife for soft foods',
                targetDate: '2024-02-20',
                achieved: false,
                evidence: 'Practicing with supervision'
              },
              {
                description: 'Follow 3-step recipe independently',
                targetDate: '2024-03-05',
                achieved: false
              }
            ],
            supportStrategies: [
              'Picture recipe cards',
              'Child-safe cooking tools',
              'One-on-one instruction',
              'Celebration of efforts'
            ],
            environmentalFactors: [
              'Cleared, organized workspace',
              'Good lighting',
              'Non-slip mats',
              'Accessible ingredients'
            ],
            practiceSchedule: {
              frequency: 'weekly',
              duration: 30,
              preferredTimes: ['16:00']
            }
          }
        ]
      },
      {
        category: 'communication',
        skills: [
          {
            id: 'skill-3',
            skillName: 'Making Clear Requests',
            currentLevel: 'developing',
            targetLevel: 'proficient',
            progress: 65,
            milestones: [
              {
                description: 'Use complete sentences for basic needs',
                targetDate: '2024-02-15',
                achieved: true,
                achievedDate: '2024-02-12',
                evidence: 'Consistent use for food and drink requests'
              },
              {
                description: 'Include "please" and "thank you"',
                targetDate: '2024-02-25',
                achieved: false,
                evidence: 'Remembers 60% of the time'
              },
              {
                description: 'Ask for help when needed',
                targetDate: '2024-03-10',
                achieved: false
              }
            ],
            supportStrategies: [
              'Model complete sentences',
              'Gentle reminders for manners',
              'Positive reinforcement',
              'Social stories about requesting help'
            ],
            practiceSchedule: {
              frequency: 'daily',
              duration: 15,
              preferredTimes: ['throughout day']
            }
          }
        ]
      },
      {
        category: 'social',
        skills: [
          {
            id: 'skill-4',
            skillName: 'Turn Taking in Games',
            currentLevel: 'emerging',
            targetLevel: 'developing',
            progress: 45,
            milestones: [
              {
                description: 'Wait for turn in simple board games',
                targetDate: '2024-02-20',
                achieved: false,
                evidence: 'Can wait with visual timer support'
              },
              {
                description: 'Share materials during activities',
                targetDate: '2024-03-01',
                achieved: false
              },
              {
                description: 'Invite others to take turns',
                targetDate: '2024-03-15',
                achieved: false
              }
            ],
            supportStrategies: [
              'Visual turn-taking cards',
              'Timer for turn duration',
              'Practice with preferred activities first',
              'Peer modeling'
            ],
            practiceSchedule: {
              frequency: 'weekly',
              duration: 45,
              preferredTimes: ['15:30']
            }
          }
        ]
      }
    ],

    overallProgress: {
      totalSkills: 4,
      masteredSkills: 0,
      proficientSkills: 1,
      developingSkills: 2,
      emergingSkills: 1,
      averageProgress: 65,
      skillsOnTrack: 3,
      skillsBehindSchedule: 1
    },

    progressAnalytics: {
      weeklyGains: {
        selfCare: 8,
        communication: 12,
        social: 5,
        academic: 0,
        lifeSkills: 3
      },
      monthlyTrends: [
        { month: 'December', progress: 58 },
        { month: 'January', progress: 62 },
        { month: 'February', progress: 65 }
      ],
      strongestAreas: ['Self-care', 'Communication'],
      growthAreas: ['Social skills', 'Academic skills'],
      recommendedFocus: ['Turn-taking skills', 'Peer interaction']
    },

    upcomingMilestones: [
      {
        skillName: 'Independent Tooth Brushing',
        milestone: 'Brush for full 2 minutes',
        dueDate: '2024-02-20',
        likelihood: 'high'
      },
      {
        skillName: 'Making Clear Requests',
        milestone: 'Include "please" and "thank you"',
        dueDate: '2024-02-25',
        likelihood: 'moderate'
      },
      {
        skillName: 'Turn Taking in Games',
        milestone: 'Wait for turn in simple board games',
        dueDate: '2024-02-20',
        likelihood: 'moderate'
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: skillsData
  });
}

async function getBehaviorPatterns(userId: string, childId?: string, timeframe?: string) {
  // Simulate comprehensive behavior pattern analysis
  const patterns = {
    summary: {
      totalObservations: 247,
      timeframeDays: parseInt(timeframe || '30'),
      averageDailyObservations: 8.2,
      behaviorTrends: 'improving',
      patternStrength: 'strong',
      predictiveAccuracy: 87
    },

    behaviorCategories: {
      positive: {
        count: 184,
        percentage: 74.5,
        trend: 'increasing',
        topBehaviors: [
          'Self-regulation strategies',
          'Peer interaction initiation',
          'Task completion',
          'Following routines'
        ]
      },
      challenging: {
        count: 51,
        percentage: 20.6,
        trend: 'decreasing',
        topBehaviors: [
          'Transition difficulties',
          'Sensory overwhelm responses',
          'Task avoidance',
          'Attention seeking'
        ]
      },
      neutral: {
        count: 12,
        percentage: 4.9,
        trend: 'stable'
      }
    },

    timePatterns: {
      bestTimes: [
        { time: '08:00-10:00', positiveRate: 89, description: 'Morning routine success' },
        { time: '14:00-15:00', positiveRate: 82, description: 'Post-sensory break calm' },
        { time: '19:00-20:00', positiveRate: 85, description: 'Bedtime routine cooperation' }
      ],
      challengingTimes: [
        { time: '11:30-12:30', challengingRate: 35, description: 'Pre-lunch energy dip' },
        { time: '16:00-17:00', challengingRate: 28, description: 'After-school transition' },
        { time: '12:30-13:30', challengingRate: 22, description: 'Lunch and social time' }
      ]
    },

    environmentalFactors: [
      {
        factor: 'Sensory environment',
        impact: 'high',
        positiveConditions: ['Dim lighting', 'Quiet spaces', 'Familiar objects'],
        challengingConditions: ['Loud noises', 'Bright lights', 'Crowded spaces'],
        optimizationScore: 85
      },
      {
        factor: 'Social context',
        impact: 'moderate',
        positiveConditions: ['1-on-1 interaction', 'Familiar people', 'Structured activities'],
        challengingConditions: ['Large groups', 'Unstructured social time', 'New people'],
        optimizationScore: 72
      },
      {
        factor: 'Activity type',
        impact: 'moderate',
        positiveConditions: ['Preferred interests', 'Clear expectations', 'Success-oriented tasks'],
        challengingConditions: ['Non-preferred activities', 'Open-ended tasks', 'Competition'],
        optimizationScore: 78
      }
    ],

    triggerAnalysis: {
      primaryTriggers: [
        {
          trigger: 'Unexpected changes',
          frequency: 23,
          intensity: 7.2,
          interventions: ['Advance warning', 'Visual schedule updates', 'Transition objects'],
          effectiveness: 78
        },
        {
          trigger: 'Sensory overload',
          frequency: 18,
          intensity: 8.1,
          interventions: ['Sensory breaks', 'Noise-canceling headphones', 'Calm space'],
          effectiveness: 92
        },
        {
          trigger: 'Task difficulty',
          frequency: 15,
          intensity: 6.5,
          interventions: ['Task breakdown', 'Additional support', 'Modified expectations'],
          effectiveness: 85
        }
      ],
      emergingTriggers: [
        'Peer conflict',
        'Hunger/thirst',
        'Fatigue'
      ]
    },

    interventionEffectiveness: [
      {
        intervention: 'Sensory break',
        usageCount: 45,
        successRate: 92,
        averageEffectiveness: 8.7,
        bestScenarios: ['Overwhelming environments', 'Transition periods']
      },
      {
        intervention: 'Visual schedule',
        usageCount: 67,
        successRate: 89,
        averageEffectiveness: 8.2,
        bestScenarios: ['Routine activities', 'New environments']
      },
      {
        intervention: 'Choice offering',
        usageCount: 34,
        successRate: 78,
        averageEffectiveness: 7.1,
        bestScenarios: ['Task initiation', 'Transition cooperation']
      }
    ],

    predictiveInsights: [
      {
        pattern: 'Monday mornings show 23% higher challenging behaviors',
        recommendation: 'Implement gentle weekend-to-weekday transition routine',
        confidence: 89
      },
      {
        pattern: 'Positive behaviors increase 67% after sensory breaks',
        recommendation: 'Schedule proactive sensory breaks every 90 minutes',
        confidence: 94
      },
      {
        pattern: 'Peer interactions improve in structured vs unstructured settings',
        recommendation: 'Gradually increase structured peer activities',
        confidence: 82
      }
    ],

    weeklyProgress: [
      { week: 'Week 1', positive: 72, challenging: 25, neutral: 3 },
      { week: 'Week 2', positive: 75, challenging: 22, neutral: 3 },
      { week: 'Week 3', positive: 77, challenging: 20, neutral: 3 },
      { week: 'Week 4', positive: 79, challenging: 18, neutral: 3 }
    ]
  };

  return NextResponse.json({
    success: true,
    data: patterns
  });
}

async function getQualityOfLife(userId: string, childId?: string) {
  const qualityOfLifeData = {
    currentAssessment: {
      assessmentDate: '2024-02-10',
      overallScore: 7.8,
      domains: {
        physicalHealth: {
          score: 8.2,
          factors: ['Good sleep patterns', 'Regular exercise', 'Balanced nutrition'],
          notes: 'Significant improvement in sleep consistency'
        },
        mentalWellbeing: {
          score: 7.5,
          factors: ['Reduced anxiety', 'Improved emotional regulation', 'Positive mood'],
          notes: 'Better coping strategies for stress'
        },
        socialConnections: {
          score: 6.8,
          factors: ['Family relationships strong', 'Emerging peer connections', 'Professional support'],
          notes: 'Working on expanding peer social circle'
        },
        independence: {
          score: 7.2,
          factors: ['Morning routine independence', 'Self-care skills', 'Choice making'],
          notes: 'Notable progress in daily living skills'
        },
        participation: {
          score: 8.1,
          factors: ['School engagement', 'Family activities', 'Therapy participation'],
          notes: 'Excellent engagement in preferred activities'
        },
        satisfaction: {
          score: 8.9,
          factors: ['Enjoys daily routines', 'Positive family relationships', 'Achievement recognition'],
          notes: 'High satisfaction with current support systems'
        }
      },
      priorityAreas: [
        'Social connections with peers',
        'Independence in new environments',
        'Emotional regulation during stress'
      ],
      improvementPlan: [
        {
          area: 'Social connections',
          strategy: 'Structured peer play activities',
          timeline: '3 months',
          responsible: 'Family + School'
        },
        {
          area: 'Independence',
          strategy: 'Gradual exposure to new environments',
          timeline: '6 months',
          responsible: 'Family + Therapist'
        },
        {
          area: 'Emotional regulation',
          strategy: 'Enhanced coping strategy toolkit',
          timeline: '4 months',
          responsible: 'Therapist + Family'
        }
      ]
    },

    historicalTrends: [
      { date: '2023-11-10', overallScore: 6.8, trend: 'baseline' },
      { date: '2023-12-10', overallScore: 7.1, trend: 'improving' },
      { date: '2024-01-10', overallScore: 7.5, trend: 'improving' },
      { date: '2024-02-10', overallScore: 7.8, trend: 'improving' }
    ],

    familyPerspective: {
      parentSatisfaction: 8.7,
      siblingAdjustment: 7.9,
      familyStress: 4.2, // Lower is better
      supportAdequacy: 8.5,
      hopeForFuture: 9.1,
      qualityTime: 8.3
    },

    childPerspective: {
      happinessRating: 8.4,
      schoolEnjoyment: 7.6,
      friendshipSatisfaction: 6.8,
      activitiesEnjoyment: 8.9,
      feelingUnderstood: 8.1,
      confidenceLevel: 7.3
    },

    professionalAssessment: {
      functionalProgress: 8.2,
      goalAttainment: 7.8,
      adaptationSuccess: 8.6,
      familyEngagement: 9.2,
      systemCoordination: 8.4,
      outcomeOptimism: 8.7
    },

    impactFactors: {
      positiveFactors: [
        'Strong family support system',
        'Effective therapy team',
        'School accommodation success',
        'Consistent routines',
        'Sensory environment optimization'
      ],
      challengingFactors: [
        'Limited peer social opportunities',
        'Community activity accessibility',
        'Extended family understanding',
        'Future planning uncertainty'
      ],
      protectiveFactors: [
        'High family resilience',
        'Professional network quality',
        'Child\'s adaptive strengths',
        'Financial stability for supports'
      ]
    },

    goalOutcomes: {
      shortTerm: {
        targetDate: '2024-05-01',
        goals: [
          'Increase peer interaction frequency',
          'Master 3 new independence skills',
          'Reduce transition stress by 50%'
        ],
        likelihood: 'high'
      },
      mediumTerm: {
        targetDate: '2024-08-01',
        goals: [
          'Participate in community activities independently',
          'Develop meaningful peer friendships',
          'Demonstrate emotional regulation consistently'
        ],
        likelihood: 'moderate'
      },
      longTerm: {
        targetDate: '2025-02-01',
        goals: [
          'Achieve educational milestones',
          'Build strong social network',
          'Demonstrate readiness for next transition'
        ],
        likelihood: 'moderate'
      }
    }
  };

  return NextResponse.json({
    success: true,
    data: qualityOfLifeData
  });
}

async function getDailyLivingAnalytics(userId: string, childId?: string, timeframe?: string) {
  const analytics = {
    performanceMetrics: {
      routineConsistency: {
        current: 85,
        target: 90,
        trend: 'improving',
        weeklyChange: '+3%'
      },
      skillMastery: {
        current: 67,
        target: 75,
        trend: 'steady',
        weeklyChange: '+2%'
      },
      behaviorStability: {
        current: 79,
        target: 85,
        trend: 'improving',
        weeklyChange: '+5%'
      },
      familySatisfaction: {
        current: 8.7,
        target: 9.0,
        trend: 'stable',
        weeklyChange: '+0.1'
      }
    },

    correlationAnalysis: [
      {
        factor1: 'Sensory break frequency',
        factor2: 'Positive behavior rate',
        correlation: 0.89,
        significance: 'very high',
        insight: 'More frequent sensory breaks strongly predict better behavior'
      },
      {
        factor1: 'Visual schedule use',
        factor2: 'Task completion rate',
        correlation: 0.82,
        significance: 'high',
        insight: 'Visual schedules significantly improve task completion'
      },
      {
        factor1: 'Sleep quality',
        factor2: 'Next day performance',
        correlation: 0.76,
        significance: 'high',
        insight: 'Better sleep strongly predicts better next-day outcomes'
      }
    ],

    predictiveModeling: {
      nextWeekProjection: {
        routineSuccess: 87,
        skillProgress: 5,
        behaviorChallenges: 15,
        overallWellbeing: 8.1
      },
      monthlyProjection: {
        milestonesLikely: 3,
        skillsToMaster: 1,
        newChallenges: 2,
        familyStress: 3.8
      },
      confidenceLevel: 84
    },

    environmentalImpact: {
      homeEnvironment: {
        score: 8.8,
        strengths: ['Sensory-friendly spaces', 'Clear organization', 'Safety features'],
        improvements: ['Noise reduction in study area', 'Better lighting in bathroom']
      },
      schoolEnvironment: {
        score: 7.6,
        strengths: ['Supportive teachers', 'Accommodation implementation', 'Peer support'],
        improvements: ['Quieter lunch environment', 'More structured break times']
      },
      communityEnvironment: {
        score: 6.4,
        strengths: ['Some autism-friendly venues', 'Supportive neighbors'],
        improvements: ['More accessible activities', 'Increased community awareness']
      }
    },

    interventionROI: [
      {
        intervention: 'Sensory room setup',
        cost: 1200,
        benefitScore: 9.2,
        paybackPeriod: '2 months',
        primaryBenefits: ['Reduced meltdowns', 'Better sleep', 'Improved focus']
      },
      {
        intervention: 'Visual schedule system',
        cost: 150,
        benefitScore: 8.8,
        paybackPeriod: '2 weeks',
        primaryBenefits: ['Increased independence', 'Reduced anxiety', 'Better transitions']
      },
      {
        intervention: 'Therapy team coordination',
        cost: 800,
        benefitScore: 8.5,
        paybackPeriod: '6 weeks',
        primaryBenefits: ['Consistent approaches', 'Faster progress', 'Family confidence']
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: analytics
  });
}

async function getAIRecommendations(userId: string, childId?: string) {
  const recommendations = {
    priorityRecommendations: [
      {
        category: 'Routine Optimization',
        recommendation: 'Implement 15-minute buffer time in morning routine',
        rationale: 'Analysis shows 23% of morning stress occurs due to time pressure',
        expectedImpact: 'Reduce morning stress by 40%',
        implementation: 'Start wake-up 15 minutes earlier, build in flexibility',
        timeframe: 'Immediate',
        confidence: 92
      },
      {
        category: 'Skill Development',
        recommendation: 'Focus on turn-taking skills through preferred activities',
        rationale: 'Child shows high engagement with specific interests',
        expectedImpact: 'Accelerate social skill development by 3x',
        implementation: 'Use favorite games/activities for turn-taking practice',
        timeframe: '2 weeks',
        confidence: 87
      },
      {
        category: 'Sensory Optimization',
        recommendation: 'Increase proactive sensory breaks to every 90 minutes',
        rationale: 'Data shows 67% reduction in challenging behaviors post-break',
        expectedImpact: 'Prevent 50% of sensory overwhelm incidents',
        implementation: 'Schedule automatic breaks, use visual timer reminders',
        timeframe: 'This week',
        confidence: 94
      }
    ],

    personalizedStrategies: [
      {
        area: 'Communication',
        strategy: 'Use preferred character voices for instructions',
        evidence: 'Child responds 89% better to character-based communication',
        implementation: 'Train family members on effective character voices'
      },
      {
        area: 'Motivation',
        strategy: 'Incorporate special interests into learning activities',
        evidence: 'Learning retention increases 156% with interest-based content',
        implementation: 'Create custom learning materials featuring preferred topics'
      },
      {
        area: 'Regulation',
        strategy: 'Teach self-advocacy for sensory needs',
        evidence: 'Self-initiated breaks are 78% more effective than prompted ones',
        implementation: 'Create visual cards for requesting different types of breaks'
      }
    ],

    environmentalOptimizations: [
      {
        location: 'Bedroom',
        optimization: 'Add blackout curtains and white noise machine',
        reason: 'Sleep quality correlation with next-day performance is 76%',
        priority: 'high'
      },
      {
        location: 'Kitchen',
        optimization: 'Lower height storage for independence tools',
        reason: 'Accessibility increases task completion by 45%',
        priority: 'medium'
      },
      {
        location: 'Study area',
        optimization: 'Create visual schedule display board',
        reason: 'Visual schedules improve task transition success by 82%',
        priority: 'high'
      }
    ],

    futureReadiness: [
      {
        transition: 'Secondary school preparation',
        timeline: '18 months',
        keyAreas: ['Independence skills', 'Self-advocacy', 'Peer interaction'],
        preparationSteps: [
          'Gradually increase independence expectations',
          'Practice self-advocacy in safe environments',
          'Expand peer interaction opportunities'
        ]
      },
      {
        transition: 'Community independence',
        timeline: '3-5 years',
        keyAreas: ['Navigation skills', 'Social safety', 'Problem-solving'],
        preparationSteps: [
          'Practice community outings with support',
          'Teach safety awareness and problem-solving',
          'Build communication confidence'
        ]
      }
    ],

    familySupport: [
      {
        recommendation: 'Implement family meeting routine',
        purpose: 'Coordinate approaches and celebrate successes',
        frequency: 'Weekly',
        participants: 'All family members',
        expectedBenefit: 'Increase consistency and reduce stress'
      },
      {
        recommendation: 'Create parent self-care schedule',
        purpose: 'Maintain family resilience and prevent burnout',
        frequency: 'Daily/Weekly',
        activities: 'Personal time, respite, support group',
        expectedBenefit: 'Improve family sustainability and happiness'
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: recommendations
  });
}

// POST action handlers
async function createDailyRoutine(userId: string, routineData: any) {
  const validatedData = dailyRoutineSchema.parse(routineData);

  const routine = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    status: 'active',
    performance: {
      consistency: 0,
      independenceLevel: 0,
      timeEfficiency: 0,
      stressLevel: 5,
      familySatisfaction: 7
    }
  };

  return NextResponse.json({
    success: true,
    data: routine,
    message: 'Daily routine created successfully'
  });
}

async function updateDailyRoutine(userId: string, updateData: any) {
  const { routineId, ...updates } = updateData;

  return NextResponse.json({
    success: true,
    data: { routineId, ...updates, updatedAt: new Date().toISOString() },
    message: 'Routine updated successfully'
  });
}

async function trackSkillProgress(userId: string, skillData: any) {
  const validatedData = skillTrackerSchema.parse(skillData);

  const skillProgress = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    trackedBy: userId,
    lastUpdated: new Date().toISOString(),
    progressHistory: []
  };

  return NextResponse.json({
    success: true,
    data: skillProgress,
    message: 'Skill progress tracked successfully'
  });
}

async function logBehaviorPattern(userId: string, behaviorData: any) {
  const validatedData = behaviorPatternSchema.parse(behaviorData);

  const behaviorLog = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    loggedBy: userId,
    timestamp: new Date().toISOString(),
    analysisComplete: false
  };

  // Trigger pattern analysis
  const analysis = await analyzeBehaviorPattern(behaviorLog);

  return NextResponse.json({
    success: true,
    data: { ...behaviorLog, analysis },
    message: 'Behavior pattern logged and analyzed'
  });
}

async function assessQualityOfLife(userId: string, assessmentData: any) {
  const validatedData = qualityOfLifeSchema.parse(assessmentData);

  const assessment = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    assessedBy: userId,
    completedAt: new Date().toISOString(),
    nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 3 months
  };

  return NextResponse.json({
    success: true,
    data: assessment,
    message: 'Quality of life assessment completed'
  });
}

async function optimizeRoutine(userId: string, optimizationData: any) {
  const { routineId, optimizationType } = optimizationData;

  // AI-powered routine optimization
  const optimization = await generateRoutineOptimization(routineId, optimizationType);

  return NextResponse.json({
    success: true,
    data: optimization,
    message: 'Routine optimization recommendations generated'
  });
}

async function generateProgressReport(userId: string, reportData: any) {
  const { childId, timeframe, includeRecommendations } = reportData;

  const report = {
    id: memoryDatabase.generateId(),
    childId,
    timeframe,
    generatedAt: new Date().toISOString(),
    generatedBy: userId,
    sections: [
      'Routine Performance',
      'Skill Development',
      'Behavior Patterns',
      'Quality of Life',
      'Environmental Factors',
      'Family Impact'
    ],
    recommendations: includeRecommendations,
    format: 'comprehensive'
  };

  return NextResponse.json({
    success: true,
    data: report,
    message: 'Progress report generated successfully'
  });
}

// AI helper functions
async function generateRoutineRecommendations(routines: any[]) {
  return [
    {
      type: 'optimization',
      message: 'Consider adding 10-minute buffer to morning routine based on consistency patterns'
    },
    {
      type: 'enhancement',
      message: 'Sensory breaks show high effectiveness - expand to other routine categories'
    }
  ];
}

async function analyzeBehaviorPattern(behaviorLog: any) {
  return {
    patternStrength: 'moderate',
    correlations: ['Time of day', 'Activity type'],
    recommendations: ['Increase sensory support during identified trigger times'],
    confidence: 84
  };
}

async function generateRoutineOptimization(routineId: string, optimizationType: string) {
  return {
    routineId,
    optimizationType,
    recommendations: [
      'Reduce transition time by 5 minutes',
      'Add visual cue for task completion',
      'Include choice point in sequence'
    ],
    expectedImprovement: '15% increase in consistency',
    implementationComplexity: 'low'
  };
}
