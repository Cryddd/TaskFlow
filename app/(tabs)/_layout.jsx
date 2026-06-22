import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Tabs, useRouter, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import FABMenu from '../../components/ui/FABMenu';
import { useAuth } from '../../lib/AuthContext';
import { colors, fonts } from '../../lib/theme';

const TAB_BAR_HEIGHT = 60;

const LEFT_TABS = [
  { name: 'index',    label: 'Home',  icon: 'home'      },
  { name: 'tasks',    label: 'Tasks', icon: 'check-box' },
];

const RIGHT_TABS = [
  { name: 'discover', label: 'Discover', icon: 'explore' },
  { name: 'profile',  label: 'Profile',  icon: 'person'  },
];

function TabButton({ tab, isFocused, onPress }) {
  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={onPress}
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
}

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isFocused = (name) => {
    const index = state.routes.findIndex((r) => r.name === name);
    return state.index === index;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabRow}>
        {LEFT_TABS.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            isFocused={isFocused(tab.name)}
            onPress={() => navigation.navigate(tab.name)}
          />
        ))}

        <View style={styles.fabSlot}>
          <FABMenu variant="tab" onNavigate={(path) => router.push(path)} />
        </View>

        {RIGHT_TABS.map((tab) => (
          <TabButton
            key={tab.name}
            tab={tab}
            isFocused={isFocused(tab.name)}
            onPress={() => navigation.navigate(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

export default function TabLayout() {
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
        <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
        <Tabs.Screen name="profile"  options={{ title: 'Profile'  }} />
        <Tabs.Screen name="calendar" options={{ href: null }} />
      </Tabs>
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
    alignItems: 'flex-end',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 4,
    paddingBottom: 6,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
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
});
