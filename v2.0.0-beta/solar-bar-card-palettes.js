// solar-bar-card-palettes.js
// Color palette definitions for Solar Bar Card
// Version 2.0.0 - Added battery colors

export const COLOR_PALETTES = {
  'classic-solar': {
    name: 'Classic Solar',
    icon: '🌞',
    description: 'Bright, traditional solar colors',
    colors: {
      solar: '#FFE082',
      export: '#A5D6A7',
      import: '#FFAB91',
      self_usage: '#B39DDB',
      ev_charge: '#81D4FA',
      battery_charge: '#80DEEA',
      battery_discharge: '#64B5F6'
    }
  },
  'soft-meadow': {
    name: 'Soft Meadow',
    icon: '🌸',
    description: 'Gentle pastels with spring vibes',
    colors: {
      solar: '#FFF59D',
      export: '#C5E1A5',
      import: '#FFCCBC',
      self_usage: '#D1C4E9',
      ev_charge: '#B2EBF2',
      battery_charge: '#B2DFDB',
      battery_discharge: '#90CAF9'
    }
  },
  'ocean-sunset': {
    name: 'Ocean Sunset',
    icon: '🌊',
    description: 'Warm sunset meets cool ocean',
    colors: {
      solar: '#FFECB3',
      export: '#A8E6CF',
      import: '#FFD4BA',
      self_usage: '#E6D5F0',
      ev_charge: '#B3E5FC',
      battery_charge: '#A5D6E8',
      battery_discharge: '#81C7E8'
    }
  },
  'garden-fresh': {
    name: 'Garden Fresh',
    icon: '🌿',
    description: 'Natural greens and soft tones',
    colors: {
      solar: '#FFF9C4',
      export: '#C8E6C9',
      import: '#FFCCBC',
      self_usage: '#C5CAE9',
      ev_charge: '#B2DFDB',
      battery_charge: '#9ED4CC',
      battery_discharge: '#80CBC4'
    }
  },
  'peachy-keen': {
    name: 'Peachy Keen',
    icon: '🍑',
    description: 'Warm peach and lavender blend',
    colors: {
      solar: '#FFF4C4',
      export: '#B8E6B8',
      import: '#FFC4B3',
      self_usage: '#D4C5E8',
      ev_charge: '#B3D9E6',
      battery_charge: '#A0DBE6',
      battery_discharge: '#7EC8DB'
    }
  },
  'cloudy-day': {
    name: 'Cloudy Day',
    icon: '☁️',
    description: 'Soft, cloudy sky palette',
    colors: {
      solar: '#FFFACD',
      export: '#B4E6C3',
      import: '#FFDAC1',
      self_usage: '#D4DAEC',
      ev_charge: '#C4E4F5',
      battery_charge: '#B0D9E8',
      battery_discharge: '#9CCFDF'
    }
  },
  'custom': {
    name: 'Custom',
    icon: '🎨',
    description: 'Define your own colors',
    colors: {
      solar: '#FFD700',
      export: '#90EE90',
      import: '#FF6B6B',
      self_usage: '#9370DB',
      ev_charge: '#87CEEB',
      battery_charge: '#4DD0E1',
      battery_discharge: '#42A5F5'
    }
  }
};

// Helper function to get colors from config
export function getCardColors(config) {
  const palette = config.color_palette || 'classic-solar';

  // Start with palette colors
  let colors = COLOR_PALETTES[palette]?.colors || COLOR_PALETTES['classic-solar'].colors;

  // Override with any custom colors provided
  if (config.custom_colors) {
    colors = {
      ...colors,
      ...config.custom_colors
    };
  }

  return colors;
}

// Get palette options for selector
export function getPaletteOptions() {
  return Object.keys(COLOR_PALETTES).map(key => ({
    value: key,
    label: `${COLOR_PALETTES[key].icon} ${COLOR_PALETTES[key].name}`
  }));
}

// Apply selected palette colors as CSS variables
export function applyPaletteColors(config) {
  const colors = getCardColors(config);

  // Set each palette color as a CSS variable
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
}
