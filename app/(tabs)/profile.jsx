import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../../lib/store';
import { colors, fonts, spacing, radius, shadows } from '../../lib/theme';
import { showToast } from '../../lib/toast';

const SETTINGS = [
  {
    id: 'info',
    icon: 'manage-accounts',
    title: 'Personal Information',
    subtitle: 'Change name, email, password',
    color: colors.primary[500],
  },
  {
    id: 'notifs',
    icon: 'notifications',
    title: 'Notifications',
    subtitle: 'Manage notification preferences',
    color: colors.warning[400],
  },
  {
    id: 'privacy',
    icon: 'lock',
    title: 'Privacy & Security',
    subtitle: 'Terms of service',
    color: colors.success[400],
  },
  {
    id: 'support',
    icon: 'headset-mic',
    title: 'Contact Support',
    subtitle: 'Get help from our team',
    color: colors.gray[600],
  },
];

export default function ProfileScreen() {
  const { tasks, habits } = useStore();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const streakMax = habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const daysActive = 21;

  const stats = [
    { label: 'Tasks Done',  value: completedTasks },
    { label: 'Habits',      value: habits.length  },
    { label: 'Streak',      value: `${streakMax}d` },
    { label: 'Days Active', value: daysActive      },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => showToast.logoutConfirmed() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="share" size={22} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, shadows.card]}>
          <TouchableOpacity style={styles.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="edit" size={16} color={colors.gray[600]} />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>

          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>

          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <View style={[styles.settingsList, shadows.card]}>
            {SETTINGS.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.settingsRow, idx < SETTINGS.length - 1 && styles.settingsBorder]}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.color + '18' }]}>
                  <MaterialIcons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.settingsText}>
                  <Text style={styles.settingsRowTitle}>{item.title}</Text>
                  <Text style={styles.settingsRowSub}>{item.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={colors.gray[400]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <MaterialIcons name="logout" size={18} color={colors.danger[400]} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  scroll: { padding: spacing.screenH, paddingBottom: 100, gap: 20 },
  profileCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary[400],
  },
  avatarText: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.primary[800],
    lineHeight: 32,
  },
  name: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  email: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 18,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: colors.gray[100],
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.primary[500],
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
    textAlign: 'center',
  },
  settingsSection: { gap: 8 },
  settingsTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 24,
    paddingLeft: 4,
  },
  settingsList: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 52,
  },
  settingsBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: { flex: 1, gap: 2 },
  settingsRowTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 22,
  },
  settingsRowSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.danger[400],
    lineHeight: 22,
  },
});
