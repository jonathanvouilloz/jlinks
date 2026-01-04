export interface GradientPreset {
  id: string;
  name: string;
  value: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'sunset', name: 'Coucher de soleil', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'ocean', name: 'Océan', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'forest', name: 'Forêt', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'midnight', name: 'Minuit', value: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'peach', name: 'Pêche', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'lavender', name: 'Lavande', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'fire', name: 'Feu', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { id: 'sky', name: 'Ciel', value: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)' },
];

export function findGradientPreset(value: string): GradientPreset | undefined {
  return GRADIENT_PRESETS.find(preset => preset.value === value);
}
