import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { DoodleStarburst, DoodleWave } from './doodles/index';

interface KlassoScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Skip SafeAreaView (use when inside a nav container) */
  noSafeArea?: boolean;
}

/**
 * Global screen wrapper that:
 * — Sets #F7FBF9 background
 * — Adds a mint starburst (top-right, 40px, 15% opacity) on every screen
 * — Adds a coral wave (bottom-left, 30px, 20% opacity) on every screen
 */
export const KlassoScreen = ({
  children,
  style,
  noSafeArea = false,
}: KlassoScreenProps) => {
  const Wrapper = noSafeArea ? View : SafeAreaView;

  return (
    <Wrapper style={[styles.screen, style]}>
      {/* Signature top-right starburst */}
      <View style={styles.topRightDoodle} pointerEvents="none">
        <DoodleStarburst size={40} color={Colors.mint} />
      </View>

      {/* Signature bottom-left wave */}
      <View style={styles.bottomLeftDoodle} pointerEvents="none">
        <DoodleWave size={30} color={Colors.coral} />
      </View>

      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    position: 'relative',
  },
  topRightDoodle: {
    position: 'absolute',
    top: 52,
    right: 16,
    opacity: 0.15,
    zIndex: 0,
    pointerEvents: 'none',
  },
  bottomLeftDoodle: {
    position: 'absolute',
    bottom: 32,
    left: 12,
    opacity: 0.2,
    zIndex: 0,
    pointerEvents: 'none',
  },
});
