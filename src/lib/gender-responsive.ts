// Gender-Responsive Tools for SpectrumCare Platform
// Addresses the 70.6% male vs 29.4% female diagnostic gap with female-specific features

export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface GenderDemographics {
  male: { count: number; percentage: number; diagnosisRate: number };
  female: { count: number; percentage: number; diagnosisRate: number };
  nonBinary: { count: number; percentage: number; diagnosisRate: number };
  total: number;
}

export const CURRENT_DEMOGRAPHICS: GenderDemographics = {
  male: { count: 450738, percentage: 70.6, diagnosisRate: 1.0 },
  female: { count: 187907, percentage: 29.4, diagnosisRate: 0.65 }, // 35% underdiagnosed
  nonBinary: { count: 100, percentage: 0.02, diagnosisRate: 0.45 }, // 55% underdiagnosed
  total: 638745
};

// Female-Specific Autism Traits and Masking Behaviors
export const FEMALE_SPECIFIC_TRAITS = {
  maskingBehaviors: [
    'Copying peers\' social behaviors and mannerisms',
    'Forcing eye contact despite discomfort',
    'Suppressing stimming behaviors in public',
    'Rehearsing conversations and social interactions',
    'Mimicking popular culture or media characters',
    'Hiding intense interests to appear "normal"',
    'Forcing herself to participate in group activities',
    'Suppressing meltdowns until reaching a safe space'
  ],

  socialCamouflaging: [
    'Appears socially competent but feels exhausted after interactions',
    'Has learned social scripts but struggles with spontaneous conversation',
    'May have close friendships but finds them mentally demanding',
    'Observes and copies others\' behavior in social situations',
    'May appear confident but experiences high anxiety',
    'Struggles with changes in social dynamics or group composition'
  ],

  internalizedBehaviors: [
    'Intense anxiety about social situations',
    'Perfectionism and high personal standards',
    'Difficulty identifying and expressing emotions',
    'Tendency to blame herself for social difficulties',
    'May develop eating disorders or self-harm behaviors',
    'Experiences burnout from constant masking efforts'
  ],

  specialInterests: [
    'Interests may appear more "typical" (horses, celebrities, books)',
    'May collect items or have detailed knowledge about people/relationships',
    'Interests might be less obviously "autistic" to observers',
    'May hyperfocus on social dynamics or psychology',
    'Could have intense interests in fantasy worlds or fictional characters'
  ]
};

// Gender-Responsive Assessment Questions
export const GENDER_RESPONSIVE_ASSESSMENT = {
  female: {
    title: 'Female-Specific Autism Assessment',
    description: 'Designed to identify autism traits that may be masked or internalized in females',
    sections: [
      {
        title: 'Social Masking and Camouflaging',
        questions: [
          {
            id: 'mask_1',
            question: 'Do you copy other people\'s behavior, expressions, or mannerisms to fit in?',
            type: 'likert',
            femaleSpecific: true
          },
          {
            id: 'mask_2',
            question: 'Do you feel exhausted after social interactions, even enjoyable ones?',
            type: 'likert',
            femaleSpecific: true
          },
          {
            id: 'mask_3',
            question: 'Do you rehearse conversations or practice social situations in your head?',
            type: 'likert',
            femaleSpecific: true
          },
          {
            id: 'mask_4',
            question: 'Do you suppress natural behaviors (like stimming) when others are around?',
            type: 'likert',
            femaleSpecific: true
          }
        ]
      },
      {
        title: 'Internalized Experiences',
        questions: [
          {
            id: 'internal_1',
            question: 'Do you experience intense anxiety about making social mistakes?',
            type: 'likert',
            femaleSpecific: true
          },
          {
            id: 'internal_2',
            question: 'Do you have very high standards for yourself that others might consider unrealistic?',
            type: 'likert',
            femaleSpecific: true
          },
          {
            id: 'internal_3',
            question: 'Do you often blame yourself when social interactions don\'t go well?',
            type: 'likert',
            femaleSpecific: true
          }
        ]
      },
      {
        title: 'Interests and Sensory Experiences',
        questions: [
          {
            id: 'interest_1',
            question: 'Do you have intense interests that might appear "typical" to others?',
            type: 'likert',
            femaleSpecific: true
          },
          {
            id: 'sensory_1',
            question: 'Are you over- or under-sensitive to textures, sounds, lights, or other sensory input?',
            type: 'likert',
            femaleSpecific: false
          }
        ]
      }
    ]
  },

  male: {
    title: 'Male-Focused Autism Assessment',
    description: 'Traditional autism assessment adapted for male presentation patterns',
    sections: [
      {
        title: 'Social Communication',
        questions: [
          {
            id: 'male_social_1',
            question: 'Do you find it difficult to start or maintain conversations?',
            type: 'likert',
            femaleSpecific: false
          },
          {
            id: 'male_social_2',
            question: 'Do you prefer activities where you can work alone rather than in groups?',
            type: 'likert',
            femaleSpecific: false
          }
        ]
      },
      {
        title: 'Repetitive Behaviors and Interests',
        questions: [
          {
            id: 'male_interest_1',
            question: 'Do you have very focused interests that you know a lot about?',
            type: 'likert',
            femaleSpecific: false
          },
          {
            id: 'male_behavior_1',
            question: 'Do you engage in repetitive behaviors or movements?',
            type: 'likert',
            femaleSpecific: false
          }
        ]
      }
    ]
  }
};

