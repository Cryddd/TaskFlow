import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius, shadows } from '../../lib/theme';

export default function MonthCalendarPicker({
  selectedDate,
  onSelectDate,
  tasksPerDate = {},
}) {
  const markedDates = Object.entries(tasksPerDate).reduce((acc, [date, count]) => {
    if (count > 0) {
      acc[date] = { marked: true, dotColor: colors.primary[400] };
    }
    return acc;
  }, {});

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] ?? {}),
      selected: true,
      selectedColor: colors.primary[500],
    };
  }

  return (
    <View style={styles.wrapper}>
      <Calendar
        current={selectedDate}
        markedDates={markedDates}
        onDayPress={(day) => onSelectDate(day.dateString)}
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
          todayTextColor: colors.primary[500],
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
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
});
