import { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Image, TextInput,
  TouchableOpacity, Modal, Animated, Easing, ActivityIndicator, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfile, useDeleteAccount } from '../lib/hooks/useProfile';
import { useMotion } from '../lib/useMotion';
import { exportUserData } from '../lib/exportData';
import { showToast } from '../lib/toast';
import { colors, brand, fonts, spacing, radius, shadows } from '../lib/theme';
import ScreenHeader from '../components/layout/ScreenHeader';
import SettingsRow from '../components/layout/SettingsRow';
import { SettingsListSkeleton } from '../components/ui/SkeletonLoader';

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const CONFIRM_WORD = 'DELETE';

function formatMemberSince(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const deleteAccountMut = useDeleteAccount();
  const { animate } = useMotion();

  const [exporting, setExporting] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Entrance
  const intro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) { intro.setValue(1); return; }
    Animated.timing(intro, { toValue: 1, duration: 300, delay: 40, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [animate]);
  const introStyle = {
    opacity: intro,
    transform: [{ translateY: animate ? intro.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) : 0 }],
  };

  // Delete modal motion
  const modalAnim = useRef(new Animated.Value(0)).current;
  const openDelete = () => {
    setConfirmText('');
    setDelOpen(true);
    if (!animate) { modalAnim.setValue(1); return; }
    modalAnim.setValue(0);
    Animated.timing(modalAnim, { toValue: 1, duration: 200, easing: EASE_OUT, useNativeDriver: true }).start();
  };
  const closeDelete = () => {
    if (!animate) { setDelOpen(false); return; }
    Animated.timing(modalAnim, { toValue: 0, duration: 150, easing: EASE_OUT, useNativeDriver: true })
      .start(() => setDelOpen(false));
  };

  const onExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await exportUserData();
      if (!res.shared) showToast.dataExported();
    } catch {
      showToast.exportFailed();
    } finally {
      setExporting(false);
    }
  };

  const confirmMatches = confirmText.trim().toUpperCase() === CONFIRM_WORD;
  const deleting = deleteAccountMut.isPending;

  const onConfirmDelete = () => {
    if (!confirmMatches || deleting) return;
    deleteAccountMut.mutate(undefined, {
      onSuccess: () => {
        setDelOpen(false);
        showToast.accountDeleted();
        router.replace('/(auth)/login');
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Personal information" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <SettingsListSkeleton count={6} />
        ) : (
          <Animated.View style={introStyle}>
            {/* Identity strip */}
            <View style={[styles.identity, shadows.card]}>
              <View style={styles.avatar}>
                {profile?.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitials}>{profile?.initials ?? '?'}</Text>
                )}
              </View>
              <View style={styles.identityText}>
                <Text style={styles.identityName} numberOfLines={1}>{profile?.fullName ?? 'User'}</Text>
                <Text style={styles.identitySub} numberOfLines={1}>{profile?.email ?? ''}</Text>
                <Text style={styles.identityMeta}>Member since {formatMemberSince(profile?.memberSince)}</Text>
              </View>
            </View>

            {/* Profile */}
            <Text style={styles.sectionLabel}>Profile</Text>
            <View style={[styles.card, shadows.card]}>
              <SettingsRow title="Photo" value={profile?.initials ?? '?'} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'photo' } })} />
              <View style={styles.divider} />
              <SettingsRow title="Full name" value={profile?.fullName ?? ''} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'name' } })} />
              <View style={styles.divider} />
              <SettingsRow title="Email" value={profile?.email ?? ''} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'email' } })} />
              <View style={styles.divider} />
              <SettingsRow title="Username" value={profile?.username ? `@${profile.username}` : '—'} onPress={() => router.push({ pathname: '/edit-profile', params: { focus: 'username' } })} />
            </View>

            {/* Security */}
            <Text style={styles.sectionLabel}>Security</Text>
            <View style={[styles.card, shadows.card]}>
              <SettingsRow
                icon="lock"
                iconBg={colors.gray[50]}
                iconColor={colors.gray[600]}
                title="Change password"
                subtitle="Update your login password"
                onPress={() => router.push('/change-password')}
              />
            </View>

            {/* Data */}
            <Text style={styles.sectionLabel}>Your data</Text>
            <View style={[styles.card, shadows.card]}>
              <SettingsRow
                icon="file-download"
                iconBg={colors.accent.powder50}
                iconColor={colors.accent.powder600}
                title="Export my data"
                subtitle="Download a JSON copy of everything you've created"
                onPress={onExport}
                showChevron={!exporting}
                rightElement={exporting ? <ActivityIndicator size="small" color={colors.accent.powder600} /> : undefined}
              />
            </View>

            {/* Danger zone */}
            <Text style={[styles.sectionLabel, styles.dangerLabel]}>Danger zone</Text>
            <View style={[styles.card, shadows.card]}>
              <SettingsRow
                icon="delete-forever"
                iconBg={colors.danger[50]}
                iconColor={colors.danger[400]}
                title="Delete account"
                subtitle="Permanently erase your account data"
                danger
                onPress={openDelete}
              />
            </View>
            <Text style={styles.footnote}>
              Deleting removes all your tasks, habits, notes, goals and profile from this app.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Delete confirmation */}
      <Modal visible={delOpen} transparent animationType="none" onRequestClose={closeDelete}>
        <Animated.View style={[styles.backdrop, { opacity: modalAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDelete} />
        </Animated.View>
        <View style={styles.modalWrap} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: modalAnim,
                transform: [
                  { scale: animate ? modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) : 1 },
                ],
              },
            ]}
          >
            <View style={styles.warnIcon}>
              <MaterialIcons name="warning-amber" size={26} color={colors.danger[400]} />
            </View>
            <Text style={styles.modalTitle}>Delete your account?</Text>
            <Text style={styles.modalBody}>
              This can't be undone. Everything you've created will be permanently removed:
            </Text>
            <View style={styles.bullets}>
              {['All tasks & habit history', 'Notes and goals', 'Nutrition & focus logs', 'Your profile'].map((b) => (
                <View key={b} style={styles.bulletRow}>
                  <MaterialIcons name="remove" size={14} color={colors.gray[400]} />
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.confirmLabel}>Type {CONFIRM_WORD} to confirm</Text>
            <TextInput
              style={[styles.confirmInput, confirmMatches && styles.confirmInputOk]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder={CONFIRM_WORD}
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.deleteBtn, (!confirmMatches || deleting) && styles.deleteBtnDisabled]}
              disabled={!confirmMatches || deleting}
              onPress={onConfirmDelete}
              activeOpacity={0.9}
            >
              {deleting ? (
                <ActivityIndicator color={brand.canvas} />
              ) : (
                <Text style={styles.deleteBtnText}>Delete account</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeDelete} disabled={deleting} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  scroll: { padding: spacing.screenH, paddingBottom: 48 },

  // Identity
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 20, fontFamily: fonts.bold, color: brand.canvas },
  identityText: { flex: 1 },
  identityName: { fontSize: 18, fontFamily: fonts.bold, color: brand.ink, lineHeight: 24 },
  identitySub: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 18, marginTop: 1 },
  identityMeta: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400], lineHeight: 16, marginTop: 4 },

  sectionLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 22,
    marginBottom: 8,
    paddingLeft: 4,
  },
  dangerLabel: { color: colors.danger[400] },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.lg, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.gray[100], marginLeft: 16 },
  footnote: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
    marginTop: 10,
    paddingHorizontal: 4,
  },

  // Delete modal
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,21,50,0.55)' },
  modalWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: 22,
    ...shadows.elevated,
  },
  warnIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.danger[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 20, fontFamily: fonts.bold, color: brand.ink, lineHeight: 26 },
  modalBody: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 20, marginTop: 8 },
  bullets: { gap: 6, marginTop: 12, marginBottom: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bulletText: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 18 },
  confirmLabel: { fontSize: 13, fontFamily: fonts.semibold, color: colors.gray[600], marginTop: 16, marginBottom: 7 },
  confirmInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: brand.ink,
    letterSpacing: 2,
  },
  confirmInputOk: { borderColor: colors.danger[400] },
  deleteBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.danger[400],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  deleteBtnDisabled: { backgroundColor: colors.gray[200] },
  deleteBtnText: { fontSize: 16, fontFamily: fonts.semibold, color: brand.canvas },
  cancelBtn: { height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  cancelText: { fontSize: 15, fontFamily: fonts.semibold, color: colors.gray[600] },
});
