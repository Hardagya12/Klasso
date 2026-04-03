import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, ClipPath, Rect, Line } from 'react-native-svg';
import {
  KlassoScreen, KlassoCard, KlassoBadge, KlassoButton,
  DoodleStar, DoodleSparkle, DoodleRocket, DoodleStarburst, DoodleArrow,
  DoodleBook, DoodleLightbulb, DoodleRuler, DoodleFlower, DoodleLeaf, DoodlePencil,
  Colors, Fonts,
} from '@/src/components';

// Custom Wavy Progress Bar component using SVG ClipPath
function WavyProgressBar({ percentage, color, height = 12 }: { percentage: number, color: string, height?: number }) {
  // A simple wavy pattern that we repeat for the clip path
  const waveWidth = 40;
  const numWaves = 10;
  let wavePath = `M0,0`;
  for(let i=0; i<numWaves; i++) {
    wavePath += ` Q${i*waveWidth + waveWidth/4},${height/2} ${i*waveWidth + waveWidth/2},0`;
    wavePath += ` T${(i+1)*waveWidth},0`;
  }
  wavePath += ` L${numWaves*waveWidth},${height} L0,${height} Z`;

  return (
    <View style={{ height, backgroundColor: Colors.bg, borderRadius: height/2, overflow: 'hidden' }}>
      <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

// Doodle line chart
function DoodleLineChart() {
  const points = [
    { x: 10, y: 80, val: 'B' },
    { x: 60, y: 40, val: 'A-' },
    { x: 110, y: 70, val: 'B+' },
    { x: 160, y: 30, val: 'A' },
    { x: 210, y: 20, val: 'A+' },
    { x: 260, y: 50, val: 'A-' },
  ];

  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 5 + Math.random() * 10; // Wobble offset
    pathData += ` Q ${midX} ${midY} ${p2.x} ${p2.y}`;
  }

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height="120" viewBox="0 0 280 120">
        {[20, 50, 80].map(y => (
          <Line key={y.toString()} x1="0" y1={y.toString()} x2="280" y2={y.toString()} stroke={Colors.bg} strokeWidth="2" strokeDasharray="6 6" />
        ))}
        <Path d={pathData} fill="none" stroke={Colors.purple} strokeWidth="4" strokeLinecap="round" />
      </Svg>
      {/* Position stars over the chart (assuming 100% width maps closely to coordinate scale for prototype) */}
      <View style={[StyleSheet.absoluteFill, { overflow: 'visible' }]}>
        {points.map((p, i) => (
          <View key={`star-${i}`} style={{ position: 'absolute', left: `${((p.x / 280) * 100).toFixed(1)}%` as any, top: `${((p.y/120)*100).toFixed(1)}%` as any, marginLeft: -10, marginTop: -10 }}>
            <DoodleStar size={20} color={Colors.yellowDark} />
          </View>
        ))}
      </View>
    </View>
  );
}

