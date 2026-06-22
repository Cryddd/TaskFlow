export const colors = {
  primary: {
    50:  '#EEEDFE',
    100: '#D4D2F8',
    200: '#AFA9EC',
    400: '#7F77DD',
    500: '#6C63D1',
    600: '#534AB7',
    800: '#3C3489',
    900: '#26215C',
  },
  gray: {
    0:   '#FFFFFF',
    25:  '#F9F9FB',
    50:  '#F1F0F6',
    100: '#E4E3EE',
    200: '#C8C7D8',
    400: '#8E8DA4',
    600: '#5A5970',
    900: '#1C1B2E',
  },
  success: {
    50:  '#F0FDF4',
    400: '#22C55E',
  },
  warning: {
    50:  '#FFFBEB',
    400: '#F59E0B',
  },
  danger: {
    50:  '#FEF2F2',
    400: '#EF4444',
  },
  bg: {
    app:      '#F5F4FA',
    card:     '#FFFFFF',
    elevated: '#FFFFFF',
  },
};

export const priority = {
  urgent: '#EF4444',
  high:   '#F59E0B',
  medium: '#6C63D1',
  low:    '#22C55E',
  none:   '#C8C7D8',
};

export const priorityBg = {
  urgent: '#FEF2F2',
  high:   '#FFFBEB',
  medium: '#EEEDFE',
  low:    '#F0FDF4',
  none:   '#F1F0F6',
};

export const priorityText = {
  urgent: '#EF4444',
  high:   '#D97706',
  medium: '#534AB7',
  low:    '#16A34A',
  none:   '#8E8DA4',
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
  cardP:   16,
  sectionGap: 24,
  itemGap: 8,
};

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  pill: 999,
};

export const typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  md:   { fontSize: 17, lineHeight: 24 },
  lg:   { fontSize: 20, lineHeight: 28 },
  xl:   { fontSize: 24, lineHeight: 32 },
  '2xl':{ fontSize: 30, lineHeight: 38 },
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

export const shadows = {
  card: {
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  elevated: {
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  focus: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
};
