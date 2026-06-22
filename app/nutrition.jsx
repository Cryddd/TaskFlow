import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Plus, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useStore } from '../lib/store';
import { colors, fonts, spacing, radius, shadows } from '../lib/theme';
import WeekStrip from '../components/ui/WeekStrip';
import MacroBar from '../components/ui/MacroBar';

const MEAL_ICONS = {
  Breakfast: '🌅',
  Lunch:     '☀️',
  Dinner:    '🌙',
  Snacks:    '🍎',
};

function MealGroup({ meal, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const totalCals = meal.items.reduce((s, i) => s + i.calories, 0);

  return (
    <View style={styles.mealGroup}>
      <TouchableOpacity style={styles.mealHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <Text style={styles.mealIcon}>{MEAL_ICONS[meal.type] ?? '🍽️'}</Text>
        <Text style={styles.mealType}>{meal.type}</Text>
        <Text style={styles.mealCals}>{totalCals} kcal</Text>
        {expanded ? <ChevronUp size={16} color={colors.gray[400]} /> : <ChevronDown size={16} color={colors.gray[400]} />}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.mealItems}>
          {meal.items.length === 0 ? (
            <Text style={styles.emptyMeal}>No items logged yet.</Text>
          ) : (
            meal.items.map((item) => (
              <View key={item.id} style={styles.mealItem}>
                <View style={styles.mealItemLeft}>
                  <Text style={styles.mealItemName}>{item.name}</Text>
                  <Text style={styles.mealItemMacros}>
                    P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                  </Text>
                </View>
                <Text style={styles.mealItemCals}>{item.calories}</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.addFoodRow}>
            <Plus size={14} color={colors.primary[500]} />
            <Text style={styles.addFoodText}>Add food</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function NutritionScreen() {
  const router = useRouter();
  const { nutrition, selectedDate, setSelectedDate, tasks } = useStore();
  const { calories, protein, carbs, fat, meals } = nutrition;

  const calPct = Math.round((calories.current / calories.target) * 100);

  const tasksPerDate = tasks.reduce((acc, t) => {
    if (t.dueDate) acc[t.dueDate] = (acc[t.dueDate] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={24} color={colors.gray[900]} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Nutrition</Text>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Bell size={22} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Week Strip */}
        <View style={styles.section}>
          <WeekStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            tasksPerDate={tasksPerDate}
          />
        </View>

        {/* Macro Summary Card */}
        <View style={styles.section}>
          <View style={[styles.macroCard, shadows.card]}>
            {/* Header */}
            <View style={styles.macroHeader}>
              <Text style={styles.macroTitle}>Today's Nutrition</Text>
              <View style={styles.macroHeaderRight}>
                <Text style={styles.macroPct}>{calPct}%</Text>
                <View style={styles.miniBarTrack}>
                  <View style={[styles.miniBarFill, { width: `${Math.min(100, calPct)}%` }]} />
                </View>
              </View>
            </View>

            {/* Calories */}
            <View style={styles.caloriesRow}>
              <Text style={styles.caloriesLabel}>Calories</Text>
              <Text style={styles.caloriesValue}>
                {calories.current.toLocaleString()} / {calories.target.toLocaleString()} kcal
              </Text>
            </View>
            <View style={styles.calBarTrack}>
              <View style={[styles.calBarFill, { width: `${Math.min(100, calPct)}%` }]} />
            </View>

            {/* Macros */}
            <View style={styles.macrosGrid}>
              <MacroBar
                label="Protein"
                macroKey="protein"
                current={protein.current}
                target={protein.target}
                unit={protein.unit}
                style={styles.macroItem}
              />
              <MacroBar
                label="Carbs"
                macroKey="carbs"
                current={carbs.current}
                target={carbs.target}
                unit={carbs.unit}
                style={styles.macroItem}
              />
              <MacroBar
                label="Fat"
                macroKey="fat"
                current={fat.current}
                target={fat.target}
                unit={fat.unit}
                style={styles.macroItem}
              />
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.section}>
          <Text style={styles.mealsTitle}>Today's Meals</Text>
          <View style={styles.mealsList}>
            {meals.map((meal, idx) => (
              <MealGroup
                key={meal.id}
                meal={meal}
                defaultExpanded={idx < 2}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.addFab}>
        <Plus size={20} color={colors.primary[500]} />
        <Text style={styles.addFabText}>Log Meal</Text>
      </TouchableOpacity>
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
    backgroundColor: colors.bg.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  screenTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
  },
  scroll: { paddingBottom: 40 },
  section: { paddingHorizontal: spacing.screenH, marginTop: 20 },
  macroCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 24,
  },
  macroHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroPct: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.primary[500],
    lineHeight: 22,
  },
  miniBarTrack: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  caloriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesLabel: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 19,
  },
  caloriesValue: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray[600],
    lineHeight: 19,
  },
  calBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
    marginTop: -8,
  },
  calBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  macrosGrid: { gap: 10 },
  macroItem: {},
  mealsTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[900],
    lineHeight: 28,
    marginBottom: 12,
  },
  mealsList: { gap: 8 },
  mealGroup: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  mealIcon: { fontSize: 18 },
  mealType: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 22,
  },
  mealCals: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
    lineHeight: 18,
  },
  mealItems: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 2,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  mealItemLeft: { flex: 1, gap: 2, paddingRight: 12 },
  mealItemName: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.gray[900],
    lineHeight: 19,
  },
  mealItemMacros: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 17,
  },
  mealItemCals: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
    lineHeight: 19,
  },
  emptyMeal: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
    lineHeight: 18,
    paddingVertical: 12,
  },
  addFoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  addFoodText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.primary[500],
    lineHeight: 18,
  },
  addFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg.card,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.primary[200],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addFabText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.primary[500],
    lineHeight: 19,
  },
});
