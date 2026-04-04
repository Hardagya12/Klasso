import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import { KlassoCard } from './KlassoCard';
import { apiData } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Fonts } from '../../constants/theme';

// Generates a dynamic crest with a colored border and level number inside
const LevelCrest = ({ level, color, size = 48 }: { level: number, color: string, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path 
      d="M50 5 L90 20 L90 60 C90 80 60 95 50 95 C40 95 10 80 10 60 L10 20 Z" 
      fill={color} fillOpacity="0.15" stroke={color} strokeWidth="6" strokeLinejoin="round" 
    />
    <Text 
      style={{
        fontFamily: Fonts.headingXB, 
        fontSize: 36, 
        color: color,
        position: 'absolute',
        top: 0,
        left: 0,
        width: size,
        height: size,
        textAlign: 'center',
        textAlignVertical: 'center',
      }}
    >{level}</Text>
  </Svg>
);

export function ClassXPWidget() {
  const { user } = useAuth();
  const router = useRouter();
  const [xpData, setXpData] = useState<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // We need classId to query XP. If the user object only has studentId, we might need a workaround.
  // Actually, backend /api/xp/class/:classId needs classId directly, but we let's assume we can fetch it via /api/analytics/student or similar.
  // Let's adjust to backend route or assume `user.classId` is populated.
  const classId = (user as any)?.classId;

  useEffect(() => {
    if (!classId) return;
    apiData<any>(`/api/xp/class/${classId}`).then(res => {
       if (res && res.id) setXpData(res);
    }).catch(console.warn);
  }, [classId]);

  useEffect(() => {
     if (xpData?.progressPct) {
        Animated.timing(progressAnim, {
           toValue: xpData.progressPct,
           duration: 800,
           useNativeDriver: false
        }).start();
     }
  }, [xpData]);

  if (!xpData || !classId) return null;

  const levelColors: Record<number, string> = {
     1: Colors.mint,
     2: '#0D9488', // Teal
     3: '#3B82F6', // Blue
     4: '#8B5CF6', // Purple
     5: '#F59E0B'  // Gold
  };
  
  const activeColor = levelColors[xpData.currentLevel] || Colors.mint;
  const progressWidth = progressAnim.interpolate({
     inputRange: [0, 100],
     outputRange: ['0%', '100%']
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/class-xp')}>
      <KlassoCard variant="default" style={[styles.card, { borderColor: activeColor, borderWidth: xpData.currentLevel === 5 ? 2 : 0 }]}>
        
        {/* Top Row: Crest + Details */}
        <View style={styles.topRow}>
          <LevelCrest level={xpData.currentLevel} color={activeColor} />
          
          <View style={styles.titleInfo}>
            <Text style={styles.className}>{xpData.class?.name}-{xpData.class?.section} · {xpData.currentTitle}</Text>
            <Text style={[styles.xpText, { color: activeColor }]}>{xpData.totalXP} XP</Text>
          </View>
        </View>

        {/* Progress Bar Area */}
        <View style={styles.progressContainer}>
           <View style={styles.barTrack}>
             <Animated.View style={[styles.barFill, { backgroundColor: activeColor, width: progressWidth }]} />
           </View>
           <Text style={styles.progressDetail}>
             {xpData.totalXP} / {xpData.xpToNextLevel} XP · Level {xpData.currentLevel + 1}
           </Text>
        </View>

        {/* Recent Events Pills */}
        <View style={styles.eventsRow}>
           {(xpData.events || []).slice(0, 3).map((ev: any, idx: number) => {
             const evColor = ev.type.includes('ATTEND') ? Colors.mint : ev.type.includes('TEST') ? Colors.purple : Colors.coral;
             return (
               <View key={idx} style={styles.eventPill}>
                 <View style={[styles.eventDot, { backgroundColor: evColor }]} />
                 <Text style={styles.eventText} numberOfLines={1}>+{ev.xpEarned} XP</Text>
               </View>
             );
           })}
        </View>
        
        <Text style={styles.seeAll}>See all activity →</Text>
      </KlassoCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  className: {
    fontFamily: Fonts.headingXB,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  xpText: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
  },
  progressContainer: {
    marginBottom: 12,
  },
  barTrack: {
    height: 14,
    backgroundColor: Colors.bg,
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 7,
  },
  progressDetail: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
  },
  eventsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventDot: {
    width: 6, height: 6, borderRadius: 3, marginRight: 6,
  },
  eventText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'right',
  }
});
