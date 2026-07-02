import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';
import { useProfile, useProfileStats } from '../../lib/hooks/useProfile';
import { useStore } from '../../lib/store';
import { queryClient } from '../../lib/providers';
import { FOCUS_AREAS, FOCUS_AREA_MAP } from '../../lib/constants/areas';
import { colors, brand, fonts, spacing, radius, shadows } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import GradientMesh from '../../components/ui/GradientMesh';
import SettingsRow from '../../components/layout/SettingsRow';

const STAT_META = [
  { key: 'tasks',  icon: 'check-circle',           color: colors.success[400], tint: colors.success[50] },
  { key: 'streak', icon: 'local-fire-department',  color: colors.accent.sand600, tint: colors.accent.sand50 },
  { key: 'habits', icon: 'repeat',                 color: colors.accent.powder600, tint: colors.accent.powder50 },
  { key: 'days',   icon: 'calendar-today',         color: colors.primary[500], tint: colors.primary[50] },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: statsData } = useProfileStats();

  const focusAreas = useStore((s) => s.focusAreas);
  const setFocusAreas = useStore((s) => s.setFocusAreas);
  const reduceMotion = useStore((s) => s.reduceMotion);
  const setReduceMotion = useStore((s) => s.setReduceMotion);

  const [editingFocus, setEditingFocus] = useState(false);

  const stats = {
    tasks:  { value: statsData?.completedTasks ?? 0, label: 'Tasks done' },
    streak: { value: `${statsData?.streakMax ?? 0}d`, label: 'Best streak' },
    habits: { value: statsData?.habitCount ?? 0, label: 'Habits' },
    days:   { value: statsData?.daysActive ?? 1, label: 'Days active' },
  };

  const toggleArea = (key) => {
    const on = focusAreas.includes(key);
    // Keep at least one focus area so the Home hub is never empty.
    if (on && focusAreas.length === 1) return;
    const next = on ? focusAreas.filter((k) => k !== key) : [...focusAreas, key];
    setFocusAreas(next);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          queryClient.clear();
          await signOut();
          showToast.logoutConfirmed();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editIconBtn}
          hitSlop={8}
          onPress={() => router.push('/edit-profile')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <MaterialIcons name="edit" size={18} color={brand.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Identity hero ─────────────────────────────── */}
        <GradientMesh variant="hero" radius={radius['2xl']} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{profile?.initials ?? '?'}</Text>
                </View>
              </View>
              {(statsData?.streakMax ?? 0) > 0 && (
                <View style={styles.streakBadge}>
                  <MaterialIcons name="local-fire-department" size={12} color={brand.canvas} />
                  <Text style={styles.streakBadgeText}>{statsData.streakMax}</Text>
                </View>
              )}
            </View>

            <View style={styles.heroText}>
              <Text style={styles.heroName} numberOfLines={1}>{profile?.fullName ?? 'User'}</Text>
              <Text style={styles.heroEmail} numberOfLines={1}>{profile?.email ?? ''}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/edit-profile')}
          >
            <MaterialIcons name="person-outline" size={16} color={brand.ink} />
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
        </GradientMesh>

        {/* ── Stat tiles ───────────────────────────────── */}
        <View style={styles.statGrid}>
          {STAT_META.map((m) => {
            const s = stats[m.key];
            return (
              <View key={m.key} style={[styles.statCard, shadows.card]}>
                <View style={[styles.statIcon, { backgroundColor: m.tint }]}>
                  <MaterialIcons name={m.icon} size={18} color={m.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Your focus ───────────────────────────────── */}
        <View style={styles.block}>
          <View style={styles.blockHeader}>
            <View>
              <Text style={styles.blockTitle}>Your focus</Text>
              <Text style={styles.blockSub}>What shows up on your Home hub</Text>
            </View>
            <TouchableOpacity
              style={styles.editLinkBtn}
              onPress={() => setEditingFocus((v) => !v)}
              hitSlop={8}
            >
              <Text style={styles.editLink}>{editingFocus ? 'Done' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.focusCard, shadows.card]}>
            {editingFocus ? (
              <View style={styles.focusGrid}>
                {FOCUS_AREAS.map((a) => {
                  const on = focusAreas.includes(a.key);
                  return (
                    <TouchableOpacity
                      key={a.key}
                      style={[styles.focusOption, on && styles.focusOptionOn]}
                      activeOpacity={0.85}
                      onPress={() => toggleArea(a.key)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      accessibilityLabel={a.label}
                    >
                      <View style={[styles.focusOptIcon, on && styles.focusOptIconOn]}>
                        <MaterialIcons name={a.icon} size={18} color={on ? brand.canvas : brand.ink} />
                      </View>
                      <View style={styles.focusOptText}>
                        <Text style={styles.focusOptLabel}>{a.label}</Text>
                        <Text style={styles.focusOptBlurb} numberOfLines={1}>{a.blurb}</Text>
                      </View>
                      <MaterialIcons
                        name={on ? 'check-circle' : 'radio-button-unchecked'}
                        size={20}
                        color={on ? brand.sand : colors.gray[200]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.chipWrap}>
                {focusAreas.map((key) => {
                  const a = FOCUS_AREA_MAP[key];
                  if (!a) return null;
                  return (
                    <View key={key} style={styles.focusChip}>
                      <MaterialIcons name={a.icon} size={14} color={brand.ink} />
                      <Text style={styles.focusChipText}>{a.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* ── Preferences ──────────────────────────────── */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Preferences</Text>
          <View style={[styles.groupCard, shadows.card]}>
            <SettingsRow
              icon="motion-photos-off"
              iconColor={colors.accent.powder600}
              iconBg={colors.accent.powder50}
              title="Reduce motion"
              subtitle="Calmer transitions & still backgrounds"
              showChevron={false}
              rightElement={
                <Switch
                  value={reduceMotion}
                  onValueChange={setReduceMotion}
                  trackColor={{ false: colors.gray[200], true: brand.ink }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.gray[200]}
                />
              }
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="notifications"
              iconColor={colors.warning[400]}
              iconBg={colors.warning[50]}
              title="Notifications"
              subtitle="Reminders & nudges"
              onPress={() => router.push('/notification-settings')}
            />
          </View>
        </View>

        {/* ── Account ──────────────────────────────────── */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Account</Text>
          <View style={[styles.groupCard, shadows.card]}>
            <SettingsRow
              icon="manage-accounts"
              iconColor={colors.primary[500]}
              iconBg={colors.primary[50]}
              title="Personal information"
              subtitle="Name, email, password"
              onPress={() => router.push('/personal-information')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="lock"
              iconColor={colors.success[400]}
              iconBg={colors.success[50]}
              title="Privacy & security"
              subtitle="Data & terms of service"
              onPress={() => router.push('/privacy-security')}
            />
          </View>
        </View>

        {/* ── Support ──────────────────────────────────── */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Support</Text>
          <View style={[styles.groupCard, shadows.card]}>
            <SettingsRow
              icon="headset-mic"
              iconColor={colors.gray[600]}
              iconBg={colors.gray[50]}
              title="Contact support"
              subtitle="Get help from our team"
              onPress={() => router.push('/contact-support')}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon="bug-report"
              iconColor={colors.gray[600]}
              iconBg={colors.gray[50]}
              title="Report a bug"
              subtitle="Tell us what went wrong"
              onPress={() => router.push('/bug-report')}
            />
          </View>
        </View>

        {/* ── Sign out ─────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialIcons name="logout" size={18} color={colors.danger[400]} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>TaskFlow · v1.0</Text>
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
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: brand.ink,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: 140,
    gap: spacing.sectionGap,
    paddingTop: 6,
  },

  // Hero
  hero: {
    padding: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(175,210,250,0.55)',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: brand.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: brand.ink,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: brand.sand,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#182350',
  },
  streakBadgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 14,
  },
  heroText: {
    flex: 1,
  },
  heroName: {
    fontSize: 21,
    fontFamily: fonts.bold,
    color: brand.canvas,
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  heroEmail: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#C6CDE6',
    lineHeight: 18,
    marginTop: 3,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    marginTop: 18,
    backgroundColor: brand.canvas,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  editProfileText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },

  // Stats
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: brand.ink,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 16,
  },

  // Blocks
  block: { gap: 10 },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: brand.ink,
    lineHeight: 24,
    paddingLeft: 2,
  },
  blockSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
    paddingLeft: 2,
    marginTop: 1,
  },
  editLinkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.primary[50],
  },
  editLink: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
  },

  // Focus card
  focusCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 14,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg.subtle,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  focusChipText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  focusGrid: {
    gap: 8,
  },
  focusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[100],
    backgroundColor: colors.bg.card,
  },
  focusOptionOn: {
    borderColor: brand.ink,
    backgroundColor: colors.gray[25],
  },
  focusOptIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusOptIconOn: {
    backgroundColor: brand.ink,
  },
  focusOptText: { flex: 1 },
  focusOptLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: brand.ink,
    lineHeight: 20,
  },
  focusOptBlurb: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 16,
  },

  // Grouped settings
  groupCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginLeft: 60,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.danger[400] + '40',
    backgroundColor: colors.danger[50],
  },
  logoutText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.danger[400],
    lineHeight: 22,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    marginTop: -8,
  },
});
