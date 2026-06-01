import { useThemeStore } from '../store/theme';
//escuro
export const DarkColors = {
  deepBlack:   '#050816',
  spaceBlue:   '#3B82F6',
  neonGreen:   '#22C55E',
  softWhite:   '#EAF2FF',
  premiumGray: '#9AA4B2',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassFill:   'rgba(255,255,255,0.06)',
  glowBlue:    'rgba(59,130,246,0.35)',
  glowGreen:   'rgba(34,197,94,0.28)',
  danger:      '#EF4444',
  warning:     '#F59E0B',

  cardBg:       'rgba(255,255,255,0.04)',
  cardBorder:   'rgba(255,255,255,0.10)',
  inputBg:      'rgba(255,255,255,0.06)',
  inputBorder:  'rgba(255,255,255,0.12)',
  overlayBg:    'rgba(0,0,0,0.75)',
  modalBg:      '#0D1526',
  divider:      'rgba(255,255,255,0.08)',
} as const;

//claro
export const LightColors = {
  deepBlack:   '#F0F4FF',        // fundo principal — azul bem claro
  spaceBlue:   '#2563EB',        // azul primário — mais escuro para contraste
  neonGreen:   '#16A34A',        // verde — mais escuro para contraste
  softWhite:   '#0F172A',        // texto principal — quase preto
  premiumGray: '#475569',        // texto secundário — cinza médio
  glassBorder: 'rgba(0,0,0,0.10)',
  glassFill:   'rgba(0,0,0,0.04)',
  glowBlue:    'rgba(37,99,235,0.20)',
  glowGreen:   'rgba(22,163,74,0.15)',
  danger:      '#DC2626',
  warning:     '#D97706',

  // Extras
  cardBg:       'rgba(255,255,255,0.80)',
  cardBorder:   'rgba(0,0,0,0.08)',
  inputBg:      'rgba(255,255,255,0.90)',
  inputBorder:  'rgba(0,0,0,0.15)',
  overlayBg:    'rgba(0,0,0,0.50)',
  modalBg:      '#FFFFFF',
  divider:      'rgba(0,0,0,0.08)',
} as const;

export type OrbitColorPalette = typeof DarkColors;
export type OrbitColorName    = keyof OrbitColorPalette;


export function useColors(): OrbitColorPalette {
  const mode = useThemeStore((s) => s.mode);
  return mode === 'dark' ? DarkColors : LightColors;
}

export const OrbitColors = DarkColors;