import type { PlanType, LayoutType, BackgroundType } from './types';

export interface PlanFeatures {
  customColors: boolean;
  customFonts: boolean;
  layouts: LayoutType[];
  backgroundTypes: BackgroundType[];
  analytics: boolean;
  removeBranding: boolean;
}

export interface Plan {
  id: PlanType;
  name: string;
  maxLinks: number;
  features: PlanFeatures;
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    maxLinks: 6,
    features: {
      customColors: true,
      customFonts: false,
      layouts: ['list'],
      backgroundTypes: ['solid'],
      analytics: false,
      removeBranding: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxLinks: Infinity,
    features: {
      customColors: true,
      customFonts: true,
      layouts: ['list', 'cards', 'grid', 'premium'],
      backgroundTypes: ['solid', 'gradient', 'image'],
      analytics: true,
      removeBranding: true,
    },
  },
} as const;

/**
 * Translation key mapping for plan names.
 * Consumers can use these keys to get translated labels from their i18n system.
 */
export const PLAN_LABEL_KEYS: Record<PlanType, string> = {
  free: 'plan_free',
  pro: 'plan_pro',
} as const;

export function getPlan(planId: PlanType): Plan {
  return PLANS[planId];
}

export function canAddLink(plan: Plan, currentLinkCount: number): boolean {
  return currentLinkCount < plan.maxLinks;
}

export function hasFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
  const value = plan.features[feature];
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

export function canUseLayout(plan: Plan, layout: LayoutType): boolean {
  return plan.features.layouts.includes(layout);
}

export function canUseBackground(plan: Plan, bgType: BackgroundType): boolean {
  return plan.features.backgroundTypes.includes(bgType);
}
