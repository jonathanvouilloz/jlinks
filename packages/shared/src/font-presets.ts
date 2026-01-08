// Font preset definitions for Noko
// See docs/noko-font-presets.md for detailed documentation

export const FONT_PRESETS = {
  'modern-pro': {
    id: 'modern-pro',
    name: 'Modern Pro',
    description: 'Passe-partout, professionnel',
    fontTitle: 'Manrope',
    fontBody: 'Inter',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&family=Inter:wght@400;500&display=swap',
  },
  'tech-minimal': {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    description: 'Startup, développeur',
    fontTitle: 'Space Grotesk',
    fontBody: 'Space Grotesk',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap',
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Luxe accessible, raffiné',
    fontTitle: 'Playfair Display',
    fontBody: 'DM Sans',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap',
  },
  friendly: {
    id: 'friendly',
    name: 'Friendly',
    description: 'Chaleureux, accessible',
    fontTitle: 'Nunito',
    fontBody: 'Nunito',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;700;800&display=swap',
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    description: 'Créatif, portfolio',
    fontTitle: 'Instrument Serif',
    fontBody: 'Instrument Sans',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Instrument+Sans:wght@400;500&display=swap',
  },
  clean: {
    id: 'clean',
    name: 'Clean',
    description: 'Corporate léger, minimaliste',
    fontTitle: 'DM Sans',
    fontBody: 'DM Sans',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Artiste, événement',
    fontTitle: 'Syne',
    fontBody: 'Barlow',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Barlow:wght@400;500&display=swap',
  },
  soft: {
    id: 'soft',
    name: 'Soft',
    description: 'Wellness, santé',
    fontTitle: 'Plus Jakarta Sans',
    fontBody: 'Plus Jakarta Sans',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Consultant, avocat',
    fontTitle: 'Libre Baskerville',
    fontBody: 'Karla',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Karla:wght@400;500&display=swap',
  },
  geometric: {
    id: 'geometric',
    name: 'Geometric',
    description: 'Mode, design',
    fontTitle: 'Outfit',
    fontBody: 'Outfit',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
  },
} as const;

/**
 * Translation key mapping for font preset names.
 * Consumers can use these keys to get translated labels from their i18n system.
 */
export const FONT_PRESET_NAME_KEYS: Record<keyof typeof FONT_PRESETS, string> = {
  'modern-pro': 'font_preset_modern_pro',
  'tech-minimal': 'font_preset_tech_minimal',
  elegant: 'font_preset_elegant',
  friendly: 'font_preset_friendly',
  editorial: 'font_preset_editorial',
  clean: 'font_preset_clean',
  bold: 'font_preset_bold',
  soft: 'font_preset_soft',
  classic: 'font_preset_classic',
  geometric: 'font_preset_geometric',
} as const;

/**
 * Translation key mapping for font preset descriptions.
 * Consumers can use these keys to get translated descriptions from their i18n system.
 */
export const FONT_PRESET_DESC_KEYS: Record<keyof typeof FONT_PRESETS, string> = {
  'modern-pro': 'font_preset_modern_pro_desc',
  'tech-minimal': 'font_preset_tech_minimal_desc',
  elegant: 'font_preset_elegant_desc',
  friendly: 'font_preset_friendly_desc',
  editorial: 'font_preset_editorial_desc',
  clean: 'font_preset_clean_desc',
  bold: 'font_preset_bold_desc',
  soft: 'font_preset_soft_desc',
  classic: 'font_preset_classic_desc',
  geometric: 'font_preset_geometric_desc',
} as const;

export type FontPresetId = keyof typeof FONT_PRESETS;
export type FontPreset = (typeof FONT_PRESETS)[FontPresetId];

export function getFontPreset(id: FontPresetId): FontPreset {
  return FONT_PRESETS[id];
}

export function isValidFontPresetId(id: string): id is FontPresetId {
  return id in FONT_PRESETS;
}
