import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { colors, fonts, spacing } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { handleSupabaseError } from '../../lib/api/utils';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const next = {};
    if (!fullName.trim()) next.fullName = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), username: username.trim() || null },
      },
    });
    setLoading(false);

    if (error) {
      showToast.saveFailed(handleSupabaseError(error));
      return;
    }

    showToast.saveSuccess?.() ?? showToast.taskCreated();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>Create Account</Text>
            <Text style={styles.subtitle}>Start organizing your tasks and habits.</Text>
          </View>

          <View style={styles.form}>
            <InputField label="Full Name" value={fullName} onChangeText={setFullName} error={errors.fullName} />
            <InputField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <InputField label="Password" value={password} onChangeText={setPassword} secureTextEntry showSecureToggle error={errors.password} />
            <InputField label="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry showSecureToggle error={errors.confirm} />
            <PrimaryButton title="Create Account" onPress={handleSignUp} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.link}>Sign In</Text>
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
  scroll: { flexGrow: 1, padding: spacing.screenH, paddingVertical: 40 },
  header: { marginBottom: 32, gap: 8 },
  logo: { fontSize: 28, fontFamily: fonts.bold, color: colors.gray[900] },
  subtitle: { fontSize: 15, fontFamily: fonts.regular, color: colors.gray[600], lineHeight: 22 },
  form: { gap: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 32 },
  footerText: { fontSize: 14, fontFamily: fonts.regular, color: colors.gray[600] },
  link: { fontSize: 14, fontFamily: fonts.semibold, color: colors.primary[500] },
});
