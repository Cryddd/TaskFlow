import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useHabits } from '../lib/hooks/useHabits';
import { colors, fonts, spacing, radius, shadows } from '../lib/theme';
import { useScreenLoading } from '../lib/useScreenLoading';
import ScreenHeader from '../components/layout/ScreenHeader';
import EmptyState from '../components/ui/EmptyState';
import { HabitListSkeleton } from '../components/ui/SkeletonLoader';

export default function SeeAllHabitsScreen() {
  const router = useRouter();
  const loading = useScreenLoading();
  const { data: habits = [], isLoading } = useHabits();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="All Habits" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading || isLoading ? (
          <HabitListSkeleton count={5} />
        ) : habits.length === 0 ? (
          <EmptyState
            icon="loop"
            title="No habits yet. Start building a routine."
            ctaLabel="Add Habit"
            onCta={() => router.push('/habit-new')}
          />
        ) : (
          <View style={styles.list}>
            {habits.map((habit) => {
              const completedDays = habit.weekProgress?.filter(Boolean).length ?? 0;
              const total = habit.weekProgress?.length ?? 7;
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.row, shadows.card]}
                  onPress={() => router.push(`/habit/${habit.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.miniRing, { borderColor: habit.color }]}>
                    <Text style={styles.miniIcon}>{habit.icon}</Text>
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.name}>{habit.name}</Text>
                    <Text style={styles.sub}>{completedDays}/{total} this week · 🔥 {habit.streak}d</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.gray[200]} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 14,
  },
  miniRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[0],
  },
  miniIcon: { fontSize: 18 },
  rowText: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: fonts.semibold, color: colors.gray[900] },
  sub: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400] },
});
