import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Keyboard } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, retroShadow } from '../theme/colors';

const TAB_HEIGHT = 70;

export interface TabConfig {
  name: string;
  label: string;
  Icon: React.FC<any>;
  hasBadge?: boolean;
}

interface KlassoTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  tabsConfig: TabConfig[];
}

export function KlassoTabBar({ state, descriptors, navigation, tabsConfig }: KlassoTabBarProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (isKeyboardVisible) return null;

  return (
    <View style={[styles.tabBar, { height: TAB_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = tabsConfig.find((c) => c.name === route.name);
        
        if (!config) return null;

        return (
          <TabBarItem
            key={route.key}
            config={config}
            isFocused={isFocused}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
}

function TabBarItem({ config, isFocused, onPress }: { config: TabConfig, isFocused: boolean, onPress: () => void }) {
  const Icon = config.Icon;
  const iconBounce = useSharedValue(0);
  const pillScale = useSharedValue(isFocused ? 1 : 0);
  const badgeScale = useSharedValue(1);

  React.useEffect(() => {
    if (isFocused) {
      pillScale.value = withSpring(1, { stiffness: 200, damping: 20 });
      iconBounce.value = withSequence(
        withTiming(-4, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 150, easing: Easing.bounce })
      );
    } else {
      pillScale.value = withSpring(0, { stiffness: 200, damping: 20 });
    }
  }, [isFocused]);

  React.useEffect(() => {
    if (config.hasBadge) {
      const interval = setInterval(() => {
        badgeScale.value = withSequence(
          withTiming(0, { duration: 10 }),
          withSpring(1.2, { stiffness: 150 }),
          withSpring(1.0, { stiffness: 100 })
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [config.hasBadge]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconBounce.value }],
    zIndex: 2,
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: pillScale.value }, { scaleY: pillScale.value }],
    opacity: pillScale.value,
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }]
  }));

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.tabItem}>
        <View style={styles.iconContainer}>
          <Animated.View style={[styles.activePill, animatedPillStyle, retroShadow(2, 2, Colors.shadowMint)]} />
          <Animated.View style={animatedIconStyle}>
            <Icon size={24} color={isFocused ? '#FFFFFF' : '#A8C5BF'} />
          </Animated.View>
          {config.hasBadge && (
            <Animated.View style={[styles.badge, animatedBadgeStyle]}>
              <Text style={styles.badgeText}>3</Text>
            </Animated.View>
          )}
        </View>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
          {config.label}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#D4EDE8',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 48,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activePill: {
    position: 'absolute',
    width: 48,
    height: 28,
    backgroundColor: Colors.mint,
    borderRadius: 14,
    zIndex: 1,
  },
  tabLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: '#6B8C85',
  },
  tabLabelFocused: {
    fontFamily: Fonts.heading,
    color: '#FFFFFF', 
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.coral,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: {
    fontFamily: Fonts.headingXB,
    fontSize: 9,
    color: '#FFF',
    includeFontPadding: false,
    lineHeight: 11,
  }
});
