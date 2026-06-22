import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile, useDeleteAccount } from '../lib/hooks/useProfile';
import { colors, fonts, spacing, radius, shadows } from '../lib/theme';
import ScreenHeader from '../components/layout/ScreenHeader';
import SettingsRow from '../components/layout/SettingsRow';
import { SettingsListSkeleton } from '../components/ui/SkeletonLoader';

function formatMemberSince(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const deleteAccountMut = useDeleteAccount();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This cannot be undone. All your tasks, habits, and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccountMut.mutate(undefined, {
            onSuccess: () => router.replace('/(auth)/login'),
          }),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Personal Information" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <SettingsListSkeleton count={6} />
        ) : (
        <>
        <View style={[styles.card, shadows.card]}>
          <SettingsRow title="Photo" value={profile?.initials ?? '?'} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'photo' } })} />
          <View style={styles.divider} />
          <SettingsRow title="Full Name" value={profile?.fullName ?? ''} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'name' } })} />
          <View style={styles.divider} />
          <SettingsRow title="Email" value={profile?.email ?? ''} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'email' } })} />
          <View style={styles.divider} />
          <SettingsRow title="Username" value={profile?.username ? `@${profile.username}` : '—'} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'username' } })} />
          <View style={styles.divider} />
          <SettingsRow title="Member Since" value={formatMemberSince(profile?.memberSince)} showChevron={false} />
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={[styles.card, shadows.card]}>
          <SettingsRow
            icon="lock"
            iconBg={colors.gray[50]}
            iconColor={colors.gray[600]}
            title="Change Password"
            subtitle="Update your login password"
            onPress={() => router.push('/change-password')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="delete-forever"
            iconBg={colors.danger[50]}
            iconColor={colors.danger[400]}
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            danger
            onPress={handleDeleteAccount}
          />
        </View>
        </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 40, gap: 8 },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.md, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.gray[100], marginLeft: 16 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 4,
    paddingLeft: 4,
  },
});
