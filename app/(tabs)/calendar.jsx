import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useTasks } from '../../lib/hooks/useTasks';
import { colors, fonts, spacing, radius, shadows, priority as priorityColors } from '../../lib/theme';

const fmt = (d) => d.toISOString().split('T')[0];
const today = fmt(new Date());

function formatAgendaDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function CalendarScreen() {
  const { data: tasks = [] } = useTasks();
  const [selected, setSelected] = useState(today);
  const [viewMode, setViewMode] = useState('month');

  const markedDates = tasks.reduce((acc, t) => {
    if (!t.dueDate) return acc;
    const existing = acc[t.dueDate] ?? { dots: [] };
    const color = priorityColors[t.priority] ?? priorityColors.none;
    existing.dots = [...(existing.dots ?? []), { color }].slice(0, 3);
    acc[t.dueDate] = existing;
    return acc;
  }, {});

  if (selected) {
    markedDates[selected] = {
      ...(markedDates[selected] ?? {}),
      selected: true,
      selectedColor: 'transparent',
      selectedTextColor: colors.gray[900],
    };
  }

  const agendaTasks = tasks
    .filter((t) => t.dueDate === selected)
    .sort((a, b) => (a.dueTime ?? '23:59').localeCompare(b.dueTime ?? '23:59'));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Calendar</Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'month' ? 'agenda' : 'month')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {viewMode === 'month'
            ? <MaterialIcons name="view-agenda" size={20} color={colors.gray[600]} />
            : <MaterialIcons name="calendar-view-month" size={20} color={colors.gray[600]} />
          }
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Calendar */}
        <View style={styles.calendarWrapper}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day) => setSelected(day.dateString)}
            renderArrow={(direction) =>
              direction === 'left'
                ? <MaterialIcons name="chevron-left" size={20} color={colors.gray[600]} />
                : <MaterialIcons name="chevron-right" size={20} color={colors.gray[600]} />
            }
            theme={{
              backgroundColor: colors.bg.card,
              calendarBackground: colors.bg.card,
              textSectionTitleColor: colors.gray[400],
              selectedDayBackgroundColor: colors.primary[500],
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#FFFFFF',
              todayBackgroundColor: colors.primary[500],
              dayTextColor: colors.gray[600],
              textDisabledColor: colors.gray[200],
              dotColor: colors.primary[500],
              selectedDotColor: '#FFFFFF',
              arrowColor: colors.gray[600],
              monthTextColor: colors.gray[900],
              indicatorColor: colors.primary[500],
              textDayFontFamily: fonts.semibold,
              textMonthFontFamily: fonts.bold,
              textDayHeaderFontFamily: fonts.medium,
              textDayFontSize: 13,
              textMonthFontSize: 17,
              textDayHeaderFontSize: 11,
            }}
          />
        </View>

        {/* Agenda */}
        <View style={styles.agenda}>
          <Text style={styles.agendaDate}>{formatAgendaDate(selected)}</Text>

          {agendaTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="calendar-today" size={48} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>No tasks for this day.</Text>
            </View>
          ) : (
            <View style={styles.agendaList}>
              {agendaTasks.map((task) => {
                const color = priorityColors[task.priority] ?? priorityColors.none;
                return (
                  <View key={task.id} style={styles.agendaItem}>
                    <View style={styles.timeCol}>
                      <Text style={styles.timeText}>{task.dueTime ?? '—'}</Text>
                    </View>
                    <View style={[styles.agendaCard, { borderLeftColor: color }]}>
                      <Text style={[styles.agendaTitle, task.completed && styles.agendaTitleDone]} numberOfLines={2}>
                        {task.title}
                      </Text>
                      {task.tags?.length > 0 && (
                        <View style={styles.tagsRow}>
                          {task.tags.slice(0, 2).map((tag) => (
                            <View key={tag} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
  viewToggle: { padding: 4 },
  calendarWrapper: {
    backgroundColor: colors.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  agenda: {
    padding: spacing.screenH,
    gap: 16,
    paddingBottom: 100,
  },
  agendaDate: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 24,
  },
  agendaList: { gap: 8 },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeCol: {
    width: 40,
    paddingTop: 14,
  },
  timeText: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
    textAlign: 'right',
  },
  agendaCard: {
    flex: 1,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: 12,
    gap: 4,
    ...shadows.card,
  },
  agendaTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 22,
  },
  agendaTitleDone: {
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  tagsRow: { flexDirection: 'row', gap: 4 },
  tag: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.primary[800],
    lineHeight: 14,
  },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[400], lineHeight: 22 },
});
