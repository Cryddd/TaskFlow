import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../../lib/theme';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getWeekDates(centerDate) {
  const d = new Date(centerDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

const fmt = (d) => d.toISOString().split('T')[0];

export default function WeekStrip({ selectedDate, onSelectDate, tasksPerDate = {} }) {
  const today = new Date();
  const centerDate = selectedDate ? new Date(selectedDate) : today;
  const weekDates = getWeekDates(centerDate);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {weekDates.map((date) => {
        const dateStr = fmt(date);
        const isToday = fmt(today) === dateStr;
        const isSelected = selectedDate === dateStr;
        const hasTasks = tasksPerDate[dateStr] > 0;

        return (
          <TouchableOpacity
            key={dateStr}
            style={styles.dayCell}
            onPress={() => onSelectDate(dateStr)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayLabel, isToday && styles.todayDayLabel]}>
              {DAY_LABELS[date.getDay()]}
            </Text>
            <View style={[styles.dateCircle, isSelected && styles.selectedCircle, isToday && styles.todayCircle]}>
              <Text style={[styles.dateNum, isSelected && styles.selectedDateNum, isToday && styles.todayDateNum]}>
                {date.getDate()}
              </Text>
            </View>
            {hasTasks && <View style={[styles.dot, isToday && styles.todayDot]} />}
            {!hasTasks && <View style={styles.dotPlaceholder} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 4,
  },
  dayCell: {
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    lineHeight: 16,
  },
  todayDayLabel: {
    color: colors.primary[500],
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    backgroundColor: colors.gray[100],
  },
  todayCircle: {
    backgroundColor: colors.primary[500],
  },
  dateNum: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 24,
  },
  selectedDateNum: {
    color: colors.gray[900],
    fontFamily: fonts.bold,
  },
  todayDateNum: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[200],
  },
  todayDot: {
    backgroundColor: colors.primary[400],
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
  },
});
