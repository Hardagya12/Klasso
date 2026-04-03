import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { KlassoScreen, KlassoCard, DoodlePencil, Colors, Fonts } from '../src/components';
import { apiData } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function ClassXPScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [xpData, setXpData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const classId = (user as any)?.classId;

  useEffect(() => {
    if (!classId) return;
    apiData<any>(`/api/xp/class/${classId}`).then(res => {
       if (res && res.id) setXpData(res);
    }).catch(console.warn);

    apiData<any>(`/api/xp/class/${classId}/events?limit=20`).then(res => {
       if (res && Array.isArray(res)) setEvents(res);
    }).catch(console.warn);
  }, [classId]);

  if (!xpData) return <KlassoScreen><Text style={{padding: 20}}>Loading...</Text></KlassoScreen>;

  return (
    <KlassoScreen style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontFamily: Fonts.heading, color: Colors.mint, fontSize: 16 }}>← Back</Text>
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Class XP</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <View style={styles.hero}>
           <Svg width={80} height={80} viewBox="0 0 100 100">
             <Path d="M50 5 L90 20 L90 60 C90 80 60 95 50 95 C40 95 10 80 10 60 L10 20 Z" fill={Colors.mint} fillOpacity="0.2" stroke={Colors.mint} strokeWidth="6" />
             <Text style={{fontFamily: Fonts.headingXB, fontSize: 36, color: Colors.mint, position: 'absolute', width: 80, height: 80, textAlign: 'center', textAlignVertical: 'center' }}>{xpData.currentLevel}</Text>
           </Svg>
           <Text style={styles.className}>{xpData.class?.name}-{xpData.class?.section}</Text>
           <Text style={styles.classTitle}>{xpData.currentTitle}</Text>
           
           <View style={styles.progressBar}>
             <View style={[styles.progressFill, { width: `${xpData.progressPct}%` as any }]} />
           </View>
           <Text style={styles.progressText}>{xpData.totalXP} / {xpData.xpToNextLevel} XP to Level {xpData.currentLevel + 1}</Text>
        </View>

        <View style={styles.statsRow}>
           <KlassoCard style={styles.statBox}>
             <Text style={styles.statVal}>{xpData.weeklyXP}</Text>
             <Text style={styles.statLbl}>This Week</Text>
           </KlassoCard>
           <KlassoCard style={styles.statBox}>
             <Text style={styles.statVal}>{xpData.currentLevel}</Text>
             <Text style={styles.statLbl}>Level</Text>
           </KlassoCard>
        </View>

        <Text style={styles.sectionHeader}>Quest Guide</Text>
        <KlassoCard style={styles.questGuide}>
           <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <DoodlePencil size={24} color={Colors.yellow} />
              <Text style={styles.questTitle}>How to earn XP</Text>
           </View>
           <View style={styles.questItem}><Text style={styles.qText}>100% Attendance</Text><Text style={styles.qVal}>+30 XP</Text></View>
           <View style={styles.questItem}><Text style={styles.qText}>{'>'}90% Attendance</Text><Text style={styles.qVal}>+15 XP</Text></View>
           <View style={styles.questItem}><Text style={styles.qText}>Test Avg {'>'} 80%</Text><Text style={styles.qVal}>+100 XP</Text></View>
           <View style={styles.questItem}><Text style={styles.qText}>Teacher Bonus</Text><Text style={styles.qVal}>Variable</Text></View>
        </KlassoCard>

        <Text style={styles.sectionHeader}>Activity Feed</Text>
        <View style={styles.feed}>
           {events.map((ev, i) => (
             <View key={i} style={styles.feedItem}>
               <View style={styles.feedDot} />
               <View style={styles.feedContent}>
                 <Text style={styles.feedDesc}>{ev.description}</Text>
                 <Text style={styles.feedDate}>{new Date(ev.createdAt).toLocaleDateString()}</Text>
               </View>
               <Text style={styles.feedXp}>+{ev.xpEarned}</Text>
             </View>
           ))}
        </View>

      </ScrollView>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    paddingRight: 16,
  },
  headerTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  className: {
    fontFamily: Fonts.headingXB,
    fontSize: 24,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  classTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
    color: Colors.mint,
  },
  progressBar: {
    width: '100%',
    height: 16,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.mint,
  },
  progressText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statVal: {
    fontFamily: Fonts.headingXB,
    fontSize: 28,
    color: Colors.textPrimary,
  },
  statLbl: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  sectionHeader: {
    fontFamily: Fonts.headingXB,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  questGuide: {
    padding: 16,
    marginBottom: 24,
  },
  questTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  questItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg,
  },
  qText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  qVal: {
    fontFamily: Fonts.headingXB,
    fontSize: 15,
    color: Colors.mint,
  },
  feed: {
    marginBottom: 40,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  feedDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.mint,
    marginTop: 6, marginRight: 12,
  },
  feedContent: {
    flex: 1,
  },
  feedDesc: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  feedDate: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  feedXp: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 20,
    color: Colors.mint,
  }
});
