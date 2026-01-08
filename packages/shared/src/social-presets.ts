import type { SocialPresetKey } from './types';

export type IconSource = 'lucide' | 'simple-icons';

export interface SocialPreset {
  icon: string;
  iconSource: IconSource;
  label: string;
  bgColor: string;
  textColor: string;
  urlPattern?: RegExp;
  baseUrl?: string;
}

export const SOCIAL_PRESETS: Record<SocialPresetKey, SocialPreset> = {
  theme: {
    icon: 'palette',
    iconSource: 'lucide',
    label: 'Thème',
    bgColor: '#FF6B5B',
    textColor: '#ffffff',
  },
  instagram: {
    icon: 'instagram',
    iconSource: 'simple-icons',
    label: 'Instagram',
    bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    textColor: '#ffffff',
    urlPattern: /instagram\.com/i,
    baseUrl: 'https://instagram.com/',
  },
  youtube: {
    icon: 'youtube',
    iconSource: 'simple-icons',
    label: 'YouTube',
    bgColor: '#FF0000',
    textColor: '#ffffff',
    urlPattern: /youtube\.com|youtu\.be/i,
    baseUrl: 'https://youtube.com/@',
  },
  linkedin: {
    icon: 'linkedin',
    iconSource: 'lucide',
    label: 'LinkedIn',
    bgColor: '#0A66C2',
    textColor: '#ffffff',
    urlPattern: /linkedin\.com/i,
    baseUrl: 'https://linkedin.com/in/',
  },
  x: {
    icon: 'x',
    iconSource: 'simple-icons',
    label: 'X (Twitter)',
    bgColor: '#000000',
    textColor: '#ffffff',
    urlPattern: /twitter\.com|x\.com/i,
    baseUrl: 'https://x.com/',
  },
  tiktok: {
    icon: 'tiktok',
    iconSource: 'simple-icons',
    label: 'TikTok',
    bgColor: '#000000',
    textColor: '#ffffff',
    urlPattern: /tiktok\.com/i,
    baseUrl: 'https://tiktok.com/@',
  },
  facebook: {
    icon: 'facebook',
    iconSource: 'simple-icons',
    label: 'Facebook',
    bgColor: '#1877F2',
    textColor: '#ffffff',
    urlPattern: /facebook\.com|fb\.com/i,
    baseUrl: 'https://facebook.com/',
  },
  github: {
    icon: 'github',
    iconSource: 'simple-icons',
    label: 'GitHub',
    bgColor: '#181717',
    textColor: '#ffffff',
    urlPattern: /github\.com/i,
    baseUrl: 'https://github.com/',
  },
  email: {
    icon: 'mail',
    iconSource: 'lucide',
    label: 'Email',
    bgColor: '#EA4335',
    textColor: '#ffffff',
    urlPattern: /^mailto:/i,
    baseUrl: 'mailto:',
  },
  whatsapp: {
    icon: 'whatsapp',
    iconSource: 'simple-icons',
    label: 'WhatsApp',
    bgColor: '#25D366',
    textColor: '#ffffff',
    urlPattern: /wa\.me|whatsapp\.com/i,
    baseUrl: 'https://wa.me/',
  },
} as const;

/**
 * Translation key mapping for social preset labels.
 * Consumers can use these keys to get translated labels from their i18n system.
 */
export const SOCIAL_PRESET_LABEL_KEYS: Record<SocialPresetKey, string> = {
  theme: 'social_theme',
  instagram: 'social_instagram',
  youtube: 'social_youtube',
  linkedin: 'social_linkedin',
  x: 'social_x',
  tiktok: 'social_tiktok',
  facebook: 'social_facebook',
  github: 'social_github',
  email: 'social_email',
  whatsapp: 'social_whatsapp',
} as const;

/**
 * Get a social preset by key
 */
export function getSocialPreset(key: SocialPresetKey): SocialPreset {
  return SOCIAL_PRESETS[key];
}

/**
 * Get all social preset keys
 */
export function getSocialPresetKeys(): SocialPresetKey[] {
  return Object.keys(SOCIAL_PRESETS) as SocialPresetKey[];
}

/**
 * Detect social preset from URL
 */
export function detectSocialPreset(url: string): SocialPresetKey | null {
  for (const [key, preset] of Object.entries(SOCIAL_PRESETS)) {
    if (preset.urlPattern && preset.urlPattern.test(url)) {
      return key as SocialPresetKey;
    }
  }
  return null;
}

/**
 * Check if a string is a valid social preset key
 */
export function isSocialPresetKey(key: string): key is SocialPresetKey {
  return key in SOCIAL_PRESETS;
}
