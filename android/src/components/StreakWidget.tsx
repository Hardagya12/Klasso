import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { KlassoCard } from './KlassoCard';
import { apiData as fetchKlassoApi } from '../../lib/api';
import { useAuth as useAuthStore } from '../../contexts/AuthContext';

// Custom Animated Flame SVG
const FlameSVG = ({ size = 48 }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2C12 2 17 8 17 13C17 16.5 14.5 19 12 19C9.5 19 7 16.5 7 13C7 8 12 2 12 2Z" fill="#FF6B6B" />
        <Path d="M12 6C12 6 15 10 15 14C15 16.2 13.5 18 12 18C10.5 18 9 16.2 9 14C9 10 12 6 12 6Z" fill="#FFE566" />
        <Path d="M12 10C12 10 13.5 13 13.5 15.5C13.5 16.9 12.8 17.5 12 17.5C11.2 17.5 10.5 16.9 10.5 15.5C10.5 13 12 10 12 10Z" fill="#1C2B27" />
      </Svg>
    </Animated.View>
  );
};

export default function StreakWidget() {
  const { user } = useAuthStore();
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const studentId = (user as any).studentId || user.id;
    fetchKlassoApi<any>(`/api/streak/student/${studentId}`).then(res => {
      if (res && !res.error) setStreakData(res);
    }).catch();
  }, [user]);

  const currentStreak = streakData?.streak?.currentStreak || 0;
  const longestStreak = streakData?.streak?.longestStreak || 0;

  // Placeholder for last 7 days history if not provided from API correctly.
  // In a real app we'd map over exact dates. Assuming an array of 'P' | 'A' | 'N' for None
  const history = ['P', 'P', 'A', 'P', 'P', 'P', 'today'];

  return (
    <KlassoCard variant="mint" style={styles.container}>
      {/* Left Side */}
      <View style={styles.left}>
        <FlameSVG size={48} />
        <Text style={styles.streakCount}>{currentStreak} day streak</Text>
        <Text style={styles.encouragement}>Keep it up!</Text>
      </View>

      {/* Right Side */}
      <View style={styles.right}>
        <View style={styles.historyRow}>
          {history.map((status, i) => {
            if (status === 'P') {
              return (
                <View key={i} style={[styles.dot, { backgroundColor: '#3ECFB2' }]}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12l5 5l10 -10" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              );
            }
            if (status === 'A') {
              return (
                <View key={i} style={[styles.dot, { backgroundColor: '#FF6B6B' }]}>
                  <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                    <Path d="M6 6l12 12M18 6l-12 12" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
                  </Svg>
                </View>
              );
            }
            if (status === 'today') {
              return (
                <View key={i} style={styles.todayRing}>
                  <View style={[styles.dot, { backgroundColor: '#E8E4D9' }]} />
                </View>
              );
            }
            // Future or unrecorded
            return <View key={i} style={[styles.dot, { backgroundColor: '#E8E4D9' }]} />;
          })}
        </View>
        <Text style={styles.bestStreak}>Best: {longestStreak} days</Text>
      </View>
    </KlassoCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 12,
  },
  left: {
    alignItems: 'center',
  },
  streakCount: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: '#FF6B6B',
    marginTop: 4,
  },
  encouragement: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 18,
    color: '#7A7670',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3ECFB2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestStreak: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#7A7670',
  },
});
