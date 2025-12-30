import type { SocialPresetKey } from './types';

export interface SocialPreset {
  icon: string;
  label: string;
  bgColor: string;
  textColor: string;
  urlPattern?: RegExp;
}

export const SOCIAL_PRESETS: Record<SocialPresetKey, SocialPreset> = {
  instagram: {
    icon: 'instagram',
    label: 'Instagram',
    bgColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    textColor: '#ffffff',
    urlPattern: /instagram\.com/i,
  },
  youtube: {
    icon: 'youtube',
    label: 'YouTube',
    bgColor: '#FF0000',
    textColor: '#ffffff',
    urlPattern: /youtube\.com|youtu\.be/i,
  },
  linkedin: {
    icon: 'linkedin',
    label: 'LinkedIn',
    bgColor: '#0A66C2',
    textColor: '#ffffff',
    urlPattern: /linkedin\.com/i,
  },
  x: {
    icon: 'twitter',
    label: 'X (Twitter)',
    bgColor: '#000000',
    textColor: '#ffffff',
    urlPattern: /twitter\.com|x\.com/i,
  },
  tiktok: {
    icon: 'music',
    label: 'TikTok',
    bgColor: '#000000',
    textColor: '#ffffff',
    urlPattern: /tiktok\.com/i,
  },
  facebook: {
    icon: 'facebook',
    label: 'Facebook',
    bgColor: '#1877F2',
    textColor: '#ffffff',
    urlPattern: /facebook\.com|fb\.com/i,
  },
  github: {
    icon: 'github',
    label: 'GitHub',
    bgColor: '#181717',
    textColor: '#ffffff',
    urlPattern: /github\.com/i,
  },
  email: {
    icon: 'mail',
    label: 'Email',
    bgColor: '#EA4335',
    textColor: '#ffffff',
    urlPattern: /^mailto:/i,
  },
  whatsapp: {
    icon: 'message-circle',
    label: 'WhatsApp',
    bgColor: '#25D366',
    textColor: '#ffffff',
    urlPattern: /wa\.me|whatsapp\.com/i,
  },
  website: {
    icon: 'globe',
    label: 'Website',
    bgColor: '#6366F1',
    textColor: '#ffffff',
  },
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
