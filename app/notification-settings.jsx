import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettings, useUpdateNotificationSettings } from '../lib/hooks/useProfile';
import { colors, fonts, spacing, radius, shadows } from '../lib/theme';
import ScreenHeader from '../components/layout/ScreenHeader';
import SettingsRow from '../components/layout/SettingsRow';
import { SettingsListSkeleton } from '../components/ui/SkeletonLoader';

const DEFAULTS = {
  enabled: true,
  taskReminders: true,
  overdueTasks: true,
  habitReminders: true,
  streakMilestones: true,
  weeklyDebrief: true,
  defaultReminderTime: '08:00',
};

function parseTime(timeStr) {
  const [h, m] = (timeStr ?? '08:00').split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function NotificationSettingsScreen() {
  const { data: settings, isLoading } = useSettings();
  const updateMut = useUpdateNotificationSettings();
  const notificationSettings = settings?.notificationSettings ?? DEFAULTS;
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState(parseTime(notificationSettings.defaultReminderTime));
  const dimmed = !notificationSettings.enabled;

  useEffect(() => {
    setTime(parseTime(notificationSettings.defaultReminderTime));
  }, [notificationSettings.defaultReminderTime]);

  const toggle = (key) => (value) => {
    updateMut.mutate({ ...notificationSettings, [key]: value });
  };

  const toggles = [
    { key: 'taskReminders', title: 'Task Reminders', subtitle: 'Alerts for scheduled tasks' },
    { key: 'overdueTasks', title: 'Overdue Tasks', subtitle: 'Daily summary of past-due items' },
    { key: 'habitReminders', title: 'Habit Reminders', subtitle: 'Reminders for your daily habits' },
    { key: 'streakMilestones', title: 'Streak Milestones', subtitle: 'When you hit 7, 14, or 30-day streaks' },
    { key: 'weeklyDebrief', title: 'Weekly Debrief', subtitle: 'Sunday evening summary of your week' },
  ];

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <SettingsListSkeleton count={7} />
        ) : (
        <>
        <View style={[styles.card, shadows.card]}>
          <View style={styles.masterRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
              <MaterialIcons name="notifications" size={18} color={colors.primary[500]} />
            </View>
            <View style={styles.masterTexts}>
              <Text style={styles.masterTitle}>Allow Notifications</Text>
              <Text style={styles.masterSub}>Enable to receive reminders and alerts</Text>
            </View>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={toggle('enabled')}
              trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
              thumbColor={notificationSettings.enabled ? colors.primary[500] : colors.gray[0]}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>NOTIFY ME ABOUT</Text>
        <View style={[styles.card, shadows.card, dimmed && styles.dimmed]}>
          {toggles.map((item, idx) => (
            <View key={item.key}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTexts}>
                  <Text style={styles.toggleTitle}>{item.title}</Text>
                  <Text style={styles.toggleSub}>{item.subtitle}</Text>
                </View>
                <Switch
                  value={notificationSettings[item.key]}
                  onValueChange={toggle(item.key)}
                  disabled={dimmed}
                  trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
                  thumbColor={notificationSettings[item.key] ? colors.primary[500] : colors.gray[0]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>DEFAULT REMINDER TIME</Text>
        <View style={[styles.card, shadows.card, dimmed && styles.dimmed]}>
          <SettingsRow
            icon="schedule"
            title="Reminder Time"
            value={formatTime(time)}
            onPress={dimmed ? undefined : () => setShowPicker(true)}
            showChevron={false}
          />
        </View>

        {showPicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowPicker(Platform.OS === 'ios');
              if (selected) {
                setTime(selected);
                const hh = String(selected.getHours()).padStart(2, '0');
                const mm = String(selected.getMinutes()).padStart(2, '0');
                updateMut.mutate({ ...notificationSettings, defaultReminderTime: `${hh}:${mm}` });
              }
            }}
          />
        )}
        </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40 },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.md, overflow: 'hidden', marginBottom: 8 },
  dimmed: { opacity: 0.4 },
  masterRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  masterTexts: { flex: 1, gap: 2 },
  masterTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.gray[900] },
  masterSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400] },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, minHeight: 52 },
  toggleTexts: { flex: 1, gap: 2 },
  toggleTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.gray[900] },
  toggleSub: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400] },
  divider: { height: 1, backgroundColor: colors.gray[100], marginLeft: 16 },
});
