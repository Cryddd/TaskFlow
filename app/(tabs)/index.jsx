import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../../lib/store';
import { useMotion } from '../../lib/useMotion';
import { useTasks, useToggleTask, useDeleteTask, getDailyStats, getOverdueCount } from '../../lib/hooks/useTasks';
import { useHabits, useToggleHabit } from '../../lib/hooks/useHabits';
import { useNotes } from '../../lib/hooks/useNotes';
import { useGoals } from '../../lib/hooks/useGoals';
import { useProfile } from '../../lib/hooks/useProfile';
import { colors, brand, fonts, spacing, radius, shadows } from '../../lib/theme';
import { handleTaskToggle, handleTaskDelete } from '../../lib/taskHandlers';
import { showToast } from '../../lib/toast';
import GradientMesh from '../../components/ui/GradientMesh';
import HabitCard from '../../components/ui/HabitCard';
import TaskItem from '../../components/ui/TaskItem';
import SectionHeader from '../../components/ui/SectionHeader';
import WeekStrip from '../../components/ui/WeekStrip';
import MonthCalendarPicker from '../../components/ui/MonthCalendarPicker';
import NoteCard from '../../components/ui/NoteCard';

// `area` ties a chip to a focus area so the row reflects what the user picked.
// `today` has no area — it's always shown.
const CHIPS = [
  { key: 'today',  label: 'Today',  icon: 'wb-sunny',              route: null,              area: null },
  { key: 'tasks',  label: 'Tasks',  icon: 'checklist',             route: '/(tabs)/tasks',   area: 'tasks' },
  { key: 'habits', label: 'Habits', icon: 'local-fire-department', route: '/see-all-habits', area: 'habits' },
  { key: 'meals',  label: 'Meals',  icon: 'restaurant',            route: '/nutrition',      area: 'nutrition' },
];

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_R = 32;
const RING_CIRC = 2 * Math.PI * RING_R;

