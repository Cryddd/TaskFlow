import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenHeader from '../components/layout/ScreenHeader';
import InputField from '../components/ui/InputField';
import PrimaryButton from '../components/ui/PrimaryButton';
import { FormSkeleton } from '../components/ui/SkeletonLoader';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { useChangePassword } from '../lib/hooks/useProfile';
import { showToast } from '../lib/toast';
import { useScreenLoading } from '../lib/useScreenLoading';

function getStrength(pw) {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return { level: Math.min(score, 4), label: labels[Math.min(score - 1, 3)] || 'Weak' };
}

const STRENGTH_COLORS = [colors.danger[400], colors.warning[400], colors.primary[500], colors.success[400]];

export default function ChangePasswordScreen() {
  const router = useRouter();
  const loading = useScreenLoading();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const strength = getStrength(newPw);
  const mismatch = confirm.length > 0 && newPw !== confirm;

  const changePasswordMut = useChangePassword();

  const handleSave = () => {
    if (mismatch || newPw.length < 8) {
      showToast.saveFailed();
      return;
    }
    changePasswordMut.mutate(
      { current, newPassword: newPw },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Change Password" />
      {loading ? (
        <FormSkeleton />
      ) : (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <InputField label="Current Password" value={current} onChangeText={setCurrent} showSecureToggle />
          <InputField label="New Password" value={newPw} onChangeText={setNewPw} showSecureToggle />
          {newPw.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBar}>
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSeg,
                      { backgroundColor: i < strength.level ? STRENGTH_COLORS[Math.min(strength.level - 1, 3)] : colors.gray[100] },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.strengthLabel}>{strength.label}</Text>
            </View>
          )}
          <InputField
            label="Confirm New Password"
            value={confirm}
            onChangeText={setConfirm}
            showSecureToggle
            error={mismatch ? 'Passwords do not match' : ''}
          />

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={14} color={colors.primary[400]} />
            <Text style={styles.infoText}>
              Password must be at least 8 characters and contain at least one number and one uppercase letter.
            </Text>
          </View>

          <PrimaryButton title="Update Password" onPress={handleSave} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  flex: { flex: 1 },
  scroll: { padding: spacing.screenH, gap: 16, paddingBottom: 40 },
  strengthWrap: { gap: 6, marginTop: -8 },
  strengthBar: { flexDirection: 'row', gap: 4 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontFamily: fonts.medium, color: colors.gray[400] },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 17 },
  btn: { marginTop: 8 },
});
