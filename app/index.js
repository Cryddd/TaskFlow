import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error: queryError } = await supabase
          .from('tasks')
          .select('id')
          .limit(1);

        if (queryError) {
          setError(queryError.message);
          setStatus('error');
        } else {
          setStatus('connected');
        }
      } catch (err) {
        setError(err.message);
        setStatus('error');
      }
    }

    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <MaterialIcons name="check-circle" size={72} color="#1565C0" style={styles.icon} />

      <Text style={styles.title}>TaskFlow</Text>
      <Text style={styles.subtitle}>Your personal task manager</Text>

      <View style={styles.statusBox}>
        {status === 'checking' && (
          <>
            <ActivityIndicator color="#1565C0" />
            <Text style={styles.statusText}>Connecting to Supabase…</Text>
          </>
        )}

        {status === 'connected' && (
          <>
            <MaterialIcons name="cloud-done" size={24} color="#2E7D32" />
            <Text style={[styles.statusText, styles.successText]}>
              Supabase connected
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <MaterialIcons name="cloud-off" size={24} color="#C62828" />
            <Text style={[styles.statusText, styles.errorText]}>
              Connection failed
            </Text>
            <Text style={styles.errorDetail}>{error}</Text>
            <Text style={styles.hint}>
              Paste your Project URL and anon key into .env, then restart with:
              {'\n'}npx expo start -c
            </Text>
          </>
        )}
      </View>

      <Text style={styles.phase}>Phase 1 — Environment Setup</Text>
    </View>
  );
}

HomeScreen.navigationOptions = {
  title: 'TaskFlow',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1565C0',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 40,
    marginTop: 4,
  },
  statusBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
  },
  successText: {
    color: '#2E7D32',
  },
  errorText: {
    color: '#C62828',
  },
  errorDetail: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#546E7A',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  phase: {
    marginTop: 40,
    fontSize: 12,
    color: '#90A4AE',
    letterSpacing: 0.5,
  },
});