// cubic-bezier(0.22, 1, 0.36, 1) — calm ease-out
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function heroState(remainingTasks, overallPct) {
  if (overallPct >= 100 || remainingTasks === 0) {
    return { eyebrow: 'ALL DONE', title: "You're all caught up", sub: 'Nothing left today — nice work.' };
  }
  const eyebrow = remainingTasks <= 2 ? 'LIGHT WORKLOAD' : remainingTasks <= 5 ? 'BALANCED WORKLOAD' : 'BUSY DAY';
  return {
    eyebrow,
    title: 'Keep your day on track',
    sub: `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining today`,
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useStore();
  const focusAreas = useStore((s) => s.focusAreas);
  const { animate } = useMotion();
  const { data: tasks = [], refetch: refetchTasks } = useTasks();
  const { data: habits = [], refetch: refetchHabits } = useHabits();
  const { data: notes = [], refetch: refetchNotes } = useNotes();
  const { data: goals = [] } = useGoals();
  const { data: profile } = useProfile();
  const toggleTaskMut = useToggleTask();
  const deleteTaskMut = useDeleteTask();
  const toggleHabitMut = useToggleHabit();
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => setShowCalendar((prev) => !prev);
  const onDateSectionDoubleTap = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) toggleCalendar();
  };

  useEffect(() => {
    const overdueCount = getOverdueCount(tasks);
    if (overdueCount > 0) showToast.overdueReminder(overdueCount);
  }, []);

  const onToggleTask = (id) => handleTaskToggle(tasks, id, () => toggleTaskMut.mutate(id));
  const onDeleteTask = (id) => handleTaskDelete(id, () => deleteTaskMut.mutate(id));
  const onToggleHabit = (id) => toggleHabitMut.mutate(id);
  const goToTask = (task) => router.push(`/task/${task.id}`);
  const goToHabit = (habitId) => router.push(`/habit/${habitId}`);

  const stats = getDailyStats(tasks, habits, goals, selectedDate);

  const todayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const inProgress = todayTasks.filter((t) => t.status === 'in_progress' && !t.completed);
  const pending    = todayTasks.filter((t) => t.status === 'pending'     && !t.completed);
  const completed  = todayTasks.filter((t) => t.completed);

  const tasksPerDate = tasks.reduce((acc, t) => {
    if (t.dueDate) acc[t.dueDate] = (acc[t.dueDate] ?? 0) + 1;
    return acc;
  }, {});

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchHabits(), refetchNotes()]);
    setRefreshing(false);
  };

  const remainingTasks = Math.max(0, stats.tasks.total - stats.tasks.completed);
  const hero = heroState(remainingTasks, stats.overallPct);
  const firstName = (profile?.fullName || '').split(' ')[0] || 'there';

  // Which focus areas the user picked → drives what shows on the Home hub.
  const wants = (area) => focusAreas.includes(area);
  const visibleChips = CHIPS.filter((c) => !c.area || wants(c.area));

  // Hero entrance + ring fill choreography (skipped when motion is reduced).
  const heroIn = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) { heroIn.setValue(1); return; }
    Animated.timing(heroIn, { toValue: 1, duration: 460, useNativeDriver: true, easing: easeOut }).start();
  }, [animate]);
  useEffect(() => {
    const target = Math.min(1, Math.max(0, stats.overallPct / 100));
    if (!animate) { ringAnim.setValue(target); return; }
    Animated.timing(ringAnim, {
      toValue: target,
      duration: 850,
      delay: 150,
      useNativeDriver: false,
      easing: easeOut,
    }).start();
  }, [stats.overallPct, animate]);
  const ringDashoffset = ringAnim.interpolate({ inputRange: [0, 1], outputRange: [RING_CIRC, 0] });
  const heroStyle = {
    opacity: heroIn,
    transform: [{ translateY: heroIn.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  // ── Home hub sections (rendered in focus-area order) ──────────────
  const renderHabits = () => (
    habits.length > 0 ? (
      <View key="habits" style={styles.section}>
        <SectionHeader
          title="Habits"
          count={habits.length}
          rightElement={
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/see-all-habits')} hitSlop={8}>
                <Text style={styles.seeAllLink}>See all</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/habit-new')} hitSlop={8}>
                <MaterialIcons name="add" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
          }
        />
        <View style={styles.habitList}>
          {habits.slice(0, 4).map((h) => (
            <HabitCard key={h.id} habit={h} onPress={goToHabit} onToggle={onToggleHabit} />
          ))}
        </View>
      </View>
    ) : null
  );

  const renderTasks = () => (
    <View key="tasks" style={styles.section}>
      <SectionHeader
        title="Today's tasks"
        count={todayTasks.length}
        rightElement={
          <TouchableOpacity onPress={() => router.push('/see-all-tasks')} hitSlop={8}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        }
      />

      {inProgress.length > 0 && (
        <View style={styles.taskGroup}>
          <Text style={styles.groupLabel}>IN PROGRESS</Text>
          <View style={styles.taskList}>
            {inProgress.map((t) => (
              <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} onPress={goToTask} />
            ))}
          </View>
        </View>
      )}

      {pending.length > 0 && (
        <View style={styles.taskGroup}>
          <Text style={styles.groupLabel}>PENDING</Text>
          <View style={styles.taskList}>
            {pending.map((t) => (
              <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} onPress={goToTask} />
            ))}
          </View>
        </View>
      )}

      {completed.length > 0 && (
        <View style={styles.taskGroup}>
          <TouchableOpacity style={styles.completedToggle} onPress={() => setShowCompleted(!showCompleted)} activeOpacity={0.7}>
            <Text style={styles.completedToggleText}>
              {showCompleted ? 'Hide' : `Show ${completed.length} completed`}
            </Text>
            <MaterialIcons name={showCompleted ? 'expand-less' : 'expand-more'} size={18} color={colors.gray[400]} />
          </TouchableOpacity>
          {showCompleted && (
            <View style={styles.taskList}>
              {completed.map((t) => (
                <TaskItem key={t.id} task={t} onToggle={onToggleTask} onDelete={onDeleteTask} onPress={goToTask} />
              ))}
            </View>
          )}
        </View>
      )}

      {todayTasks.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="wb-twilight" size={44} color={colors.gray[400]} />
          <Text style={styles.emptyTitle}>Nothing due today</Text>
          <Text style={styles.emptySubtitle}>Capture a task above to get going.</Text>
        </View>
      )}
    </View>
  );

  const renderNotes = () => (
    (wants('notes') && notes.length > 0) ? (
      <View key="notes" style={[styles.section, styles.lastSection]}>
        <SectionHeader
          title="Notes"
          rightElement={
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => router.push('/see-all-notes')} hitSlop={8}>
                <Text style={styles.seeAllLink}>See all</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/note/new')} hitSlop={8}>
                <MaterialIcons name="add" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
          }
        />
        <View style={styles.notesGrid}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onPress={() => router.push(`/note/${note.id}`)} />
          ))}
        </View>
      </View>
    ) : null
  );

  const coreRenderers = { habits: renderHabits, tasks: renderTasks };
  // Habits & Tasks appear only if picked, ordered by the user's focus priority.
  const homeSections = [
    ...focusAreas.filter((a) => coreRenderers[a]).map((a) => coreRenderers[a]()),
    renderNotes(),
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Greeting header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.initials ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>{greetingFor()},</Text>
            <Text style={styles.name} numberOfLines={1}>{profile?.fullName || firstName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
          <MaterialIcons name="notifications-none" size={20} color={brand.ink} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRule} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
      >
        {/* Hero */}
        <Animated.View style={heroStyle}>
          <GradientMesh variant="hero" radius={radius['2xl']} style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={styles.heroTexts}>
                <Text style={styles.heroEyebrow}>{hero.eyebrow}</Text>
                <Text style={styles.heroTitle}>{hero.title}</Text>
                <Text style={styles.heroSub}>{hero.sub}</Text>
              </View>
              <View style={styles.heroRing}>
                <Svg width={78} height={78}>
                  <Circle cx={39} cy={39} r={RING_R} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={7} />
                  <AnimatedCircle
                    cx={39} cy={39} r={RING_R}
                    fill="none"
                    stroke={brand.powder}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={`${RING_CIRC} ${RING_CIRC}`}
                    strokeDashoffset={ringDashoffset}
                    transform="rotate(-90, 39, 39)"
                  />
                </Svg>
                <View style={styles.heroRingCenter} pointerEvents="none">
                  <Text style={styles.heroRingPct}>{stats.overallPct}%</Text>
                  <Text style={styles.heroRingLabel}>done</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroCta}
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Text style={styles.heroCtaText}>View tasks</Text>
              <MaterialIcons name="arrow-forward" size={15} color={brand.ink} />
            </TouchableOpacity>
          </GradientMesh>
        </Animated.View>

        {/* Quick capture */}
        <TouchableOpacity
          style={styles.capture}
          activeOpacity={0.9}
          onPress={() => router.push('/task-new')}
        >
          <MaterialIcons name="add" size={22} color={brand.ink} />
          <Text style={styles.capturePlaceholder}>Add a task or habit…</Text>
          <View style={styles.captureMic}>
            <MaterialIcons name="mic-none" size={20} color="#FFF7EC" />
          </View>
        </TouchableOpacity>

        {/* Quiet chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {visibleChips.map((c) => {
            const active = c.key === 'today';
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => c.route && router.push(c.route)}
              >
                <MaterialIcons name={c.icon} size={15} color={active ? brand.canvas : colors.gray[600]} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Week strip / calendar (double-tap to expand) */}
        <View style={styles.section}>
          <TapGestureHandler onHandlerStateChange={onDateSectionDoubleTap} numberOfTaps={2}>
            <View>
              {showCalendar ? (
                <MonthCalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  tasksPerDate={tasksPerDate}
                />
              ) : (
                <WeekStrip
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  tasksPerDate={tasksPerDate}
                />
              )}
            </View>
          </TapGestureHandler>
        </View>

        {/* Focus-personalized hub — sections appear and order by the user's picks */}
        {homeSections}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.app,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: brand.canvas,
  },
  greeting: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: brand.ink,
    lineHeight: 22,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRule: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginHorizontal: spacing.screenH,
  },
  scroll: {
    paddingBottom: 140,
  },
  hero: {
    marginHorizontal: spacing.screenH,
    marginTop: 18,
    padding: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroTexts: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: brand.powder,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 25,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginTop: 8,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#C6CDE6',
    lineHeight: 19,
    marginTop: 8,
  },
  heroRing: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingPct: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 22,
  },
  heroRingLabel: {
    fontSize: 9,
    fontFamily: fonts.regular,
    color: '#9FB0DC',
    lineHeight: 12,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    marginTop: 16,
    backgroundColor: brand.canvas,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  heroCtaText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  capture: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: spacing.screenH,
    marginTop: 24,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    paddingLeft: 18,
    paddingRight: 13,
    paddingVertical: 13,
    ...shadows.card,
  },
  capturePlaceholder: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[400],
  },
  captureMic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: brand.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.screenH,
    paddingTop: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg.subtle,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: brand.ink,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
  },
  chipTextActive: {
    color: brand.canvas,
  },
  section: {
    paddingHorizontal: spacing.screenH,
    marginTop: spacing.sectionGap,
  },
  lastSection: {
    marginBottom: 12,
  },
  habitList: {
    gap: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seeAllLink: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary[500],
  },
  taskGroup: {
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  taskList: {
    gap: 8,
  },
  completedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  completedToggleText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[400],
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray[400],
  },
});