// Expandable Subject Card
function SubjectGradeCard({ subject, grade, percent, last, avg, color, IconDoodle }: any) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand}>
      <KlassoCard variant="default" style={styles.subjCard}>
        <View style={styles.subjCardTop}>
          <View style={styles.subjRow}>
            <View style={[styles.subjDot, { backgroundColor: color }]} />
            <Text style={styles.subjTitle}>{subject}</Text>
          </View>
          <View style={[styles.gradePill, { backgroundColor: color + '20', borderColor: color }]}>
            <Text style={[styles.gradePillText, { color }]}>{grade}</Text>
          </View>
        </View>

        <View style={styles.pbContainer}>
          <WavyProgressBar percentage={percent} color={color} height={10} />
          <View style={[styles.percentTag, { left: `${percent}%` }]}>
            <Text style={styles.percentTagText}>{percent}%</Text>
          </View>
        </View>

        <View style={styles.subjCardBottom}>
          <Text style={styles.subjSubtext}>Last assessment: {last} · Avg: {avg}</Text>
        </View>

        <View style={{ position: 'absolute', bottom: 10, right: 10, opacity: 0.2 }}>
          <IconDoodle size={24} color={color} />
        </View>

        {expanded && (
          <View style={styles.expandedArea}>
            <View style={{ height: 1, backgroundColor: Colors.bg, marginVertical: 12 }} />
            <Text style={styles.expandedTitle}>Recent Scores</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              {['Quiz 3', 'Midterm', 'HW 4', 'Project', 'Lab'].map((name, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <Text style={styles.recentScoreText}>{80 + Math.floor(Math.random()*15)}</Text>
                  <Text style={styles.recentNameText}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </KlassoCard>
    </TouchableOpacity>
  );
}

export default function GradesScreen() {
  const insets = useSafeAreaInsets();
  const [term, setTerm] = useState('Term 2');

  const terms = ['Term 1', 'Term 2', 'Term 3'];

  // You can set this to empty [] to test the empty state
  const subjects = [
    { subject: 'Mathematics', grade: 'A', percent: 94, last: 96, avg: 92, color: Colors.mint, icon: DoodleRuler },
    { subject: 'Science', grade: 'B+', percent: 88, last: 85, avg: 89, color: Colors.purple, icon: DoodleLightbulb },
    { subject: 'English', grade: 'A-', percent: 91, last: 92, avg: 90, color: Colors.coral, icon: DoodleBook },
  ];

  return (
    <KlassoScreen noSafeArea>
      {/* ─── HEADER ───────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleWrapper}>
            <DoodleStar size={28} color={Colors.yellowDark} />
            <Text style={styles.headerTitle}>My Grades</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Class 8-A · {term}</Text>

        <View style={styles.termTabs}>
          {terms.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.termTab, term === t && styles.termTabActive]}
              onPress={() => setTerm(t)}
            >
              <Text style={[styles.termTabText, term === t && styles.termTabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {subjects.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyDecor}>
              <View style={{ position: 'absolute', top: -20, left: -20 }}><DoodleSparkle size={20} color={Colors.yellow} /></View>
              <View style={{ position: 'absolute', bottom: 10, right: -30 }}><DoodleSparkle size={30} color={Colors.coral} /></View>
              <View style={{ position: 'absolute', top: 40, right: -15 }}><DoodleSparkle size={15} color={Colors.mint} /></View>
              <DoodleBook size={100} color={Colors.mint} />
            </View>
            <Text style={styles.emptyTitle}>No grades yet</Text>
            <Text style={styles.emptySubtitle}>Your teacher hasn't posted any yet</Text>
          </View>
        ) : (
          <>
            {/* ─── OVERALL GPA HERO CARD ───────────────── */}
            <KlassoCard variant="mint" style={styles.heroCard}>
              <View style={styles.heroDecor}>
                <View style={{ position: 'absolute', top: -10, right: 10, opacity: 0.2 }}><DoodleStarburst size={50} color={Colors.mint} /></View>
                <View style={{ position: 'absolute', top: 20, left: '50%' }}><DoodleSparkle size={16} color={Colors.yellow} /></View>
                <View style={{ position: 'absolute', bottom: 10, left: '40%' }}><DoodleSparkle size={24} color={Colors.yellow} /></View>
                <View style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.3 }}><DoodleRocket size={40} color={Colors.coral} /></View>
              </View>

              <View style={styles.heroContent}>
                <Text style={styles.heroGrade}>A+</Text>
                <View style={styles.heroRight}>
                  <Text style={styles.heroGpaText}>GPA 3.8</Text>
                  <View style={styles.gpaBarTrack}>
                    <View style={styles.gpaBarFill} />
                  </View>
                  <Text style={styles.heroRankText}>Top 12% of class</Text>
                </View>
              </View>
            </KlassoCard>

            {/* ─── SUBJECT CARDS ───────────────────────── */}
            <View style={styles.subjectList}>
              {subjects.map((sub, i) => (
                <SubjectGradeCard key={i} {...sub} IconDoodle={sub.icon} />
              ))}
            </View>

            {/* ─── GRADE TREND CHART ───────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance over time</Text>
              <DoodleSparkle size={20} color={Colors.yellowDark} />
            </View>
            
            <View style={styles.chartWrapper}>
              <View style={styles.chartSwitchRow}>
                <KlassoBadge label="Math" color="mint" />
                <Text style={styles.chartMuted}>Sci</Text>
                <Text style={styles.chartMuted}>Eng</Text>
              </View>
              <DoodleLineChart />
            </View>

            {/* ─── UPCOMING ASSESSMENTS ────────────────── */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Coming Up</Text>
              <DoodleArrow size={24} color={Colors.coral} />
            </View>

            {[
              { date: '14', month: 'Apr', subj: 'Science', test: 'Midterm Exam', syllabus: 'Ch 3-5' },
              { date: '18', month: 'Apr', subj: 'English', test: 'Poetry Essay', syllabus: 'Sonnet 18' },
            ].map((item, i) => (
              <View key={i} style={styles.upcomingCard}>
                <View style={styles.upcomingDate}>
                  <Text style={styles.upDateNum}>{item.date}</Text>
                  <Text style={styles.upDateMo}>{item.month}</Text>
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upSubj}>{item.subj} · {item.test}</Text>
                  <Text style={styles.upSyllabus}>Syllabus: {item.syllabus}</Text>
                </View>
                <View style={{ position: 'absolute', top: 5, right: 5, opacity: 0.5 }}>
                  <DoodlePencil size={18} color={Colors.coral} />
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F7FBF9',
    paddingHorizontal: 24,
    paddingBottom: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Fonts.accent,
    fontSize: 18,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  termTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: -2,
  },
  termTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomWidth: 0,
  },
  termTabActive: {
    backgroundColor: 'white',
    borderColor: Colors.border,
  },
  termTabText: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textMuted,
  },
  termTabTextActive: {
    color: Colors.textPrimary,
  },
  content: {
    padding: 24,
  },
  heroCard: {
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroDecor: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  heroGrade: {
    fontFamily: Fonts.headingXB,
    fontSize: 64,
    color: 'white',
    textShadowColor: Colors.textPrimary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  heroRight: {
    flex: 1,
  },
  heroGpaText: {
    fontFamily: Fonts.headingXB,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  gpaBarTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  gpaBarFill: {
    width: '95%',
    height: '100%',
    backgroundColor: Colors.yellowDark,
    borderRightWidth: 2,
    borderColor: Colors.textPrimary,
  },
  heroRankText: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: Colors.coral,
    fontWeight: 'bold',
  },
  subjectList: {
    gap: 16,
    marginBottom: 32,
  },
  subjCard: {
    padding: 16,
  },
  subjCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  subjTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  gradePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
  },
  gradePillText: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
  },
  pbContainer: {
    marginBottom: 16,
    paddingRight: 30, // space for drifting tag
  },
  percentTag: {
    position: 'absolute',
    top: -8,
    marginLeft: -15, // center over end of bar
  },
  percentTagText: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  subjCardBottom: {
    marginTop: 4,
  },
  subjSubtext: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  expandedArea: {
    marginTop: 8,
  },
  expandedTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  recentScoreText: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  recentNameText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  chartWrapper: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#1C2B27',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  chartSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  chartMuted: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textMuted,
  },
  chartContainer: {
    height: 120,
  },
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#1C2B27',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  upcomingDate: {
    backgroundColor: Colors.coral,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderColor: Colors.border,
    width: 60,
  },
  upDateNum: {
    fontFamily: Fonts.accent,
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  upDateMo: {
    fontFamily: Fonts.accent,
    fontSize: 14,
    color: 'white',
    marginTop: -4,
  },
  upcomingContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  upSubj: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  upSyllabus: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyStateContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDecor: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.accent,
    fontSize: 18,
    color: Colors.textMuted,
  },
});