// Gender-Responsive Support Recommendations
export const GENDER_SUPPORT_RECOMMENDATIONS = {
  female: {
    earlyIdentification: [
      'Look for masking behaviors rather than obvious autism traits',
      'Assess for social exhaustion and perfectionism',
      'Consider high-functioning presentation with internal struggles',
      'Evaluate anxiety and depression as possible secondary conditions'
    ],

    supportStrategies: [
      'Teach self-advocacy skills and authentic self-expression',
      'Provide safe spaces to unmask and be authentic',
      'Address perfectionism and self-blame patterns',
      'Support development of genuine rather than performed friendships',
      'Validate experiences and reduce shame about masking'
    ],

    therapeuticApproaches: [
      'Focus on identity development and self-acceptance',
      'Address anxiety and depression with autism-informed approaches',
      'Teach emotional regulation and sensory management',
      'Support transition away from excessive masking behaviors'
    ]
  },

  male: {
    earlyIdentification: [
      'Standard autism screening tools are generally effective',
      'Look for clear communication differences and repetitive behaviors',
      'Assess special interests and sensory sensitivities',
      'Evaluate social interaction challenges'
    ],

    supportStrategies: [
      'Develop communication and social skills',
      'Support special interests as strengths',
      'Teach explicit social rules and expectations',
      'Provide structured environments and clear routines'
    ],

    therapeuticApproaches: [
      'Behavioral interventions and skill development',
      'Communication therapy and social skills training',
      'Sensory integration support',
      'Executive functioning skill development'
    ]
  }
};

// Gender-Responsive UI Themes
export const GENDER_THEMES = {
  femaleAffirming: {
    colors: {
      primary: '#8B5A9F',     // Muted purple
      secondary: '#6B9BD2',   // Soft blue
      accent: '#E8B4CB',      // Dusty rose
      background: '#FAF8FC',  // Very light lavender
      card: '#FFFFFF',
      text: '#2D1B40'
    },
    messaging: {
      tone: 'validating and empowering',
      language: 'strength-based and identity-affirming',
      focus: 'self-acceptance and authentic expression'
    }
  },

  maleAffirming: {
    colors: {
      primary: '#2C5282',     // Deep blue
      secondary: '#38A169',   // Forest green
      accent: '#ED8936',      // Orange
      background: '#F7FAFC',  // Light gray
      card: '#FFFFFF',
      text: '#1A202C'
    },
    messaging: {
      tone: 'direct and skill-focused',
      language: 'clear and practical',
      focus: 'skill development and achievement'
    }
  },

  nonBinaryInclusive: {
    colors: {
      primary: '#4A5568',     // Neutral gray
      secondary: '#4FD1C7',   // Teal
      accent: '#F6E05E',      // Yellow
      background: '#FFFFFF',  // Clean white
      card: '#F8F9FA',
      text: '#2D3748'
    },
    messaging: {
      tone: 'inclusive and flexible',
      language: 'person-first and identity-neutral',
      focus: 'individual strengths and preferences'
    }
  }
};

// Calculate estimated undiagnosed population
export const getUndiagnosedEstimate = (gender: Gender): number => {
  const expectedRatio = 0.5; // Assuming roughly equal autism prevalence across genders
  const totalDiagnosed = CURRENT_DEMOGRAPHICS.total;
  const expectedForGender = totalDiagnosed * expectedRatio;

  switch (gender) {
    case 'female':
      return Math.max(0, expectedForGender - CURRENT_DEMOGRAPHICS.female.count);
    case 'male':
      return Math.max(0, expectedForGender - CURRENT_DEMOGRAPHICS.male.count);
    default:
      return 0;
  }
};

// Gender-responsive intervention recommendations
export const getGenderResponsiveInterventions = (gender: Gender, ageGroup: string) => {
  const baseInterventions = {
    female: {
      primary: ['Masking awareness therapy', 'Self-advocacy training', 'Authentic identity development'],
      secondary: ['Social fatigue management', 'Perfectionism addressing', 'Emotional regulation'],
      support: ['Safe unmasking spaces', 'Female role models', 'Peer support groups']
    },
    male: {
      primary: ['Social skills training', 'Communication development', 'Behavioral support'],
      secondary: ['Sensory regulation', 'Executive functioning', 'Special interest integration'],
      support: ['Structured environments', 'Clear expectations', 'Achievement recognition']
    },
    'non-binary': {
      primary: ['Individualized assessment', 'Identity-affirming support', 'Flexible approaches'],
      secondary: ['Strength-based planning', 'Environmental adaptations', 'Self-determination'],
      support: ['Inclusive spaces', 'Diverse role models', 'Community connections']
    }
  };

  return baseInterventions[gender] || baseInterventions['non-binary'];
};
