import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, shadows } from '../../lib/theme';

const CATEGORIES = [
  {
    id: 'work',
    name: 'Work & Productivity',
    count: '240 templates',
    icon: 'work',
    gradient: ['#334155', '#0F172A'],
  },
  {
    id: 'fitness',
    name: 'Fitness & Health',
    count: '180 templates',
    icon: 'fitness-center',
    gradient: ['#0D9488', '#065F46'],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    count: '120 templates',
    icon: 'self-improvement',
    gradient: ['#6C63D1', '#26215C'],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    count: '95 templates',
    icon: 'restaurant',
    gradient: ['#16A34A', '#14532D'],
  },
];

const COMMUNITY = [
  { id: 'u1', name: 'Alex Chen',    initials: 'AC', tasks: 142, habits: 8, color: '#6C63D1' },
  { id: 'u2', name: 'Maria G.',     initials: 'MG', tasks: 98,  habits: 5, color: '#14B8A6' },
  { id: 'u3', name: 'James Park',   initials: 'JP', tasks: 217, habits: 12, color: '#F59E0B' },
  { id: 'u4', name: 'Sara L.',      initials: 'SL', tasks: 76,  habits: 6, color: '#22C55E' },
];

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Discover</Text>
        <View style={styles.bellWrapper}>
          <MaterialIcons name="notifications-active" size={22} color={colors.gray[600]} />
          <View style={styles.bellDot} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.padH}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color={colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search templates, habits, routines…"
              placeholderTextColor={colors.gray[400]}
            />
            <MaterialIcons name="mic" size={18} color={colors.gray[400]} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.catCard} activeOpacity={0.85}>
                <View style={[styles.catGradient, { backgroundColor: cat.gradient[0] }]}>
                  <View style={styles.catIconRow}>
                    <MaterialIcons name={cat.icon} size={28} color={colors.gray[0]} />
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catCount}>{cat.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community</Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.communityRow}>
            {COMMUNITY.map((user) => (
              <View key={user.id} style={styles.communityCard}>
                <View style={[styles.communityAvatar, { backgroundColor: user.color + '22', borderColor: user.color }]}>
                  <Text style={[styles.communityInitials, { color: user.color }]}>{user.initials}</Text>
                </View>
                <Text style={styles.communityName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.communityStats}>{user.tasks} tasks · {user.habits} habits</Text>
                <TouchableOpacity style={styles.followBtn}>
                  <MaterialIcons name="group" size={12} color={colors.primary[500]} />
                  <Text style={styles.followBtnText}>Follow</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.app },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    height: 56,
    backgroundColor: colors.bg.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  screenTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  bellWrapper: { position: 'relative' },
  bellDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger[400],
    borderWidth: 1.5,
    borderColor: colors.bg.elevated,
  },
  scroll: { paddingBottom: 100 },
  padH: { paddingHorizontal: spacing.screenH },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.gray[50],
    borderRadius: radius.md,
    height: 46,
    paddingHorizontal: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: spacing.screenH,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary[500],
    lineHeight: 18,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
    width: '48%',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  catGradient: {
    padding: 16,
    gap: 6,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  catIconRow: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  catName: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.gray[0],
    lineHeight: 22,
  },
  catCount: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  communityRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: spacing.screenH,
  },
  communityCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    width: 110,
    gap: 6,
    ...shadows.card,
  },
  communityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  communityInitials: {
    fontSize: 14,
    fontFamily: fonts.bold,
    lineHeight: 18,
  },
  communityName: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    textAlign: 'center',
    lineHeight: 17,
  },
  communityStats: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 16,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  followBtnText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 14,
  },
});
