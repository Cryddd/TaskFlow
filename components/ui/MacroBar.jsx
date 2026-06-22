import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';
import ProgressBar from './ProgressBar';

const MACRO_COLORS = {
  protein: '#14B8A6',
  carbs:   '#F59E0B',
  fat:     '#F97316',
};

export default function MacroBar({ label, current, target, unit, macroKey, style }) {
  const color = MACRO_COLORS[macroKey] ?? colors.primary[500];
  const progress = target > 0 ? current / target : 0;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {current}{unit}/{target}{unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, Math.round(progress * 100))}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 18,
  },
  values: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
