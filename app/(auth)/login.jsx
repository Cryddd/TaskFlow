import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors, fonts, spacing, radius } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { handleSupabaseError } from '../../lib/api/utils';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      showToast.saveFailed(handleSupabaseError(error));
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>TaskFlow</Text>
            <Text style={styles.subtitle}>Welcome back. Sign in to continue.</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showSecureToggle
              error={errors.password}
            />
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgot}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
            <PrimaryButton title="Sign In" onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.app },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.screenH, justifyContent: 'center' },
  header: { marginBottom: 32, gap: 8 },
  logo: { fontSize: 32, fontFamily: fonts.bold, color: colors.primary[500] },
  subtitle: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 22 },
  form: { gap: 16 },
  forgot: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13, fontFamily: fonts.medium, color: colors.primary[500] },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 32 },
  footerText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600] },
  link: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary[500] },
});
