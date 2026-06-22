import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fonts } from '../../lib/theme';

const CONFIGS = {
  urgent: { bg: '#FEF2F2', text: '#EF4444', label: 'Urgent' },
  high:   { bg: '#FFFBEB', text: '#D97706', label: 'High' },
  medium: { bg: '#EEEDFE', text: '#534AB7', label: 'Medium' },
  low:    { bg: '#F0FDF4', text: '#16A34A', label: 'Low' },
  none:   { bg: colors.gray[50], text: colors.gray[400], label: 'None' },
};

export default function PriorityBadge({ priority = 'none', style }) {
  const cfg = CONFIGS[priority] ?? CONFIGS.none;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, style]}>
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    lineHeight: 14,
  },
});
