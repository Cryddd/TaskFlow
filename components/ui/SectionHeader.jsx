import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radius, spacing } from '../../lib/theme';

export default function SectionHeader({ title, count, onSeeAll, rightElement, style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {count != null && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      {rightElement ?? (
        onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  badge: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.pill,
    height: 20,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 16,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary[500],
    lineHeight: 18,
  },
});
