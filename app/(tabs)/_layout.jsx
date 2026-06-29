import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import FABMenu from '../../components/ui/FABMenu';
import { useAuth } from '../../lib/AuthContext';
import { colors, brand, shadows } from '../../lib/theme';

// Floating pill nav — Home · Calendar · Tasks · Profile.
// Add happens via the warm sand FAB (quick-capture menu).
const NAV_TABS = [
  { name: 'index',    icon: 'home',            label: 'Home'     },
  { name: 'calendar', icon: 'calendar-today',  label: 'Calendar' },
  { name: 'tasks',    icon: 'checklist',       label: 'Tasks'    },
  { name: 'profile',  icon: 'person-outline',  label: 'Profile'  },
];

function PillTab({ tab, isFocused, onPress }) {
  return (
    <TouchableOpacity
      style={styles.pillTab}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
    >
      <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
        <MaterialIcons
          name={tab.icon}
          size={22}
          color={isFocused ? brand.ink : '#9FB0DC'}
        />
      </View>
    </TouchableOpacity>
  );
}

function FloatingTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isFocused = (name) => {
    const index = state.routes.findIndex((r) => r.name === name);
    return state.index === index;
  };

  return (
    <View
      style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 14) }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        {NAV_TABS.map((tab) => (
          <PillTab
            key={tab.name}
            tab={tab}
            isFocused={isFocused(tab.name)}
            onPress={() => navigation.navigate(tab.name)}
          />
        ))}
      </View>

      <View style={styles.fabSlot}>
        <FABMenu variant="tab" onNavigate={(path) => router.push(path)} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.wrapper}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg.app } }}
      >
        <Tabs.Screen name="index"    options={{ title: 'Home'     }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="tasks"    options={{ title: 'Tasks'    }} />
        <Tabs.Screen name="profile"  options={{ title: 'Profile'  }} />
        <Tabs.Screen name="discover" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg.app,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.app,
  },
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.ink,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 2,
    ...shadows.floating,
  },
  pillTab: {
    paddingHorizontal: 4,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: brand.canvas,
  },
  fabSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
