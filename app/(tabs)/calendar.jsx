import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useTasks } from '../../lib/hooks/useTasks';
import { colors, brand, fonts, spacing, radius, shadows, priority as priorityColors } from '../../lib/theme';

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
      selectedColor: brand.powder,
      selectedTextColor: brand.ink,
    };
  }

  const agendaTasks = tasks
    .filter((t) => t.dueDate === selected)
    .sort((a, b) => (a.dueTime ?? '23:59').localeCompare(b.dueTime ?? '23:59'));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>{formatAgendaDate(selected)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Calendar card */}
        <View style={styles.calendarCard}>
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day) => setSelected(day.dateString)}
            renderArrow={(direction) =>
              direction === 'left'
                ? <MaterialIcons name="chevron-left" size={22} color={brand.ink} />
                : <MaterialIcons name="chevron-right" size={22} color={brand.ink} />
            }
            theme={{
              backgroundColor: colors.bg.card,
              calendarBackground: colors.bg.card,
              textSectionTitleColor: colors.gray[400],
              selectedDayBackgroundColor: brand.powder,
              selectedDayTextColor: brand.ink,
              todayTextColor: '#FFFFFF',
              todayBackgroundColor: brand.ink,
              dayTextColor: colors.gray[600],
              textDisabledColor: colors.gray[200],
              dotColor: brand.ink,
              selectedDotColor: brand.ink,
              arrowColor: brand.ink,
              monthTextColor: brand.ink,
              indicatorColor: brand.ink,
              textDayFontFamily: fonts.semibold,
              textMonthFontFamily: fonts.bold,
              textDayHeaderFontFamily: fonts.medium,
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 11,
            }}
          />
        </View>

        {/* Agenda */}
        <View style={styles.agenda}>
          <View style={styles.agendaHead}>
            <Text style={styles.agendaTitle}>Schedule</Text>
            {agendaTasks.length > 0 && (
              <View style={styles.countPill}>
                <Text style={styles.countText}>{agendaTasks.length}</Text>
              </View>
            )}
          </View>

          {agendaTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={44} color={colors.gray[400]} />
              <Text style={styles.emptyTitle}>Nothing scheduled</Text>
              <Text style={styles.emptySub}>Enjoy the open day.</Text>
            </View>
          ) : (
            <View style={styles.agendaList}>
              {agendaTasks.map((task) => {
                const color = priorityColors[task.priority] ?? priorityColors.none;
                return (
                  <View key={task.id} style={styles.agendaItem}>
                    <Text style={styles.timeText}>{task.dueTime ?? '—'}</Text>
                    <View style={styles.agendaCard}>
                      <View style={[styles.priorityDot, { backgroundColor: color }]} />
                      <View style={styles.agendaBody}>
                        <Text style={[styles.agendaItemTitle, task.completed && styles.agendaItemDone]} numberOfLines={2}>
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
  header: {
    paddingHorizontal: spacing.screenH,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: brand.ink,
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginTop: 2,
  },
  scroll: { paddingBottom: 150 },
  calendarCard: {
    marginHorizontal: spacing.screenH,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    paddingVertical: 8,
    paddingHorizontal: 6,
    overflow: 'hidden',
    ...shadows.card,
  },
  agenda: {
    paddingHorizontal: spacing.screenH,
    marginTop: 28,
    gap: 14,
  },
  agendaHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  agendaTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
  },
  agendaList: { gap: 10 },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeText: {
    width: 42,
    paddingTop: 16,
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    textAlign: 'right',
  },
  agendaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.card,
  },
  priorityDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 6,
  },
  agendaBody: { flex: 1, gap: 6 },
  agendaItemTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: brand.ink,
    lineHeight: 21,
  },
  agendaItemDone: {
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  tagsRow: { flexDirection: 'row', gap: 5 },
  tag: {
    backgroundColor: colors.accent.powder50,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.accent.powder600,
    lineHeight: 14,
  },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: fonts.semibold, color: colors.gray[600] },
  emptySub: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[400] },
});
