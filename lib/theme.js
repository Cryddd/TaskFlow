// TaskFlow design tokens — "GoMart-style" light premium-minimal theme.
// Palette: Floral White canvas, Deep Blue ink, Powder Blue + Pale Brown accents.
// Key names are kept backward-compatible (primary/gray/bg/...) so existing
// screens keep compiling while we migrate. New semantic tokens live alongside.

// ── Brand anchors ────────────────────────────────────────────────
export const brand = {
  ink:    '#182350', // Deep Blue — primary text, buttons, nav pill, active states
  canvas: '#FEFAEF', // Floral White — app background
  powder: '#AFD2FA', // Powder Blue — cool accent (progress, highlights)
  sand:   '#B9915E', // Pale Brown — the one warm accent pop (capture, streaks, CTA)
};

export const colors = {
  // `primary` ramp is built around the Deep Blue ink.
  primary: {
    50:  '#EAEDF6',
    100: '#D5DAEC',
    200: '#AEB7D6',
    400: '#46527F',
    500: '#182350', // ink / primary action
    600: '#131C42',
    800: '#0E1532',
    900: '#0A0F26',
  },
  // Warm-tinted neutral ramp so grays sit naturally on the floral-white canvas.
  // gray[900] is the Deep Blue ink so all primary text reads on-brand.
  gray: {
    0:   '#FFFFFF', // cards / elevated surfaces
    25:  '#FBF8EF', // barely-off canvas
    50:  '#F4EFE1', // chip / subtle fill
    100: '#ECE6D6', // hairline borders / tracks
    200: '#D9D3C2', // stronger borders
    400: '#9A95A8', // muted text / placeholders
    600: '#5A5E72', // secondary text
    900: '#182350', // primary text (ink)
  },
  success: {
    50:  '#E6F5EC',
    400: '#2BA86B',
  },
  warning: {
    50:  '#F8EFD9',
    400: '#D98A2B',
  },
  danger: {
    50:  '#FCEAEA',
    400: '#E5484D',
  },
  // Sparing accents — use deliberately, not everywhere.
  accent: {
    powder:   '#AFD2FA',
    powder50: '#EAF2FC',
    powder600:'#5B8DD6',
    sand:     '#B9915E',
    sand50:   '#F3EADD',
    sand600:  '#9A7647',
  },
  bg: {
    app:      '#FEFAEF', // floral white canvas
    card:     '#FFFFFF',
    elevated: '#FFFFFF',
    subtle:   '#F4EFE1', // warm subtle fill (chips, inset rows)
  },
};

// Convenience semantic aliases (preferred for new code).
export const ink         = brand.ink;
export const canvas      = brand.canvas;
export const surface     = colors.bg.card;
export const hairline    = colors.gray[100];
export const textPrimary   = colors.gray[900];
export const textSecondary = colors.gray[600];
export const textMuted     = colors.gray[400];

export const priority = {
  urgent: '#E5484D',
  high:   '#D98A2B',
  medium: '#5B6BA6',
  low:    '#2BA86B',
  none:   '#B4AE9D',
};

export const priorityBg = {
  urgent: '#FCEAEA',
  high:   '#F8EFD9',
  medium: '#E9ECF6',
  low:    '#E4F4EC',
  none:   '#F1ECDD',
};

export const priorityText = {
  urgent: '#C13338',
  high:   '#9A6516',
  medium: '#2E3A6B',
  low:    '#1B7A4C',
  none:   '#6E6A5C',
};

export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  screenH: 20,
  cardP:   18,
  sectionGap: 28, // airier rhythm to match the reference
  itemGap: 10,
};

export const radius = {
  sm:    10,
  md:    14,
  lg:    20,
  xl:    26,
  '2xl': 32,
  pill:  999,
};

export const typography = {
  xs:    { fontSize: 11, lineHeight: 16 },
  sm:    { fontSize: 13, lineHeight: 18 },
  base:  { fontSize: 15, lineHeight: 22 },
  md:    { fontSize: 17, lineHeight: 24 },
  lg:    { fontSize: 20, lineHeight: 28 },
  xl:    { fontSize: 24, lineHeight: 32 },
  '2xl': { fontSize: 30, lineHeight: 38 },
  '3xl': { fontSize: 34, lineHeight: 40 }, // big GoMart-style headline
  '4xl': { fontSize: 40, lineHeight: 46 },
};

export const fontWeights = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
};

export const fonts = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
};

// Soft shadows (GoMart uses gentle elevation, not hairline borders).
export const shadows = {
  card: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  elevated: {
    shadowColor: brand.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 26,
    elevation: 4,
  },
  // Strong floating shadow for the nav pill / FAB-like accents.
  floating: {
    shadowColor: '#0C1230',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  // Subtle hairline-only separation when shadow isn't wanted.
  hairline: {
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  focus: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
};

// Shared motion tokens — calm, premium easing (Apple-like). Reused across
// Reanimated / Animated transitions so choreography stays consistent.
export const motion = {
  durFast: 180,
  durBase: 280,
  durSlow: 440,
  // standard ease-out cubic-bezier(0.22, 1, 0.36, 1)
  easeOut: [0.22, 1, 0.36, 1],
  // gentle settle with the tiniest overshoot for celebrations
  settle:  [0.34, 1.4, 0.64, 1],
};
