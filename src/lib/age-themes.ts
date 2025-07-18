// Age-Appropriate Theme System for SpectrumCare Platform
// Adapts UI/UX for Early Years (4-5), Primary (5-11), Secondary (11-16), Post-16 (16-25)

import { ReactNode } from 'react';

export type AgeGroup = 'early-years' | 'primary' | 'secondary' | 'post-16';

export interface AgeTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
  };
  typography: {
    headerSize: string;
    bodySize: string;
    fontWeight: string;
    fontFamily: string;
  };
  spacing: {
    padding: string;
    margin: string;
    borderRadius: string;
    buttonSize: string;
  };
  animations: {
    enabled: boolean;
    duration: string;
    easing: string;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
  };
}

export const AGE_THEMES: Record<AgeGroup, AgeTheme> = {
  'early-years': {
    colors: {
      primary: '#FF6B9D',     // Bright pink
      secondary: '#4ECDC4',   // Teal
      accent: '#FFE66D',      // Yellow
      background: '#FFF8F3',  // Warm cream
      card: '#FFFFFF',
      text: '#2D3748'
    },
    typography: {
      headerSize: 'text-3xl',
      bodySize: 'text-xl',
      fontWeight: 'font-bold',
      fontFamily: 'Comic Neue, cursive'
    },
    spacing: {
      padding: 'p-8',
      margin: 'm-6',
      borderRadius: 'rounded-3xl',
      buttonSize: 'px-8 py-4'
    },
    animations: {
      enabled: true,
      duration: '300ms',
      easing: 'ease-in-out'
    },
    accessibility: {
      highContrast: true,
      largeText: true,
      reducedMotion: false
    }
  },

  'primary': {
    colors: {
      primary: '#9F7AEA',     // Purple
      secondary: '#4299E1',   // Blue
      accent: '#48BB78',      // Green
      background: '#F7FAFC',  // Light gray
      card: '#FFFFFF',
      text: '#2D3748'
    },
    typography: {
      headerSize: 'text-2xl',
      bodySize: 'text-lg',
      fontWeight: 'font-semibold',
      fontFamily: 'Poppins, sans-serif'
    },
    spacing: {
      padding: 'p-6',
      margin: 'm-4',
      borderRadius: 'rounded-2xl',
      buttonSize: 'px-6 py-3'
    },
    animations: {
      enabled: true,
      duration: '250ms',
      easing: 'ease-out'
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false
    }
  },

  'secondary': {
    colors: {
      primary: '#3182CE',     // Professional blue
      secondary: '#38A169',   // Green
      accent: '#E53E3E',      // Red accent
      background: '#FFFFFF',  // Clean white
      card: '#F8F9FA',
      text: '#1A202C'
    },
    typography: {
      headerSize: 'text-xl',
      bodySize: 'text-base',
      fontWeight: 'font-medium',
      fontFamily: 'Inter, sans-serif'
    },
    spacing: {
      padding: 'p-4',
      margin: 'm-3',
      borderRadius: 'rounded-lg',
      buttonSize: 'px-4 py-2'
    },
    animations: {
      enabled: true,
      duration: '200ms',
      easing: 'ease'
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false
    }
  },

  'post-16': {
    colors: {
      primary: '#2D3748',     // Dark gray
      secondary: '#4A5568',   // Medium gray
      accent: '#3182CE',      // Blue
      background: '#FFFFFF',  // Professional white
      card: '#F7FAFC',
      text: '#1A202C'
    },
    typography: {
      headerSize: 'text-lg',
      bodySize: 'text-sm',
      fontWeight: 'font-normal',
      fontFamily: 'system-ui, sans-serif'
    },
    spacing: {
      padding: 'p-3',
      margin: 'm-2',
      borderRadius: 'rounded-md',
      buttonSize: 'px-3 py-1.5'
    },
    animations: {
      enabled: false,
      duration: '150ms',
      easing: 'linear'
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: true
    }
  }
};

export const AGE_GROUP_INFO = {
  'early-years': {
    label: 'Early Years (4-5)',
    description: 'Play-based learning with visual support',
    icon: '🧸',
    percentage: 26.4,
    totalUsers: 168628
  },
  'primary': {
    label: 'Primary (5-11)',
    description: 'Interactive and engaging experience',
    icon: '🎨',
    percentage: 45.6,
    totalUsers: 291228
  },
  'secondary': {
    label: 'Secondary (11-16)',
    description: 'Clean, functional, and empowering',
    icon: '📚',
    percentage: 40.2,
    totalUsers: 256788
  },
  'post-16': {
    label: 'Post-16 (16-25)',
    description: 'Professional and independence-focused',
    icon: '🎓',
    percentage: 22.0,
    totalUsers: 140564
  }
};

export const getAgeGroupFromBirthDate = (birthDate: string): AgeGroup => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();

  if (age <= 5) return 'early-years';
  if (age <= 11) return 'primary';
  if (age <= 16) return 'secondary';
  return 'post-16';
};

export const getAgeGroupFromSelection = (selection: string): AgeGroup => {
  const mapping: Record<string, AgeGroup> = {
    'early-years': 'early-years',
    'primary': 'primary',
    'secondary': 'secondary',
    'post-16': 'post-16'
  };
  return mapping[selection] || 'primary';
};
