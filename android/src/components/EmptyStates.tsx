import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, withSpring } from 'react-native-reanimated';
import { Colors, Fonts } from '../theme/colors';
import {
  DoodleCheckCircle,
  DoodleSparkle,
  DoodleCloud,
  DoodleZzz,
  DoodleBook,
  DoodlePencil,
  DoodleArrow,
  DoodleSpeechBubble,
  DoodleLightbulb,
  KlassoButton
} from '@/src/components';

const { width } = Dimensions.get('window');

// ─── Shared Base ────────────────────────────────────────────────────────────
const EmptyStateBase = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => (
  <View style={styles.container}>
    <View style={styles.graphicContainer}>
      {children}
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

// ─── 1. No Homework ─────────────────────────────────────────────────────────
export const EmptyHomework = () => {
  const scale = useSharedValue(0.8);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <EmptyStateBase title="All caught up! ✦" subtitle="No pending homework">
      <Animated.View style={[animatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
        <DoodleCheckCircle size={100} color={Colors.mint} />
        <View style={[styles.sparkle, { top: -10, left: -20 }]}><DoodleSparkle size={20} color={Colors.yellow} /></View>
        <View style={[styles.sparkle, { top: 10, right: -20 }]}><DoodleSparkle size={20} color={Colors.yellow} /></View>
        <View style={[styles.sparkle, { bottom: -10, left: -10 }]}><DoodleSparkle size={20} color={Colors.yellow} /></View>
        <View style={[styles.sparkle, { bottom: 20, right: -30 }]}><DoodleSparkle size={20} color={Colors.yellow} /></View>
      </Animated.View>
    </EmptyStateBase>
  );
};

// ─── 2. No Notifications ────────────────────────────────────────────────────
export const EmptyNotifications = () => {
  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }]
  }));

  return (
    <EmptyStateBase title="All quiet here" subtitle="No new notifications">
      <View style={{ alignItems: 'center' }}>
        <DoodleCloud size={100} color={Colors.purple} />
        <Animated.View style={[animatedStyle, { position: 'absolute', top: -10, right: -10 }]}>
          <DoodleZzz size={40} color={Colors.textMuted} />
        </Animated.View>
      </View>
    </EmptyStateBase>
  );
};

// ─── 3. No Grades Yet ───────────────────────────────────────────────────────
export const EmptyGrades = () => {
  return (
    <EmptyStateBase title="Nothing graded yet" subtitle="Check back after your teacher grades">
      <View style={{ alignItems: 'center', position: 'relative', width: 120, height: 120 }}>
        <View style={{ position: 'absolute', left: 0, bottom: 20 }}>
          <DoodleBook size={100} color={Colors.coral} />
        </View>
        <View style={{ position: 'absolute', right: 0, bottom: 20, transform: [{ rotate: '15deg' }] }}>
          <DoodlePencil size={50} color={Colors.mint} />
        </View>
        <View style={{ position: 'absolute', right: -20, bottom: -40, alignItems: 'center' }}>
          <DoodleArrow size={30} color={Colors.coral} />
          <Text style={{ fontFamily: Fonts.accent, fontSize: 16, color: Colors.coral }}>soon!</Text>
        </View>
      </View>
    </EmptyStateBase>
  );
};

// ─── 4. No Messages ─────────────────────────────────────────────────────────
export const EmptyMessages = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.graphicContainer}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <DoodleSpeechBubble size={90} color={Colors.purple} />
          <View style={{ position: 'absolute' }}>
            <Text style={{ fontFamily: Fonts.accent, fontSize: 24, color: Colors.textMuted, marginTop: -10 }}>
              {dots || ' '}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.title}>No messages yet</Text>
      <Text style={[styles.subtitle, { marginBottom: 24 }]}>Start a conversation with a teacher</Text>
      <KlassoButton label="Message a Teacher" onPress={() => {}} variant="ghost" size="sm" />
    </View>
  );
};

// ─── 5. Offline / No Connection ─────────────────────────────────────────────
export const EmptyOffline = () => {
  const rotation = useSharedValue(0);
  
  const handleTryAgain = () => {
    rotation.value = withTiming(rotation.value + 360, { duration: 500, easing: Easing.linear });
  };

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.graphicContainer, { alignItems: 'center' }]}>
        <DoodleCloud size={80} color={Colors.textMuted} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={{ width: 2, height: 12, backgroundColor: Colors.textLight, borderRadius: 1 }} />
          ))}
        </View>
      </View>
      <Text style={styles.title}>You're offline</Text>
      <Text style={[styles.subtitle, { marginBottom: 24 }]}>Check your connection and try again</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <KlassoButton label="Try Again" onPress={handleTryAgain} variant="primary" />
        <Animated.View style={spinStyle}>
          <DoodleArrow size={24} color={Colors.textMuted} />
        </Animated.View>
      </View>
    </View>
  );
};

// ─── 6. AI Buddy Fresh State ────────────────────────────────────────────────
export const EmptyAIBuddy = () => {
  return (
    <View style={styles.container}>
      <View style={styles.graphicContainer}>
        <DoodleLightbulb size={80} color={Colors.mint} />
        <View style={[styles.sparkle, { top: 0, right: -20 }]}><DoodleSparkle size={20} color={Colors.yellow} /></View>
        <View style={[styles.sparkle, { bottom: 10, left: -20 }]}><DoodleSparkle size={20} color={Colors.yellow} /></View>
      </View>
      <Text style={styles.title}>Ask me anything ✦</Text>
      <View style={{ marginTop: 24, gap: 12, width: '100%' }}>
        {['"Explain photosynthesis to me"', '"Help me with my math homework"', '"Give me a pop quiz on history"'].map((q, i) => (
          <View key={i} style={styles.suggestionSticky}>
            <Text style={styles.suggestionText}>{q}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    maxWidth: width * 0.8, // 80% to give a bit more room, text wrap will constrain 
    alignSelf: 'center',
  },
  graphicContainer: {
    marginBottom: 24,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.accent,
    fontSize: 18, // slightly larger for Caveat to be legible
    color: Colors.textMuted,
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  suggestionSticky: {
    backgroundColor: Colors.yellowLight,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6CF40',
    transform: [{ rotate: '-1deg' }],
  },
  suggestionText: {
    fontFamily: Fonts.accent,
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
  }
});
