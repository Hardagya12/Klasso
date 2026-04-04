import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Easing, SafeAreaView, Dimensions, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { apiData as api } from "../lib/api";
import { 
  DoodleSparkle, DoodleStar, DoodlePencil, DoodleLightbulb,
  DoodleBook, DoodleStarburst, DoodleRocket, DoodleLeaf
} from "@/src/components"; 
import { KlassoButton } from "@/src/components";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Colors from design system
const COLORS = {
  mint: '#3ECFB2',
  coral: '#FF6B6B',
  dark: '#1C2B27',
  light: '#F7FBF9',
  purple: '#F5F3FF',
  yellow: '#FFFBEB'
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function TimeCapsuleScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);

  const crackAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Ideally fetch from student state, mocking studentId for now.
  const studentId = "current-student-id"; 

  useEffect(() => {
    fetchTimeCapsule();
  }, []);

  const fetchTimeCapsule = async () => {
    try {
      const res = await api<any>(`/timecapsule/student/${studentId}`);
      setData(res);
      playIntro();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const playIntro = () => {
    Animated.sequence([
      Animated.timing(crackAnim, { toValue: 1, duration: 1200, easing: Easing.bounce, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ])
    ]).start(() => {
      setShowIntro(false);
    });
  };

  const shareImage = async () => {
     if (!data?.shareableCardUrl) return Alert.alert("Hold on", "Your shareable card isn't baked yet!");
     
     // NOTE: Replace with your actual backend IP/URL if not local
     const API_BASE_URL = 'http://10.0.2.2:5000'; // Default for Android Emulator to localhost
     const imageUrl = `${API_BASE_URL}${data.shareableCardUrl}`;
     const localUri = `${FileSystem.cacheDirectory}timecapsule.png`;

     try {
       setLoading(true);
       const { uri } = await FileSystem.downloadAsync(imageUrl, localUri);
       
       const isAvailable = await Sharing.isAvailableAsync();
       if (isAvailable) {
         await Sharing.shareAsync(uri);
       } else {
         Alert.alert("Shared", "Image saved to cache, but sharing is unavailable.");
       }
     } catch (err) {
       console.error("Download Error:", err);
       Alert.alert("Oops!", "Failed to download your year-end card.");
     } finally {
       setLoading(false);
     }
  };

  if (loading || !data) {
    return <View style={[styles.container, { justifyContent: 'center' }]}><Text style={styles.loadingText}>Fetching your memories...</Text></View>;
  }

  const { aiNarrative, data: stats } = data;

  if (showIntro) {
    const crackTransform = crackAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -300] });
    return (
      <Animated.View style={[styles.introContainer, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.introTitle}>Your Year In Review</Text>
            <Animated.View style={[styles.capsuleShape, { transform: [{ translateY: crackTransform }] }]}>
              {/* Pseudo Top half */}
            </Animated.View>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} snapToInterval={SCREEN_HEIGHT} decelerationRate="fast">
        
        {/* SECTION 1: HEADLINE CARD */}
        <View style={[styles.page, { backgroundColor: COLORS.mint }]}>
          <Text style={{ fontSize: 120, textAlign: 'center', marginBottom: 20 }}>{aiNarrative.emoji || '🚀'}</Text>
          <Text style={styles.headlineText}>{aiNarrative.headline}</Text>
          <Text style={styles.subtitleText}>Academic Year {stats.academicYear || '2024-25'}</Text>
        </View>

        {/* SECTION 2: ATTENDANCE STORY */}
        <View style={[styles.page, { backgroundColor: COLORS.dark }]}>
          <Text style={[styles.caveatHeader, { color: COLORS.mint }]}>You showed up</Text>
          <Text style={[styles.bigNumber, { color: '#FFF' }]}>{stats.attendance?.overall || 0}%</Text>
          <Text style={[styles.caveatHeader, { color: '#FFF', fontSize: 24 }]}>attended · {stats.attendance?.totalPresent || 0} days</Text>
        </View>

        {/* SECTION 3: GRADE JOURNEY */}
        <View style={[styles.page, { backgroundColor: COLORS.purple }]}>
          <Text style={[styles.caveatHeader, { color: COLORS.coral }]}>Your Academic Journey</Text>
          <View style={styles.gradeCard}>
             <Text style={styles.gradeText}>Exams Taken</Text>
             <Text style={styles.bigNumber}>{stats.grades?.totalExamsTaken || 0}</Text>
          </View>
        </View>

        {/* SECTION 4: FUN STATS */}
        <View style={[styles.page, { backgroundColor: COLORS.yellow }]}>
          <Text style={[styles.caveatHeader, { color: '#B45309' }]}>Fun Facts About Your Year</Text>
          <View style={styles.grid}>
             <View style={styles.gridItem}>
               <Text style={styles.gridVal}>{stats.aiChats}</Text>
               <Text style={styles.gridLabel}>AI Sessions</Text>
             </View>
             <View style={styles.gridItem}>
               <Text style={styles.gridVal}>{stats.quests?.completed || 0}</Text>
               <Text style={styles.gridLabel}>Quests</Text>
             </View>
             <View style={styles.gridItem}>
               <Text style={styles.gridVal}>{stats.badges?.length || 0}</Text>
               <Text style={styles.gridLabel}>Badges</Text>
             </View>
             <View style={styles.gridItem}>
               <Text style={styles.gridVal}>{Math.floor(Math.random() * 10) + 1}</Text>
               <Text style={styles.gridLabel}>Duel Wins</Text>
             </View>
          </View>
        </View>

        {/* SECTION 5: AI HIGHLIGHTS */}
        <View style={[styles.page, { backgroundColor: '#FFF' }]}>
           <View style={styles.quoteCard}>
              <Text style={styles.growthStory}>{aiNarrative.growthStory}</Text>
           </View>
           <View style={[styles.quoteCard, { backgroundColor: COLORS.mint, marginTop: 20 }]}>
              <Text style={[styles.growthStory, { color: COLORS.dark }]}>" {aiNarrative.teacherNote} "</Text>
           </View>
        </View>

        {/* SECTION 6: SHARE CARD */}
        <View style={[styles.page, { backgroundColor: COLORS.mint, justifyContent: 'center' }]}>
           <Text style={styles.headlineText}>Save the Memories</Text>
           <View style={styles.cardPreviewPlaceholder}>
              <Text style={{ fontFamily: 'Nunito', fontSize: 20, color: '#A1A1AA', textAlign: 'center' }}>[ Time Capsule Image ]</Text>
           </View>
           <TouchableOpacity style={styles.btnShare} onPress={shareImage}>
              <Text style={styles.btnShareText}>Download & Share</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={[styles.btnShare, { backgroundColor: '#E8FAF7', marginTop: 16 }]} onPress={() => router.back()}>
              <Text style={[styles.btnShareText, { color: COLORS.dark }]}>Back to Dash</Text>
           </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    fontFamily: 'Nunito',
    fontSize: 20,
    textAlign: 'center'
  },
  introContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center'
  },
  introTitle: {
    color: '#FFF',
    fontFamily: 'Nunito',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 40
  },
  capsuleShape: {
    width: 100,
    height: 150,
    backgroundColor: COLORS.mint,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.coral
  },
  page: {
    height: SCREEN_HEIGHT,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: {
    fontFamily: 'Nunito',
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 44
  },
  subtitleText: {
    fontFamily: 'Caveat',
    fontSize: 24,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 10
  },
  caveatHeader: {
    fontFamily: 'Caveat',
    fontSize: 32,
    marginBottom: 20
  },
  bigNumber: {
    fontFamily: 'Nunito',
    fontSize: 90,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  gridItem: {
    width: '45%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.dark,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  gridVal: {
    fontFamily: 'Nunito',
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.mint
  },
  gridLabel: {
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 8
  },
  gradeCard: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  gradeText: {
    fontFamily: 'Nunito',
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark
  },
  quoteCard: {
    backgroundColor: COLORS.coral,
    padding: 30,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.dark,
    width: '100%',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    transform: [{ rotate: '-1deg' }]
  },
  growthStory: {
    fontFamily: 'Nunito',
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 30
  },
  btnShare: {
    backgroundColor: COLORS.coral,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.dark,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  btnShareText: {
    fontFamily: 'Nunito',
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF'
  },
  cardPreviewPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E8FAF7',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    borderStyle: 'dashed'
  }
});
