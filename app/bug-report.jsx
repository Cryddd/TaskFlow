import { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import ScreenHeader from '../components/layout/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';
import { FormSkeleton } from '../components/ui/SkeletonLoader';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { showToast } from '../lib/toast';
import { useSubmitBugReport } from '../lib/hooks/useMisc';
import { useScreenLoading } from '../lib/useScreenLoading';

const DEVICE_INFO = `${Platform.OS === 'ios' ? 'iOS' : 'Android'} · ${Constants.deviceName ?? 'Device'} · TaskFlow v1.0.0`;

export default function BugReportScreen() {
  const router = useRouter();
  const loading = useScreenLoading();
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');

  const canSend = description.trim().length > 0;

  const submitMut = useSubmitBugReport();

  const handleSend = () => {
    submitMut.mutate(
      {
        subject: 'Bug Report',
        description: `${description.trim()}\n\nSteps:\n${steps.trim()}`,
        deviceInfo: DEVICE_INFO,
      },
      {
        onSuccess: () => {
          showToast.reportSent();
          router.back();
        },
      }
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Report a Bug"
        rightLabel="Send"
        onRightPress={handleSend}
        rightDisabled={!canSend}
      />
      {loading ? (
        <FormSkeleton />
      ) : (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>What happened?</Text>
          <TextInput
            style={styles.multiline}
            multiline
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, 500))}
            placeholder="Describe the issue in as much detail as possible..."
            placeholderTextColor={colors.gray[400]}
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{description.length} / 500</Text>

          <Text style={styles.label}>Steps to reproduce (optional)</Text>
          <TextInput
            style={[styles.multiline, styles.short]}
            multiline
            value={steps}
            onChangeText={setSteps}
            placeholder="1. Open app…"
            placeholderTextColor={colors.gray[400]}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Device info</Text>
          <View style={styles.readonly}>
            <Text style={styles.readonlyText}>{DEVICE_INFO}</Text>
          </View>

          <PrimaryButton title="Send Report" onPress={handleSend} disabled={!canSend} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  flex: { flex: 1 },
  scroll: { padding: spacing.screenH, paddingBottom: 40, gap: 8 },
  label: { fontSize: 13, fontFamily: fonts.semibold, color: colors.gray[600], marginTop: 8 },
  multiline: {
    minHeight: 120,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[100],
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
  },
  short: { minHeight: 80 },
  counter: { fontSize: 11, fontFamily: fonts.regular, color: colors.gray[400], textAlign: 'right' },
  readonly: {
    backgroundColor: colors.gray[50],
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  readonlyText: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray[400] },
  btn: { marginTop: 16 },
});
