import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  SharedValue
} from 'react-native-reanimated';
import { Colors, Fonts, Radius } from '../theme/colors';
import { KlassoCard } from './KlassoCard';
import { DoodleCheckCircle, DoodleSparkle, DoodleStar } from './doodles/index';

const { width, height } = Dimensions.get('window');

// ─── 1. Card Press Micro-Interaction ─────────────────────────────────────────
export const PressableCard = ({ children, onPress, ...cardProps }: any) => {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(8); // approx 4px offset retro shadow

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    elevation: elevation.value,
    shadowOffset: { width: elevation.value / 2, height: elevation.value / 2 },
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { stiffness: 400, damping: 20 });
        elevation.value = withTiming(0, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 400, damping: 20 });
        elevation.value = withTiming(8, { duration: 150 });
      }}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        <KlassoCard {...cardProps}>
          {children}
        </KlassoCard>
      </Animated.View>
    </Pressable>
  );
};

// ─── 2. Attendance Mark Success ─────────────────────────────────────────────
export const AttendanceSuccessOverlay = ({ visible, onDismiss }: { visible: boolean, onDismiss: () => void }) => {
  const flashOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      flashOpacity.value = withSequence(
        withTiming(0.6, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      checkScale.value = withDelay(200, withSequence(
        withSpring(1.2, { damping: 12 }),
        withSpring(1.0, { damping: 15 }),
        withDelay(1200, withTiming(0))
      ));

      textOpacity.value = withDelay(400, withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1000, withTiming(0))
      ));

      burstScale.value = withDelay(250, withTiming(1.5, { duration: 400, easing: Easing.out(Easing.ease) }));
      burstOpacity.value = withDelay(250, withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 300 })
      ));

      setTimeout(() => {
        runOnJS(onDismiss)();
      }, 2000);
    }
  }, [visible]);

  if (!visible) return null;

  const bgStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  
  const createBurstStyle = (index: number) => {
    const angle = (index * 45 * Math.PI) / 180;
    const distance = 80;
    return useAnimatedStyle(() => ({
      position: 'absolute',
      opacity: burstOpacity.value,
      transform: [
        { translateX: Math.cos(angle) * distance * burstScale.value },
        { translateY: Math.sin(angle) * distance * burstScale.value },
        { scale: burstScale.value }
      ]
    }));
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.mint }, bgStyle]} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={checkStyle}>
            <DoodleCheckCircle size={120} color="#FFFFFF" />
          </Animated.View>
          {[0,1,2,3,4,5,6,7].map((i) => (
            <Animated.View key={i} style={createBurstStyle(i)}>
              <DoodleSparkle size={24} color={Colors.yellow} />
            </Animated.View>
          ))}
        </View>
        <Animated.Text style={[styles.attendanceText, textStyle]}>Attendance Marked!</Animated.Text>
      </View>
    </View>
  );
};

// ─── 3. Homework Completion Checkbox ────────────────────────────────────────
export const HomeworkCheckbox = ({ onComplete }: { onComplete?: () => void }) => {
  const [complete, setComplete] = useState(false);
  const strokeProgress = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const starScale = useSharedValue(0);
  const starY = useSharedValue(0);

  const handlePress = () => {
    if (complete) return;
    setComplete(true);
    
    strokeProgress.value = withTiming(1, { duration: 400 });
    checkOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
    
    starScale.value = withDelay(700, withSequence(
      withSpring(1, { stiffness: 200 }),
      withDelay(400, withTiming(0, { duration: 200 }))
    ));
    starY.value = withDelay(700, withTiming(-40, { duration: 600, easing: Easing.out(Easing.ease) }));
    
    if (onComplete) {
      setTimeout(() => onComplete(), 1000);
    }
  };

  const circleStyle = useAnimatedStyle(() => ({
    borderWidth: 2,
    borderColor: strokeProgress.value > 0 ? Colors.mint : Colors.textLight,
    borderStyle: strokeProgress.value < 1 ? 'dashed' : 'solid',
  }));

  const markStyle = useAnimatedStyle(() => ({ opacity: checkOpacity.value }));
  const starStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 4,
    transform: [{ scale: starScale.value }, { translateY: starY.value }]
  }));

  return (
    <Pressable onPress={handlePress} style={styles.homeworkCheckContainer}>
      <Animated.View style={[styles.homeworkCircle, circleStyle]} />
      <Animated.View style={[styles.homeworkMark, markStyle]}>
        <Text style={{ color: Colors.mint, fontWeight: 'bold' }}>✓</Text>
      </Animated.View>
      <Animated.View style={starStyle}>
        <DoodleStar size={20} color={Colors.yellow} />
      </Animated.View>
    </Pressable>
  );
};

// ─── 4. Grade Reveal ────────────────────────────────────────────────────────
export const GradeRevealCard = ({ grade }: { grade: number }) => {
  const scale = useSharedValue(0);
  const displayGrade = useSharedValue(0);
  const [currentGrade, setCurrentGrade] = useState(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.03, { damping: 10 }),
      withSpring(1.0, { damping: 12 })
    );

    displayGrade.value = withTiming(grade, { duration: 500, easing: Easing.out(Easing.ease) });

    const interval = setInterval(() => {
      // Basic count up
      if (displayGrade.value >= grade) {
        setCurrentGrade(grade);
        clearInterval(interval);
      } else {
        setCurrentGrade(Math.floor(displayGrade.value));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [grade]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <KlassoCard variant="mint">
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Text style={{ fontFamily: Fonts.heading, fontSize: 16, color: Colors.textMuted }}>Latest Grade</Text>
          <Text style={{ fontFamily: Fonts.headingXB, fontSize: 48, color: Colors.mintDark }}>{currentGrade}%</Text>
        </View>
        <Animated.View style={{ position: 'absolute', top: -10, right: -10, transform: [{ scale: scale.value }] }}>
          <DoodleStar size={30} color={Colors.yellow} />
        </Animated.View>
      </KlassoCard>
    </Animated.View>
  );
};

// ─── 5. Swipe To Complete Wrapper ─────────────────────────────────────────────
export const SwipeToCompleteCard = ({ children, onComplete }: { children: React.ReactNode, onComplete: () => void }) => {
  const swipeableRef = useRef<Swipeable>(null);
  
  const renderLeftActions = (progress: any, dragX: any) => {
    // Instead of reanimated in V1 style, react-native-gesture-handler v2 provides Animated.SharedValue
    // Actually we can just do a very simple standard reanimated implementation if progress is old Animated.
    // Assuming standard usage works:
    
    return (
      <View style={styles.swipeLeftAction}>
        <View style={{ position: 'absolute', right: 20 }}>
          <DoodleCheckCircle size={40} color="#FFFFFF" />
        </View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableLeftOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => onComplete(), 300);
      }}
      overshootLeft={false}
    >
      <View style={{ backgroundColor: Colors.bg }}>
        {children}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeLeftAction: {
    flex: 1,
    backgroundColor: Colors.mint,
    justifyContent: 'center',
    borderRadius: Radius.md,
    marginVertical: 4,
  },
  attendanceText: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 24,
  },
  homeworkCheckContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeworkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  homeworkMark: {
    position: 'absolute',
  }
});
