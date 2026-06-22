import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';

export default function SegmentedControl({ options, value, onChange, style, equalWidth = false }) {
  const renderOption = (opt) => {
    const active = opt.value === value;
    return (
      <TouchableOpacity
        key={opt.value}
        style={[styles.pill, equalWidth && styles.equalPill, active && styles.activePill]}
        onPress={() => onChange(opt.value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
          {opt.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (equalWidth) {
    return (
      <View style={[styles.container, styles.equalContainer, style]}>
        {options.map(renderOption)}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {options.map(renderOption)}
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
  equalContainer: {
    flexDirection: 'row',
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
  equalPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activePill: {
    backgroundColor: colors.primary[500],
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
});
