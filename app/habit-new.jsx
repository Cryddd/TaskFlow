import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../lib/theme';
import { showToast } from '../lib/toast';
import PrimaryButton from '../components/ui/PrimaryButton';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ICONS = ['💧', '🏃', '📚', '🧘', '💪', '🍎', '😴', '✍️', '🎯', '🌿'];

export default function HabitNewScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💧');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [remind, setRemind] = useState(false);
  const [difficulty, setDifficulty] = useState('regular');
  const [category, setCategory] = useState('Health');
  const [loading, setLoading] = useState(false);

  const toggleDay = (idx) => {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast.habitCreated();
      router.back();
    }, 300);
  };

  const DIFFICULTIES = ['Easy', 'Regular', 'Hard'];
  const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Mindfulness', 'Nutrition', 'Work'];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={colors.gray[900]} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Habit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroIcon}>{icon}</Text>
            <Text style={styles.heroChangeText}>Change icon</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconPicker}>
            {ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                style={[styles.iconOption, icon === ic && styles.iconOptionActive]}
                onPress={() => setIcon(ic)}
                activeOpacity={0.7}
              >
                <Text style={styles.iconOptionText}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Name */}
          <View style={styles.field}>
            <TextInput
              style={styles.nameInput}
              placeholder="Name your habit"
              placeholderTextColor={colors.gray[200]}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
            />
          </View>
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.field}>
            <TextInput
              style={styles.descInput}
              placeholder="Why does this matter to you?"
              placeholderTextColor={colors.gray[400]}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
          <View style={styles.divider} />

          {/* Repeat Days */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Repeat days</Text>
            <View style={styles.daysRow}>
              {DAY_LABELS.map((label, idx) => {
                const active = selectedDays.includes(idx);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dayPill, active && styles.dayPillActive]}
                    onPress={() => toggleDay(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.divider} />

          {/* Reminder */}
          <View style={styles.rowField}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="alarm" size={18} color={colors.gray[900]} />
              <Text style={styles.rowLabel}>Get reminders</Text>
            </View>
            <Switch
              value={remind}
              onValueChange={setRemind}
              trackColor={{ false: colors.gray[200], true: colors.primary[400] }}
              thumbColor={remind ? colors.primary[500] : '#FFFFFF'}
            />
          </View>
          <View style={styles.divider} />

          {/* Difficulty */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Difficulty</Text>
            <View style={styles.pillRow}>
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.toLowerCase();
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setDifficulty(d.toLowerCase())}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.pillRow}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setCategory(c)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.field, { marginTop: 8 }]}>
            <PrimaryButton title="Save Habit" onPress={handleSave} loading={loading} disabled={!name.trim()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.card },
  kav: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 24,
  },
  scroll: { paddingBottom: 40 },
  heroCard: {
    margin: spacing.screenH,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroIcon: { fontSize: 48 },
  heroChangeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 17,
  },
  iconPicker: {
    paddingHorizontal: spacing.screenH,
    paddingBottom: 12,
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  iconOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  iconOptionText: { fontSize: 20 },
  field: { paddingHorizontal: spacing.screenH, paddingVertical: 12 },
  nameInput: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 28,
    minHeight: 40,
  },
  descInput: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.gray[900],
    lineHeight: 22,
    minHeight: 56,
  },
  divider: { height: 1, backgroundColor: colors.gray[100], marginHorizontal: spacing.screenH },
  rowField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingVertical: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 15, fontFamily: fonts.medium, color: colors.gray[900], lineHeight: 22 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 18,
    marginBottom: 10,
  },
  daysRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  dayPillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  dayLabel: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  dayLabelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  pillActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  pillText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  pillTextActive: {
    color: colors.primary[500],
    fontFamily: fonts.semibold,
  },
});
