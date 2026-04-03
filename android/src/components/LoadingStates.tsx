import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withRepeat, withTiming, withSequence, Easing, SharedValue } from 'react-native-reanimated';
import { Colors, Fonts, Radius } from '../theme/colors';
import { DoodlePencil, DoodleCheckCircle, DoodleCircleDot } from '@/src/components';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── 1. Skeleton Screens ────────────────────────────────────────────────────
export const SkeletonCard = ({ style }: { style?: any }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.skeletonBase, animatedStyle, style]}>
      {/* Tiny circle dot in top right */}
      <View style={{ position: 'absolute', top: 12, right: 12 }}>
        <DoodleCircleDot size={16} color={Colors.mint} />
      </View>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '60%' }]} />
      <View style={[styles.skeletonLine, { width: '40%', marginTop: 12 }]} />
    </Animated.View>
  );
};

// ─── 2. Full Screen Loader ──────────────────────────────────────────────────
export const FullScreenLoader = () => {
  const strokeProgress = useSharedValue(0);
  const px = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const loop = () => {
      strokeProgress.value = 0;
      px.value = 0;
      checkOpacity.value = 0;
      setShowCheck(false);

      strokeProgress.value = withTiming(1, { duration: 1500, easing: Easing.linear });
      px.value = withTiming(100, { duration: 1500, easing: Easing.linear }, (finished) => {
        if (finished) {
          setShowCheck(true);
          checkOpacity.value = withTiming(1, { duration: 300 });
          setTimeout(() => {
            loop();
          }, 800);
        }
      });
    };
    loop();
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 100 - strokeProgress.value * 100,
  }));

  const animatedPencil = useAnimatedStyle(() => ({
    transform: [{ translateX: px.value }]
  }));

  const animatedCheck = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkOpacity.value }]
  }));

  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.loaderGraphic}>
        <View style={{ width: 140, height: 60, flexDirection: 'row', alignItems: 'flex-end' }}>
          {/* Animated Line underneath */}
          <View style={{ position: 'absolute', bottom: 0, left: 20 }}>
            <Svg width="100" height="10" viewBox="0 0 100 10">
              <AnimatedPath
                d="M0 5L100 5"
                stroke={Colors.mint}
                strokeWidth="3"
                strokeDasharray="100"
                animatedProps={animatedProps as any}
              />
            </Svg>
          </View>

          {/* Pencil following the line */}
          <Animated.View style={[{ position: 'absolute', bottom: 5, left: -20 }, animatedPencil]}>
            <DoodlePencil size={60} color={Colors.mint} />
          </Animated.View>

          {/* Check mark at the end */}
          <Animated.View style={[{ position: 'absolute', bottom: 5, left: 120 }, animatedCheck]}>
             <DoodleCheckCircle size={30} color={Colors.mint} />
          </Animated.View>
        </View>
      </View>
      
      <Animated.Text style={styles.loadingText}>Loading...</Animated.Text>
    </View>
  );
};

// ─── 3. Button Loading (Replacement Component) ──────────────────────────────
export const LoadingDots = () => {
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);

  useEffect(() => {
    const animate = (v: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        v.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 300, easing: Easing.out(Easing.ease) }),
            withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
            withTiming(0, { duration: 400 }) // pause
          ),
          -1,
          false
        );
      }, delay);
    };
    animate(d1, 0);
    animate(d2, 150);
    animate(d3, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: d1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: d2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: d3.value }] }));

  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <Animated.View style={s1}><DoodleCircleDot size={8} color="#FFFFFF" /></Animated.View>
      <Animated.View style={s2}><DoodleCircleDot size={8} color="#FFFFFF" /></Animated.View>
      <Animated.View style={s3}><DoodleCircleDot size={8} color="#FFFFFF" /></Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: '#E8FAF7',
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D4EDE8',
    width: '100%',
    minHeight: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#D4EDE8',
    borderRadius: 6,
    width: '80%',
    marginBottom: 8,
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  loaderGraphic: {
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: Fonts.accent,
    fontSize: 24,
    color: Colors.textMuted,
  }
});
