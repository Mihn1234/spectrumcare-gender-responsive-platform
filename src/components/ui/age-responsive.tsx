'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgeGroup, AgeTheme, AGE_THEMES, AGE_GROUP_INFO, getAgeGroupFromSelection } from '@/lib/age-themes';
import { Card as BaseCard, CardContent as BaseCardContent, CardHeader as BaseCardHeader } from '@/components/ui/card';
import { Button as BaseButton } from '@/components/ui/button';
import { Badge as BaseBadge } from '@/components/ui/badge';

// Age Context for managing current age group
interface AgeContextType {
  ageGroup: AgeGroup;
  theme: AgeTheme;
  setAgeGroup: (age: AgeGroup) => void;
  ageInfo: typeof AGE_GROUP_INFO[AgeGroup];
}

const AgeContext = createContext<AgeContextType | undefined>(undefined);

export const useAge = () => {
  const context = useContext(AgeContext);
  if (!context) {
    throw new Error('useAge must be used within an AgeProvider');
  }
  return context;
};

// Age Provider Component
interface AgeProviderProps {
  children: React.ReactNode;
  defaultAge?: AgeGroup;
}

export const AgeProvider: React.FC<AgeProviderProps> = ({ children, defaultAge = 'primary' }) => {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(defaultAge);
  const theme = AGE_THEMES[ageGroup];
  const ageInfo = AGE_GROUP_INFO[ageGroup];

  // Load age preference from localStorage
  useEffect(() => {
    const savedAge = localStorage.getItem('spectrumcare-age-group');
    if (savedAge && savedAge in AGE_THEMES) {
      setAgeGroup(savedAge as AgeGroup);
    }
  }, []);

  // Save age preference to localStorage
  const handleSetAgeGroup = (age: AgeGroup) => {
    setAgeGroup(age);
    localStorage.setItem('spectrumcare-age-group', age);
  };

  return (
    <AgeContext.Provider value={{
      ageGroup,
      theme,
      setAgeGroup: handleSetAgeGroup,
      ageInfo
    }}>
      <div className={`age-theme-${ageGroup}`} style={{
        '--primary-color': theme.colors.primary,
        '--secondary-color': theme.colors.secondary,
        '--accent-color': theme.colors.accent,
        '--background-color': theme.colors.background,
        '--card-color': theme.colors.card,
        '--text-color': theme.colors.text,
      } as React.CSSProperties}>
        {children}
      </div>
    </AgeContext.Provider>
  );
};

// Age-Responsive Card Component
interface AgeCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'playful';
}

export const AgeCard: React.FC<AgeCardProps> = ({ children, className = '', variant = 'default' }) => {
  const { theme, ageGroup } = useAge();

  const getVariantStyles = () => {
    switch (variant) {
      case 'interactive':
        return ageGroup === 'early-years' || ageGroup === 'primary'
          ? 'hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer'
          : 'hover:shadow-md transition-shadow';
      case 'playful':
        return ageGroup === 'early-years'
          ? 'border-4 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-yellow-50'
          : '';
      default:
        return '';
    }
  };

  return (
    <BaseCard className={`
      ${theme.spacing.padding}
      ${theme.spacing.borderRadius}
      ${getVariantStyles()}
      ${className}
    `} style={{ backgroundColor: theme.colors.card }}>
      {children}
    </BaseCard>
  );
};

// Age-Responsive Button Component
interface AgeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'fun';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const AgeButton: React.FC<AgeButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const { theme, ageGroup } = useAge();

  const getButtonStyles = () => {
    const baseStyles = `${theme.spacing.buttonSize} ${theme.spacing.borderRadius} ${theme.typography.fontWeight}`;

    switch (variant) {
      case 'primary':
        return `${baseStyles} text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`;
      case 'secondary':
        return `${baseStyles} border-2 hover:shadow-md transition-all`;
      case 'fun':
        return ageGroup === 'early-years' || ageGroup === 'primary'
          ? `${baseStyles} bg-gradient-to-r from-pink-400 to-purple-400 text-white transform hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-lg`
          : baseStyles;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return ageGroup === 'early-years' ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-sm';
      case 'lg':
        return ageGroup === 'early-years' ? 'px-12 py-6 text-2xl' : 'px-8 py-4 text-lg';
      default:
        return theme.spacing.buttonSize;
    }
  };

  return (
    <BaseButton
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonStyles()} ${getSizeStyles()} ${className}`}
      style={{
        backgroundColor: variant === 'primary' ? theme.colors.primary :
                        variant === 'secondary' ? 'transparent' : undefined,
        borderColor: variant === 'secondary' ? theme.colors.primary : undefined,
        color: variant === 'secondary' ? theme.colors.primary : undefined
      }}
    >
      {children}
    </BaseButton>
  );
};

// Age-Responsive Header Component
interface AgeHeaderProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export const AgeHeader: React.FC<AgeHeaderProps> = ({ children, level = 1, className = '' }) => {
  const { theme, ageGroup } = useAge();

  const getHeaderStyles = () => {
    const baseSize = level === 1 ? theme.typography.headerSize :
                    level === 2 ? 'text-xl' : 'text-lg';

    return `${baseSize} ${theme.typography.fontWeight} ${theme.typography.fontFamily}`;
  };

  const getDecorations = () => {
    if (ageGroup === 'early-years') {
      return level === 1 ? '🌟 ' + children + ' 🌟' : children;
    }
    return children;
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`${getHeaderStyles()} ${className}`}
      style={{ color: theme.colors.text }}
    >
      {getDecorations()}
    </Tag>
  );
};

// Age-Responsive Badge Component
interface AgeBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'fun';
  className?: string;
}

export const AgeBadge: React.FC<AgeBadgeProps> = ({ children, variant = 'info', className = '' }) => {
  const { theme, ageGroup } = useAge();

  const getVariantStyles = () => {
    if (ageGroup === 'early-years' && variant === 'fun') {
      return 'bg-gradient-to-r from-pink-400 to-purple-400 text-white animate-pulse';
    }

    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'fun':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BaseBadge
      className={`${theme.spacing.borderRadius} ${getVariantStyles()} ${className}`}
    >
      {children}
    </BaseBadge>
  );
};

// Age-Responsive Text Component
interface AgeTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
}

export const AgeText: React.FC<AgeTextProps> = ({ children, size = 'base', className = '' }) => {
  const { theme } = useAge();

  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return theme.typography.bodySize;
    }
  };

  return (
    <p
      className={`${getSizeClass()} ${className}`}
      style={{ color: theme.colors.text }}
    >
      {children}
    </p>
  );
};

// Age Group Selector Component
interface AgeGroupSelectorProps {
  onAgeChange?: (age: AgeGroup) => void;
  className?: string;
}

export const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({ onAgeChange, className = '' }) => {
  const { ageGroup, setAgeGroup } = useAge();

  const handleAgeChange = (newAge: AgeGroup) => {
    setAgeGroup(newAge);
    onAgeChange?.(newAge);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(AGE_GROUP_INFO).map(([key, info]) => (
        <button
          key={key}
          onClick={() => handleAgeChange(key as AgeGroup)}
          className={`
            px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
            ${ageGroup === key
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }
          `}
        >
          <span className="mr-2">{info.icon}</span>
          {info.label}
        </button>
      ))}
    </div>
  );
};
