import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  KlassoScreen, StatCard, KlassoCard, KlassoBadge, KlassoButton, KlassoAvatar,
  DoodleCheckCircle, DoodleStar, DoodlePencil, DoodleBook, DoodleLeaf, DoodleLightbulb,
  Colors, Fonts,
} from '@/src/components';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KlassoScreen noSafeArea>
      {/* ─── CURVED HEADER ───────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ position: 'absolute', top: 10, right: -10, opacity: 0.15 }}>
          <DoodleLeaf size={110} color="white" />
        </View>

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Aarav Patel ✨</Text>
          </View>
          <KlassoAvatar name="Aarav Patel" size={48} online />
        </View>

        <Text style={styles.quote}>"Ready to learn something new today?"</Text>
      </View>

      {/* ─── STAT CARDS (outside ScrollView to avoid clipping) ── */}
      <View style={styles.statContainer}>
        <StatCard label="Attendance" value="94%" statType="attendance" style={{ flex: 1 }} />
        <StatCard label="Avg Grade" value="A-" statType="grade" style={{ flex: 1 }} />
        <StatCard label="Day Streak" value="🔥 7" statType="streak" sublabel="Keep it up!" style={{ flex: 1 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ─── UPCOMING TIMETABLE ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See auto timetable</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
          <KlassoCard variant="mint" size="md" style={styles.hCard}>
            <Text style={styles.subject}>Mathematics</Text>
            <Text style={styles.timeInfo}>09:00 AM — Room 102</Text>
            <View style={styles.hCardFooter}>
              <KlassoBadge label="Next" color="mint" />
              <DoodlePencil size={24} color={Colors.mint} />
            </View>
          </KlassoCard>
          
          <KlassoCard variant="purple" size="md" style={styles.hCard}>
            <Text style={styles.subject}>Science</Text>
            <Text style={styles.timeInfo}>10:15 AM — Lab B</Text>
            <View style={styles.hCardFooter}>
              <KlassoBadge label="Later" color="gray" />
              <DoodleLightbulb size={24} color={Colors.purple} />
            </View>
          </KlassoCard>
        </ScrollView>

        {/* ─── DUE SOON ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Due Soon</Text>
          <TouchableOpacity><Text style={styles.seeAll}>View all 3</Text></TouchableOpacity>
        </View>

        <KlassoCard variant="default" style={styles.mb}>
          <View style={styles.taskItem}>
            <View style={[styles.taskDot, { backgroundColor: Colors.yellow }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>History Essay</Text>
              <Text style={styles.taskSubtitle}>Due Tomorrow · History</Text>
            </View>
            <TouchableOpacity style={styles.checkBorder}>
              <Text style={{ color: Colors.border }}>✓</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskItem}>
            <View style={[styles.taskDot, { backgroundColor: Colors.coral }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>Algebra Practice</Text>
              <Text style={styles.taskSubtitle}>Due Wed · Mathematics</Text>
            </View>
            <TouchableOpacity style={styles.checkBorder}>
              <Text style={{ color: Colors.border }}>✓</Text>
            </TouchableOpacity>
          </View>
        </KlassoCard>
        
        {/* Parent View shortcut */}
        <TouchableOpacity
          onPress={() => router.push('/parent' as any)}
          style={{ alignItems: 'center', marginTop: 8, marginBottom: 4 }}
        >
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#6B8C82' }}>
            Switch to Parent View →
          </Text>
        </TouchableOpacity>

        {/* Helper Padding for Bottom Tab Bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.mint,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 32,   // creates the overlap zone for stat cards
    position: 'relative',
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  name: {
    fontFamily: Fonts.headingXB,
    fontSize: 26,
    color: 'white',
    letterSpacing: -0.5,
  },
  quote: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: 'white',
    opacity: 0.85,
  },
  statContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -32,            // overlaps into header's paddingBottom
    marginBottom: 16,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 19,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.coral,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  hCard: {
    width: 220,
    padding: 16,
  },
  subject: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  timeInfo: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  hCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mb: {
    marginBottom: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg,
  },
  taskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  taskTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  taskSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  checkBorder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
