import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ScreenHeader from '../../components/layout/ScreenHeader';
import { colors, fonts, spacing } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { handleSupabaseError } from '../../lib/api/utils';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetErr) {
      showToast.saveFailed(handleSupabaseError(resetErr));
      return;
    }
    setSent(true);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Reset Password" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {sent ? (
              <View style={styles.sentBox}>
                <Text style={styles.sentTitle}>Check your email</Text>
                <Text style={styles.sentText}>
                  We sent a password reset link to {email}. Follow the instructions to set a new password.
                </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                  <Text style={styles.link}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you a link to reset your password.
                </Text>
                <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={error} />
                <PrimaryButton title="Send Reset Link" onPress={handleReset} loading={loading} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: spacing.screenH, gap: 16 },
  subtitle: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 22, marginBottom: 8 },
  sentBox: { gap: 12, paddingTop: 24 },
  sentTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.gray[900] },
  sentText: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 22 },
  link: { fontSize: 15, fontFamily: fonts.semibold, color: colors.primary[500], marginTop: 8 },
});
