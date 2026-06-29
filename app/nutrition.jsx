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
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '../lib/store';
import { useTasks } from '../lib/hooks/useTasks';
import { useNutrition, useAddMealItem } from '../lib/hooks/useMisc';
import { colors, brand, fonts, spacing, radius, shadows } from '../lib/theme';
import WeekStrip from '../components/ui/WeekStrip';
import MacroBar from '../components/ui/MacroBar';

const MEAL_ICONS = {
  Breakfast: 'free-breakfast',
  Lunch:     'lunch-dining',
  Dinner:    'dinner-dining',
  Snacks:    'restaurant',
};

function MealGroup({ meal, defaultExpanded = true, onAddFood }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const totalCals = meal.items.reduce((s, i) => s + i.calories, 0);

  return (
    <View style={styles.mealGroup}>
      <TouchableOpacity style={styles.mealHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.mealIcon}>
          <MaterialIcons name={MEAL_ICONS[meal.type] ?? 'restaurant'} size={19} color={brand.ink} />
        </View>
        <Text style={styles.mealType}>{meal.type}</Text>
        <Text style={styles.mealCals}>{totalCals} kcal</Text>
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={20} color={colors.gray[400]} />
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
                    P {item.protein}g · C {item.carbs}g · F {item.fat}g
                  </Text>
                </View>
                <Text style={styles.mealItemCals}>{item.calories}</Text>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.addFoodRow} onPress={() => onAddFood?.(meal.type)}>
            <MaterialIcons name="add" size={16} color={brand.ink} />
            <Text style={styles.addFoodText}>Add food</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function NutritionScreen() {
  const router = useRouter();
  const { selectedDate, setSelectedDate } = useStore();
  const { data: nutrition } = useNutrition(selectedDate);
  const addMealMut = useAddMealItem();
  const { data: tasks = [] } = useTasks();

  const calories = nutrition?.calories ?? { current: 0, target: 1800 };
  const protein = nutrition?.protein ?? { current: 0, target: 150, unit: 'g' };
  const carbs = nutrition?.carbs ?? { current: 0, target: 200, unit: 'g' };
  const fat = nutrition?.fat ?? { current: 0, target: 67, unit: 'g' };
  const meals = nutrition?.meals ?? [];

  const handleAddFood = (mealType) => {
    addMealMut.mutate({
      date: selectedDate,
      mealType,
      name: 'Logged food',
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 3,
    });
  };

  const calPct = Math.round((calories.current / calories.target) * 100);
  const calRemaining = Math.max(0, calories.target - calories.current);

  const tasksPerDate = tasks.reduce((acc, t) => {
    if (t.dueDate) acc[t.dueDate] = (acc[t.dueDate] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={22} color={brand.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Nutrition</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Week Strip */}
        <View style={styles.section}>
          <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} tasksPerDate={tasksPerDate} />
        </View>

        {/* Macro Summary Card */}
        <View style={styles.section}>
          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroTitle}>Today's intake</Text>
              <View style={styles.pctPill}>
                <Text style={styles.pctText}>{calPct}%</Text>
              </View>
            </View>

            <View style={styles.caloriesRow}>
              <Text style={styles.bigCals}>{calories.current.toLocaleString()}</Text>
              <Text style={styles.ofTarget}> / {calories.target.toLocaleString()} kcal</Text>
            </View>

            <View style={styles.calBarTrack}>
              <View style={[styles.calBarFill, { width: `${Math.min(100, calPct)}%` }]} />
            </View>
            <Text style={styles.remaining}>{calRemaining.toLocaleString()} kcal remaining</Text>

            <View style={styles.macrosGrid}>
              <MacroBar label="Protein" macroKey="protein" current={protein.current} target={protein.target} unit={protein.unit} />
              <MacroBar label="Carbs" macroKey="carbs" current={carbs.current} target={carbs.target} unit={carbs.unit} />
              <MacroBar label="Fat" macroKey="fat" current={fat.current} target={fat.target} unit={fat.unit} />
            </View>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.section}>
          <Text style={styles.mealsTitle}>Meals</Text>
          <View style={styles.mealsList}>
            {meals.map((meal, idx) => (
              <MealGroup key={meal.id} meal={meal} defaultExpanded={idx < 2} onAddFood={handleAddFood} />
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Meal FAB */}
      <TouchableOpacity style={styles.addFab} activeOpacity={0.9}>
        <MaterialIcons name="add" size={20} color={brand.canvas} />
        <Text style={styles.addFabText}>Log meal</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.app },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenH,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: brand.ink,
  },
  scroll: { paddingBottom: 40 },
  section: { paddingHorizontal: spacing.screenH, marginTop: 20 },
  macroCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: 18,
    gap: 12,
    ...shadows.card,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  pctPill: {
    backgroundColor: colors.accent.powder50,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  pctText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.accent.powder600,
  },
  caloriesRow: { flexDirection: 'row', alignItems: 'baseline' },
  bigCals: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: brand.ink,
    letterSpacing: -0.5,
  },
  ofTarget: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray[400],
  },
  calBarTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  calBarFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: brand.powder,
  },
  remaining: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.gray[600],
  },
  macrosGrid: { gap: 12, marginTop: 4 },
  mealsTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: brand.ink,
    marginBottom: 12,
  },
  mealsList: { gap: 10 },
  mealGroup: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  mealIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.accent.powder50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealType: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  mealCals: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.accent.sand600,
  },
  mealItems: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 4,
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
    color: brand.ink,
  },
  mealItemMacros: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.gray[400],
  },
  mealItemCals: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.gray[600],
  },
  emptyMeal: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.gray[400],
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
    fontFamily: fonts.semibold,
    color: brand.ink,
  },
  addFab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: brand.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 13,
    ...shadows.floating,
  },
  addFabText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: brand.canvas,
  },
});
