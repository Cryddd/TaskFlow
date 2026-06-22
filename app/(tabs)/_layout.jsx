import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import FABMenu from '../../components/ui/FABMenu';
import { useAuth } from '../../lib/AuthContext';
import { colors, fonts } from '../../lib/theme';

const TAB_BAR_HEIGHT = 60;

const TABS = [
  { name: 'index',    label: 'Home',     icon: 'home'           },
  { name: 'tasks',    label: 'Tasks',    icon: 'check-box'      },
  { name: 'calendar', label: 'Calendar', icon: 'calendar-today' },
  { name: 'discover', label: 'Discover', icon: 'explore'        },
  { name: 'profile',  label: 'Profile',  icon: 'person'         },
];

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
            >
              {isFocused && <View style={styles.indicator} />}
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={isFocused ? colors.primary[500] : colors.gray[400]}
              />
              <Text style={[styles.label, isFocused && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.app }}>
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
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index"    options={{ title: 'Home'     }} />
        <Tabs.Screen name="tasks"    options={{ title: 'Tasks'    }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="profile"  options={{ title: 'Profile'  }} />
      </Tabs>

      <View
        style={[styles.fabContainer, { bottom: TAB_BAR_HEIGHT + insets.bottom + 16 }]}
        pointerEvents="box-none"
      >
        <FABMenu onNavigate={(path) => router.push(path)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    backgroundColor: colors.bg.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  tabRow: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 4,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  activeLabel: {
    color: colors.primary[500],
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
});
