import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CATEGORY_TEMPLATES } from '../../lib/constants/templates';
import { useCreateHabit } from '../../lib/hooks/useHabits';
import { useCreateTask } from '../../lib/hooks/useTasks';
import { useTemplateAdditions, useMarkTemplateAdded } from '../../lib/hooks/useMisc';
import { colors, fonts, spacing, radius, shadows } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useScreenLoading } from '../../lib/useScreenLoading';
import ScreenHeader from '../../components/layout/ScreenHeader';
import EmptyState from '../../components/ui/EmptyState';
import { CategoryDetailSkeleton } from '../../components/ui/SkeletonLoader';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const loading = useScreenLoading();
  const { data: addedIds = [] } = useTemplateAdditions();
  const markAddedMut = useMarkTemplateAdded();
  const createHabitMut = useCreateHabit();
  const createTaskMut = useCreateTask();
  const category = CATEGORY_TEMPLATES[id];

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Discover" />
        <CategoryDetailSkeleton />
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Category" />
        <EmptyState
          icon="explore"
          title="Category not found"
          subtitle="Try browsing Discover again."
        />
      </View>
    );
  }

  const handleAdd = (item) => {
    if (addedIds.includes(item.id)) return;
    if (item.type === 'habit') {
      createHabitMut.mutate({
        name: item.name,
        description: item.description,
        icon: '✨',
        category: category.name,
        difficulty: 'regular',
        color: colors.primary[500],
        targetDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      });
      showToast.habitCreated();
    } else {
      const fmt = (d) => d.toISOString().split('T')[0];
      createTaskMut.mutate({
        title: item.name,
        description: item.description,
        category: id,
        priority: 'medium',
        difficulty: 'regular',
        tags: [],
        dueDate: fmt(new Date()),
        dueTime: null,
      });
      showToast.taskCreated();
    }
    markAddedMut.mutate(item.id);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={category.name}
        rightElement={
          <TouchableOpacity style={styles.searchBtn}>
            <MaterialIcons name="search" size={22} color={colors.gray[600]} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: category.gradient[0] }]}>
          <MaterialIcons name={category.icon} size={36} color={colors.gray[0]} />
          <Text style={styles.heroTitle}>{category.name}</Text>
        </View>

        <View style={styles.list}>
          {category.items.map((item) => {
            const added = addedIds.includes(item.id);
            return (
              <View key={item.id} style={[styles.card, shadows.card]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary[50] }]}>
                  <MaterialIcons name={category.icon} size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, added && styles.addedBtn]}
                  onPress={() => handleAdd(item)}
                  disabled={added}
                  activeOpacity={0.7}
                >
                  {added ? (
                    <>
                      <MaterialIcons name="check" size={14} color={colors.success[400]} />
                      <Text style={styles.addedText}>Added</Text>
                    </>
                  ) : (
                    <Text style={styles.addText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.app },
  searchBtn: { width: 64, alignItems: 'flex-end' },
  scroll: { paddingBottom: 40 },
  hero: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.gray[0],
  },
  list: { paddingHorizontal: spacing.screenH, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.gray[900] },
  cardDesc: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray[400] },
  addBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.primary[500] },
  addedBtn: { borderColor: colors.success[400], flexDirection: 'row', gap: 4 },
  addedText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.success[400] },
});
