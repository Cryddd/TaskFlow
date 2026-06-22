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
import { useStore } from '../../lib/store';
import { useTasks, useToggleTask, useDeleteTask, getSuggestedTasks, getDailyStats, getOverdueCount } from '../../lib/hooks/useTasks';
import { useHabits } from '../../lib/hooks/useHabits';
import { useNotes } from '../../lib/hooks/useNotes';
import { useGoals } from '../../lib/hooks/useGoals';
import { useProfile } from '../../lib/hooks/useProfile';
import { colors, fonts, spacing, radius, shadows } from '../../lib/theme';
import {
  handleTaskToggle,
  handleTaskDelete,
} from '../../lib/taskHandlers';
import { showToast } from '../../lib/toast';
import DailyCommandCenter from '../../components/ui/DailyCommandCenter';
import HabitRing from '../../components/ui/HabitRing';
import TaskItem from '../../components/ui/TaskItem';
import SectionHeader from '../../components/ui/SectionHeader';
import WeekStrip from '../../components/ui/WeekStrip';
import MonthCalendarPicker from '../../components/ui/MonthCalendarPicker';
import NoteCard from '../../components/ui/NoteCard';

const fmt = (d) => d.toISOString().split('T')[0];

export default function HomeScreen() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useStore();
  const { data: tasks = [], refetch: refetchTasks, isLoading: tasksLoading } = useTasks();
  const { data: habits = [], refetch: refetchHabits } = useHabits();
  const { data: notes = [], refetch: refetchNotes } = useNotes();
  const { data: goals = [] } = useGoals();
  const { data: profile } = useProfile();
  const toggleTaskMut = useToggleTask();
  const deleteTaskMut = useDeleteTask();
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  const onDateSectionDoubleTap = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      toggleCalendar();
    }
  };

  useEffect(() => {
    const overdueCount = getOverdueCount(tasks);
    if (overdueCount > 0) {
      showToast.overdueReminder(overdueCount);
    }
  }, []);

  const onToggleTask = (id) => handleTaskToggle(tasks, id, () => toggleTaskMut.mutate(id));
  const onDeleteTask = (id) => handleTaskDelete(id, () => deleteTaskMut.mutate(id));
  const goToTask = (task) => router.push(`/task/${task.id}`);
  const goToHabit = (habitId) => router.push(`/habit/${habitId}`);

  const stats = getDailyStats(tasks, habits, goals, selectedDate);
  const suggested = getSuggestedTasks(tasks, selectedDate);

  const todayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const inProgress = todayTasks.filter((t) => t.status === 'in_progress' && !t.completed);
  const pending    = todayTasks.filter((t) => t.status === 'pending'     && !t.completed);
  const completed  = todayTasks.filter((t) => t.completed);

  const tasksPerDate = tasks.reduce((acc, t) => {
    if (t.dueDate) acc[t.dueDate] = (acc[t.dueDate] ?? 0) + 1;
    return acc;
  }, {});

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [1, 0.92], extrapolate: 'clamp' });
  const headerHeight = scrollY.interpolate({ inputRange: [0, 60], outputRange: [56, 48], extrapolate: 'clamp' });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTasks(), refetchHabits(), refetchNotes()]);
    setRefreshing(false);
  };

  const today = new Date();
  const displayDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
  const monthYear = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <Animated.View style={[styles.topBar, { height: headerHeight, opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="menu" size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthYear}</Text>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="search" size={22} color={colors.gray[900]} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.initials ?? '?'}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
      >
        {/* Week Strip / Floating Calendar */}
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

        {/* Daily Command Center */}
        <View style={styles.section}>
          <DailyCommandCenter stats={stats} />
        </View>

        {/* Smart Suggestions */}
        {suggested.length >= 1 && (
          <View style={styles.section}>
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionHeaderRow}>
                <MaterialIcons name="tips-and-updates" size={18} color={colors.gray[400]} />
                <Text style={styles.suggestionHeader}>Suggested Order</Text>
              </View>
              {suggested.map((t, i) => (
                <View key={t.id} style={styles.suggestionRow}>
                  <View style={styles.suggestionNum}>
                    <Text style={styles.suggestionNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.suggestionHint}>
                    {t.priority === 'urgent' || t.priority === 'high' ? 'High priority' : 'Quick win'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Habits */}
        <View style={styles.section}>
          <SectionHeader
            title="Habits"
            count={habits.length}
            rightElement={
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => router.push('/see-all-habits')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/habit-new')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="add" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
              </View>
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitScroll}
          >
            {habits.map((h) => (
              <HabitRing key={h.id} habit={h} onPress={() => goToHabit(h.id)} />
            ))}
          </ScrollView>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <SectionHeader
            title="Today's Tasks"
            count={todayTasks.length}
            rightElement={
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => router.push('/see-all-tasks')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="tune" size={18} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            }
          />

          {/* In Progress */}
          {inProgress.length > 0 && (
            <View style={styles.taskGroup}>
              <Text style={styles.groupLabel}>IN PROGRESS</Text>
              <View style={styles.taskList}>
                {inProgress.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onPress={goToTask}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <View style={styles.taskGroup}>
              <Text style={styles.groupLabel}>PENDING</Text>
              <View style={styles.taskList}>
                {pending.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onPress={goToTask}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Completed (collapsed) */}
          {completed.length > 0 && (
            <View style={styles.taskGroup}>
              <TouchableOpacity
                style={styles.completedToggle}
                onPress={() => setShowCompleted(!showCompleted)}
                activeOpacity={0.7}
              >
                <Text style={styles.completedToggleText}>
                  {showCompleted ? 'Hide' : `Show ${completed.length} completed`}
                </Text>
                {showCompleted
                  ? <MaterialIcons name="expand-less" size={18} color={colors.gray[400]} />
                  : <MaterialIcons name="expand-more" size={18} color={colors.gray[400]} />}
              </TouchableOpacity>
              {showCompleted && (
                <View style={styles.taskList}>
                  {completed.map((t) => (
                    <TaskItem
                      key={t.id}
                      task={t}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onPress={goToTask}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Empty state */}
          {todayTasks.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="done-all" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No tasks today.</Text>
              <Text style={styles.emptySubtitle}>Add one to get started.</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/task-new')}
              >
                <Text style={styles.emptyBtnText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader
            title="Notes"
            rightElement={
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => router.push('/see-all-notes')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.seeAllLink}>See all</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/note/new')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="add" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
              </View>
            }
          />
          <View style={styles.notesGrid}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={() => router.push(`/note/${note.id}`)}
              />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.app,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    backgroundColor: colors.bg.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  iconBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  avatarText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.primary[800],
    lineHeight: 18,
  },
  scroll: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: spacing.screenH,
    marginTop: spacing.sectionGap,
  },
  lastSection: {
    marginBottom: 24,
  },
  habitScroll: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: spacing.screenH,
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
    lineHeight: 18,
  },
  taskGroup: {
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    letterSpacing: 0.8,
    lineHeight: 16,
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
    lineHeight: 18,
  },
  suggestionCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 16,
    gap: 10,
    ...shadows.card,
  },
  suggestionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionHeader: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    fontStyle: 'italic',
    lineHeight: 18,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestionNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionNumText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.primary[500],
    lineHeight: 16,
  },
  suggestionTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[900],
    lineHeight: 18,
  },
  suggestionHint: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 24,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary[500],
    borderRadius: radius.sm,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
    lineHeight: 22,
  },
});
