import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';

export default function SegmentedControl({ options, value, onChange, style }) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, active && styles.activePill]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && styles.activeLabel]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[100],
    borderRadius: radius.pill,
    padding: 3,
  },
  scroll: {
    flexDirection: 'row',
    gap: 2,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
  },
  activePill: {
    backgroundColor: colors.primary[500],
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
});
