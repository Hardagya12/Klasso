import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Svg, { Path, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { KlassoCard } from './KlassoCard';

const PodiumSVG = ({ rank, size = 60 }: { rank: 1 | 2 | 3; size?: number }) => {
  const colors = {
    1: '#FFD700', // Gold
    2: '#E3E8E9', // Silver
    3: '#E6B88A'  // Bronze
  };
  const color = colors[rank] || '#E8E4D9';
  const height = rank === 1 ? 80 : rank === 2 ? 60 : 40;

  return (
    <Svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
      <Rect x="0" y="0" width={size} height={height} fill={color} rx="4" />
      <SvgText x={size/2} y={height/2 + 5} fill="#2C2A24" fontSize="24" fontFamily="Nunito_800ExtraBold" textAnchor="middle">
        {rank}
      </SvgText>
    </Svg>
  );
};

export default function Leaderboard({ data, currentStudentId }: { data: any[]; currentStudentId: string }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No active streaks yet!</Text>
      </View>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  // Pad top3 to ensure we don't crash
  const getRank = (rank: number) => top3[rank - 1] || null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Podium Section */}
      <View style={styles.podiumContainer}>
        {/* 2nd Place */}
        {getRank(2) && (
          <View style={[styles.podiumCol, { marginTop: 40 }]}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: getRank(2).avatar_url || 'https://via.placeholder.com/50' }} style={styles.avatar} />
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{getRank(2).name}</Text>
            <Text style={styles.podiumStreak}>{getRank(2).current_streak} 🔥</Text>
            <View style={styles.podiumBlock}>
              <View style={[styles.block, { height: 60, backgroundColor: '#E3E8E9' }]}><Text style={styles.rankNum}>2</Text></View>
            </View>
          </View>
        )}

        {/* 1st Place */}
        {getRank(1) && (
          <View style={[styles.podiumCol, { zIndex: 10 }]}>
            <Svg width={30} height={30} viewBox="0 0 24 24" style={styles.crown}>
              <Path d="M2.5 19h19v2h-19v-2zm18-12.5l-4 3.5-4.5-5.5-4.5 5.5-4-3.5 3 10.5h11l3-10.5z" fill="#FFD700" stroke="#2C2A24" strokeWidth="1.5" />
            </Svg>
            <View style={[styles.avatarWrap, styles.avatarWrapFirst]}>
              <Image source={{ uri: getRank(1).avatar_url || 'https://via.placeholder.com/60' }} style={styles.avatarFirst} />
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{getRank(1).name}</Text>
            <Text style={styles.podiumStreak}>{getRank(1).current_streak} 🔥</Text>
            <View style={styles.podiumBlock}>
              <View style={[styles.block, { height: 90, backgroundColor: '#FFD700' }]}><Text style={styles.rankNum}>1</Text></View>
            </View>
          </View>
        )}

        {/* 3rd Place */}
        {getRank(3) && (
          <View style={[styles.podiumCol, { marginTop: 60 }]}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: getRank(3).avatar_url || 'https://via.placeholder.com/50' }} style={styles.avatar} />
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{getRank(3).name}</Text>
            <Text style={styles.podiumStreak}>{getRank(3).current_streak} 🔥</Text>
            <View style={styles.podiumBlock}>
              <View style={[styles.block, { height: 40, backgroundColor: '#E6B88A' }]}><Text style={styles.rankNum}>3</Text></View>
            </View>
          </View>
        )}
      </View>

      {/* Rest of the List */}
      <View style={styles.listContainer}>
        {rest.map((student: any, i: number) => {
          const rank = i + 4;
          const isMe = student.student_id === currentStudentId;
          
          return (
            <View key={student.student_id} style={[styles.row, isMe && styles.rowMe]}>
              <Text style={styles.rowRank}>{rank}</Text>
              <Image source={{ uri: student.avatar_url || 'https://via.placeholder.com/40' }} style={styles.rowAvatar} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{isMe ? 'You' : student.name}</Text>
              </View>
              <View style={styles.rowStats}>
                <Text style={styles.rowStreak}>{student.current_streak} 🔥</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    color: '#7A7670',
    fontSize: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 250,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  crown: {
    position: 'absolute',
    top: -24,
    zIndex: 2,
  },
  avatarWrap: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2C2A24',
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  avatar: { width: 46, height: 46 },
  avatarWrapFirst: {
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  avatarFirst: { width: 64, height: 64 },
  podiumName: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 16,
    color: '#2C2A24',
  },
  podiumStreak: {
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FF8C42',
    fontSize: 14,
    marginBottom: 8,
  },
  podiumBlock: {
    width: '100%',
    paddingHorizontal: 4,
  },
  block: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#2C2A24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: '#2C2A24',
    opacity: 0.5,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF5',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E4D9',
    marginBottom: 12,
  },
  rowMe: {
    backgroundColor: '#E6F8F3', // Light mint
    borderColor: '#3ECFB2',
  },
  rowRank: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 20,
    color: '#7A7670',
    width: 30,
    textAlign: 'center',
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E4D9',
    marginHorizontal: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#2C2A24',
  },
  rowStats: {
    alignItems: 'flex-end',
  },
  rowStreak: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#FF8C42',
  }
});
