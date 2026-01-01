// Font preset definitions for jLinks
// See docs/jlinks-font-presets.md for detailed documentation

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

export type FontPresetId = keyof typeof FONT_PRESETS;
export type FontPreset = (typeof FONT_PRESETS)[FontPresetId];

export function getFontPreset(id: FontPresetId): FontPreset {
  return FONT_PRESETS[id];
}

export function isValidFontPresetId(id: string): id is FontPresetId {
  return id in FONT_PRESETS;
}
