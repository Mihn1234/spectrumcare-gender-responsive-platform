// SpectrumCare Brand Assets & Design System
// Complete brand color palette and logo assets

export const BRAND_COLORS = {
  // Primary Brand Colors
  primary: {
    purple: '#6B46C1',      // Main brand purple
    blue: '#2563EB',        // Primary blue
    indigo: '#4F46E5',      // Secondary indigo
    cyan: '#06B6D4',        // Accent cyan
  },

  // Gradient Combinations
  gradients: {
    hero: 'from-purple-900 via-blue-900 to-indigo-900',
    accent: 'from-cyan-400 to-blue-400',
    button: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-600 to-indigo-600',
    medical: 'from-red-500 to-pink-600',
    specialist: 'from-blue-500 to-cyan-600',
    voice: 'from-green-500 to-emerald-600',
    cta: 'from-blue-600 to-purple-600'
  }
};

// Logo Icon Only (Brain) SVG
export const BRAIN_ICON_SVG = `
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6B46C1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </linearGradient>
  </defs>

  <path d="M20 8c-2.5 0-4.7 1.2-6 3-1.3-1.8-3.5-3-6-3-4.4 0-8 3.6-8 8 0 2.1.8 4 2.1 5.4-.6 1.4-.9 2.9-.9 4.6 0 6.1 4.9 11 11 11s11-4.9 11-11c0-1.7-.3-3.2-.9-4.6 1.3-1.4 2.1-3.3 2.1-5.4 0-4.4-3.6-8-8-8z"
        fill="url(#brainGradient)"
        stroke="none"/>
  <!-- Neural pathways -->
  <circle cx="12" cy="18" r="1.5" fill="white" opacity="0.8"/>
  <circle cx="18" cy="22" r="1" fill="white" opacity="0.6"/>
  <circle cx="15" cy="15" r="1" fill="white" opacity="0.7"/>
  <line x1="12" y1="18" x2="15" y2="15" stroke="white" stroke-width="0.5" opacity="0.5"/>
  <line x1="15" y1="15" x2="18" y2="22" stroke="white" stroke-width="0.5" opacity="0.5"/>
</svg>
`;

// Full SpectrumCare Logo SVG
export const SPECTRUM_CARE_LOGO_SVG = `
<svg width="200" height="50" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6B46C1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Brain Icon -->
  <path d="M25 10c-2.5 0-4.7 1.2-6 3-1.3-1.8-3.5-3-6-3-4.4 0-8 3.6-8 8 0 2.1.8 4 2.1 5.4-.6 1.4-.9 2.9-.9 4.6 0 6.1 4.9 11 11 11s11-4.9 11-11c0-1.7-.3-3.2-.9-4.6 1.3-1.4 2.1-3.3 2.1-5.4 0-4.4-3.6-8-8-8z"
        fill="url(#logoGradient)" stroke="none"/>

  <!-- Text -->
  <text x="55" y="20" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="url(#logoGradient)">SpectrumCare</text>
  <text x="55" y="35" font-family="Inter, sans-serif" font-size="9" fill="#6B7280">Comprehensive Autism Support</text>
</svg>
`;

// Brand Guidelines
export const BRAND_GUIDELINES = {
  logo: {
    minSize: '32px',
    clearSpace: '16px',
    formats: ['SVG', 'PNG', 'WebP']
  },

  colors: {
    primary: BRAND_COLORS.primary,
    usage: 'Use purple for primary actions, blue for secondary actions, cyan for accents'
  },

  typography: {
    primary: 'Inter, system-ui, sans-serif',
    weights: [400, 500, 600, 700, 800]
  }
};

// Export downloadable brand assets
export const downloadableBrandAssets = () => {
  return {
    colors: BRAND_COLORS,
    logoSVG: SPECTRUM_CARE_LOGO_SVG,
    iconSVG: BRAIN_ICON_SVG,
    guidelines: BRAND_GUIDELINES
  };
};
