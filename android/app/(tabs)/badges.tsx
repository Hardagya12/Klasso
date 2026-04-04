import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { KlassoScreen } from '../../src/components/KlassoScreen';
import BadgeCard from '../../src/components/BadgeCard';
import BadgeUnlockModal from '../../src/components/BadgeUnlockModal';
import Leaderboard from '../../src/components/Leaderboard';
import { apiData as fetchKlassoApi } from '../../lib/api';
import { useAuth as useAuthStore } from '../../contexts/AuthContext';

const TrophySVG = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 21v-4M8 21h8M19 5h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1M5 5H4a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1" stroke="#FFE566" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 3h14v7a7 7 0 0 1-14 0V3z" fill="#FFE566" stroke="#2C2A24" strokeWidth={2} />
  </Svg>
);

const FlameSVG = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C12 2 17 8 17 13C17 16.5 14.5 19 12 19C9.5 19 7 16.5 7 13C7 8 12 2 12 2Z" fill="#FF8C42" />
    <Path d="M12 6C12 6 15 10 15 14C15 16.2 13.5 18 12 18C10.5 18 9 16.2 9 14C9 10 12 6 12 6Z" fill="#FFE566" />
  </Svg>
);

export default function BadgesScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('badges'); // 'badges' | 'leaderboard'
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  
  // Unlock Modal State
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // If we are a student, we load our data. Assuming user object has student_id or class_id if populated.
      // Easiest is just hitting `/api/streak/student/:id` but if user.id is the User ID we need to let the backend resolve studentId,
      // or we pass user.id and let backend resolve. The API req requires `studentId`. Let's pass 'me' which backend could support, or grab user.studentId
      const studentId = (user as any).studentId || user.id; // fallback
      
      const res = await fetchKlassoApi<any>(`/api/streak/student/${studentId}`);
      if (res && !res.error) {
        setStreakData(res);
        
        // Find if any badge is new
        const newBadges = res.badges?.filter((b: any) => b.is_new);
        if (newBadges && newBadges.length > 0) {
          setUnlockedBadge(newBadges[0]);
          setUnlockModalVisible(true);
          
          // Mark seen in background
          fetchKlassoApi<any>('/api/streak/badges/mark-seen', {
            method: 'PATCH',
            body: JSON.stringify({ badgeIds: newBadges.map((b:any) => b.id) })
          });
        }
      }

      if ((user as any).classId) {
        const lbRes = await fetchKlassoApi<any>(`/api/streak/leaderboard/${(user as any).classId}`);
        if (lbRes && !lbRes.error) setLeaderboardData(lbRes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.id])
  );

  const { streak, badges = [], lockedBadges = [], nextBadge } = streakData || {};

  return (
    <KlassoScreen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TrophySVG />
          <Text style={styles.title}>My Badges</Text>
        </View>
        <View style={styles.streakPill}>
          <FlameSVG size={16} />
          <Text style={styles.streakPillText}>{streak?.currentStreak || 0} day streak</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'badges' && styles.activeTab]} 
          onPress={() => setActiveTab('badges')}
        >
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>My Grid</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]} 
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>Class Board</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'badges' ? (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={['#3ECFB2']} />}
        >
          {/* Earned Badges */}
          <Text style={styles.sectionTitle}>Earned Badges ({badges.length})</Text>
          {badges.length === 0 && (
             <Text style={styles.emptyText}>You haven't earned any badges yet. Keep your streak up!</Text>
          )}
          <View style={styles.grid}>
            {badges.map((b: any) => (
              <BadgeCard key={b.id} badge={b} earnedAt={b.earned_at} />
            ))}
          </View>

          {/* Locked Badges */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Locked</Text>
          {nextBadge && (
            <View style={styles.nextBadgeContainer}>
              <Text style={styles.nextBadgeText}>Next Milestone: {nextBadge.badge.name}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (streak?.currentStreak / nextBadge.badge.threshold) * 100)}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{streak?.currentStreak} / {nextBadge.badge.threshold} days</Text>
            </View>
          )}

          <View style={styles.grid}>
            {lockedBadges.map((b: any) => (
              <BadgeCard key={b.id} badge={b} locked={true} earnedAt={null} />
            ))}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.content}>
           <Leaderboard data={leaderboardData} currentStudentId={(user as any)?.studentId || user?.id} />
        </View>
      )}

      <BadgeUnlockModal 
        visible={unlockModalVisible} 
        badge={unlockedBadge} 
        onClose={() => setUnlockModalVisible(false)} 
      />
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: '#2C2A24',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF8C42',
  },
  streakPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#FF8C42',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E8E4D9',
  },
  activeTab: {
    backgroundColor: '#2C2A24',
  },
  tabText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#7A7670',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#2C2A24',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    color: '#7A7670',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  nextBadgeContainer: {
    backgroundColor: '#E6F8F3',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3ECFB2',
    borderStyle: 'dashed',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  nextBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#2C2A24',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#C5F0E6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3ECFB2',
    borderRadius: 6,
  },
  progressLabel: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 14,
    color: '#088D73',
    textAlign: 'right',
  }
});
