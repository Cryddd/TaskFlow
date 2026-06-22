import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useHabits, useToggleHabit, useDeleteHabit, useHabitCompletions } from '../../lib/hooks/useHabits';
import { colors, fonts, spacing, radius, shadows } from '../../lib/theme';
import { handleHabitToggle } from '../../lib/taskHandlers';
import ScreenHeader from '../../components/layout/ScreenHeader';
import HabitRing from '../../components/ui/HabitRing';
import EmptyState from '../../components/ui/EmptyState';
import { HabitDetailSkeleton } from '../../components/ui/SkeletonLoader';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function buildChainFromCompletions(completions) {
  const completedDates = new Set(
    completions.filter((c) => c.completed).map((c) => c.date)
  );
  const cells = [];
  const start = new Date();
  start.setDate(start.getDate() - 83);
  for (let i = 0; i < 84; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().split('T')[0];
    cells.push(completedDates.has(ds) ? 'complete' : 'none');
  }
  return cells;
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: habits = [], isLoading } = useHabits();
  const { data: completions = [], isLoading: completionsLoading } = useHabitCompletions(id);
  const toggleHabitMut = useToggleHabit();
  const deleteHabitMut = useDeleteHabit();
  const habit = habits.find((h) => h.id === id);
  const chain = useMemo(() => buildChainFromCompletions(completions), [completions]);
  const [tooltip, setTooltip] = useState(null);

  if (isLoading || completionsLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Habit" />
        <HabitDetailSkeleton />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Habit" />
        <EmptyState
          icon="loop"
          title="Habit not found"
          subtitle="It may have been removed."
          ctaLabel="Back to Home"
          onCta={() => router.back()}
        />
      </View>
    );
  }

  const completedDays = habit.weekProgress?.filter(Boolean).length ?? 0;

  const handleDelete = () => {
    Alert.alert('Delete habit?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHabitMut.mutate(habit.id, { onSuccess: () => router.back() });
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={habit.name}
        rightElement={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/habit-new', params: { id: habit.id } })} style={styles.editBtn}>
              <MaterialIcons name="edit" size={22} color={colors.gray[600]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.editBtn}>
              <MaterialIcons name="delete" size={22} color={colors.danger[400]} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={styles.hero}
          onPress={() => handleHabitToggle(habits, habit.id, () => toggleHabitMut.mutate(habit.id))}
        >
          <HabitRing habit={habit} />
          <Text style={styles.weekStat}>{completedDays} / {habit.weekProgress?.length ?? 7} this week</Text>
        </TouchableOpacity>

        <View style={[styles.streakBanner, shadows.card]}>
          <MaterialIcons name="bolt" size={24} color={colors.warning[400]} />
          <View style={styles.streakTexts}>
            <Text style={styles.streakTitle}>🔥 {habit.streak}-day streak</Text>
            <Text style={styles.streakSub}>Best streak: {habit.bestStreak} days</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Last 12 Weeks</Text>
        <View style={styles.chainGrid}>
          {chain.map((state, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.chainCell,
                state === 'complete' && { backgroundColor: colors.primary[500] },
                state === 'partial' && { backgroundColor: colors.primary[200] },
                state === 'none' && { backgroundColor: colors.gray[100] },
              ]}
              onPress={() => setTooltip(i === tooltip ? null : i)}
            />
          ))}
        </View>
        {tooltip !== null && (
          <Text style={styles.tooltip}>
            {chain[tooltip] === 'complete' ? 'Completed' : 'No data'}
          </Text>
        )}

        {habit.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Why it matters</Text>
            <Text style={styles.description}>{habit.description}</Text>
          </View>
        ) : null}

        <View style={styles.metaSection}>
          <Text style={styles.metaLabel}>Repeat</Text>
          <Text style={styles.metaValue}>{habit.repeat}</Text>
          <Text style={styles.metaLabel}>Category</Text>
          <Text style={styles.metaValue}>{habit.category}</Text>
          <Text style={styles.metaLabel}>Difficulty</Text>
          <Text style={styles.metaValue}>{habit.difficulty}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  editBtn: { padding: 4 },
  scroll: { padding: spacing.screenH, paddingBottom: 40, gap: 20 },
  hero: { alignItems: 'center', gap: 12 },
  weekStat: { fontSize: 14, fontFamily: fonts.medium, color: colors.gray[600] },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 16,
  },
  streakTexts: { flex: 1 },
  streakTitle: { fontSize: 17, fontFamily: fonts.bold, color: colors.gray[900] },
  streakSub: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[400], marginTop: 2 },
  sectionTitle: { fontSize: 13, fontFamily: fonts.semibold, color: colors.gray[600], letterSpacing: 0.5 },
  chainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chainCell: { width: 12, height: 12, borderRadius: 2 },
  tooltip: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400] },
  descSection: { gap: 8 },
  description: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 22 },
  metaSection: { gap: 4 },
  metaLabel: { fontSize: 11, fontFamily: fonts.medium, color: colors.gray[400], marginTop: 8 },
  metaValue: { fontSize: 15, fontFamily: fonts.medium, color: colors.gray[900] },
});
