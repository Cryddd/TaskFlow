import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radius, brand } from '../../lib/theme';

const ICON = 44; // action icon-circle diameter

const ACTIONS = [
  { key: 'task',  label: 'New Task',  icon: 'assignment-add', route: '/task-new'  },
  { key: 'habit', label: 'New Habit', icon: 'loop',           route: '/habit-new' },
  { key: 'note',  label: 'New Note',  icon: 'sticky-note-2',  route: '/note/new'  },
  { key: 'event', label: 'New Event', icon: 'event',          route: null         },
];

export default function FABMenu({ onNavigate, variant = 'floating' }) {
  const isTab = variant === 'tab';
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null); // measured FAB rect in window coords
  const fabRef = useRef(null);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(ACTIONS.map(() => new Animated.Value(0))).current;

  const openMenu = () => {
    // Measure the FAB so the menu anchors precisely above it, regardless of
    // where the dock lays the button out on different screen widths.
    fabRef.current?.measureInWindow?.((x, y, w, h) => {
      if (w) setAnchor({ x, y, w, h });
    });
    setOpen(true);
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ...itemAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 180,
          delay: i * 50,
          useNativeDriver: true,
        })
      ),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ...itemAnims.map((anim) =>
        Animated.timing(anim, { toValue: 0, duration: 120, useNativeDriver: true })
      ),
    ]).start(() => setOpen(false));
  };

  const handleAction = (action) => {
    closeMenu();
    if (action.route) {
      setTimeout(() => onNavigate?.(action.route), 220);
    }
  };

  // Anchor the menu so each row's icon circle is centered on the FAB's `+`,
  // stacking upward with labels flowing to the left.
  const { width: winW, height: winH } = Dimensions.get('window');
  const anchoredStyle = anchor
    ? {
        position: 'absolute',
        right: Math.max(12, winW - (anchor.x + anchor.w / 2 + ICON / 2)),
        bottom: winH - anchor.y + 14,
        alignItems: 'flex-end',
        gap: 12,
      }
    : null;

  return (
    <>
      <Modal visible={open} transparent animationType="none" onRequestClose={closeMenu}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
          pointerEvents={open ? 'auto' : 'none'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
        </Animated.View>

        <View
          style={[
            styles.actionsContainer,
            isTab && styles.actionsContainerTab,
            anchoredStyle,
          ]}
          pointerEvents="box-none"
        >
          {[...ACTIONS].reverse().map((action, idx) => {
            const realIdx = ACTIONS.length - 1 - idx;
            const anim = itemAnims[realIdx];
            const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
            return (
              <Animated.View
                key={action.key}
                style={[
                  styles.actionItem,
                  isTab && styles.actionItemTab,
                  { opacity: anim, transform: [{ translateY }] },
                ]}
              >
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleAction(action)}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionLabelBubble}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </View>
                  <View style={styles.actionIconCircle}>
                    <MaterialIcons name={action.icon} size={18} color={colors.primary[500]} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Modal>

      <TouchableOpacity
        ref={fabRef}
        style={[styles.fab, isTab && styles.tabFab]}
        onPress={open ? closeMenu : openMenu}
        activeOpacity={0.9}
      >
        <MaterialIcons
          name={open ? 'close' : 'add'}
          size={isTab ? 26 : 28}
          color={colors.gray[0]}
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 27, 46, 0.4)',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    alignItems: 'flex-end',
    gap: 12,
  },
  actionsContainerTab: {
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'flex-end',
  },
  actionItemTab: {
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionLabelBubble: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.gray[900],
    lineHeight: 18,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  tabFab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: brand.sand,
    shadowColor: brand.sand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
