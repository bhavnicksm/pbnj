import userConfig from '../../pbnj.config.js';
import { getTheme, defaultTheme, type Theme, type ThemeColors } from './themes';

export interface FooterConfig {
  text: string;
  link?: string;
}

export interface IconsConfig {
  login: string;
  logout: string;
  newPaste: string;
}

export interface PbnjConfig {
  name: string;
  logo: string;
  idStyle: 'sandwich' | 'short' | 'uuid';
  homepage: boolean;
  maxPasteSize: string;
  theme: string;
  sortOrder: 'newest' | 'oldest';
  icons: IconsConfig;
  footer?: FooterConfig;
}

const defaults: PbnjConfig = {
  name: 'pbnj',
  logo: '/logo.png',
  idStyle: 'sandwich',
  homepage: true,
  maxPasteSize: '1mb',
  theme: defaultTheme,
  sortOrder: 'newest',
  icons: {
    login: '/peanut.png',
    logout: '/jelly.png',
    newPaste: '/bread.png',
  },
  footer: {
    text: 'spread the code 🥪',
    link: 'https://github.com/bhavnicksm/pbnj',
  },
};

export const config: PbnjConfig = {
  ...defaults,
  ...userConfig,
};

// Get the resolved theme object
export const theme: Theme = getTheme(config.theme);

// Export theme colors for easy access
export const colors: ThemeColors = theme.colors;

/**
 * Parse size string to bytes
 * @param size - Size string like '1mb', '500kb'
 * @returns Size in bytes
 */
export function parseSize(size: string): number {
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 1024 * 1024; // Default 1mb

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  const multipliers: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  return Math.floor(value * multipliers[unit]);
}

export default config;
