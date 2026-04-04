import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { apiData } from '@/lib/api';
import {
  KlassoAvatar, KlassoBadge, KlassoButton,
  DoodleSparkle, DoodleCheckCircle, DoodleStar, DoodleBook,
  DoodleStarburst, DoodleLightbulb, DoodleArrow, DoodleRuler,
  DoodleWave, DoodleFlower, DoodleCircleDot,
  Colors, Fonts, retroShadow, Radius,
} from '@/src/components';

// ─── Constants ─────────────────────────────────────────────────────────────
const HEADER_MAX = 240;
const HEADER_MIN = 80;
const TABS = ['Overview', 'Attendance', 'Grades', 'Messages'];

const TEACHER_MESSAGES = [
  {
    id: '1', name: 'Mrs. D\'Souza', subject: 'English', initials: 'DD',
    lastMsg: 'Arjun\'s project was excellent this week!',
    time: '2h ago', unread: 0, online: false,
  },
  {
    id: '2', name: 'Mr. Sharma', subject: 'Mathematics', initials: 'RS',
    lastMsg: 'Please remind him to submit the worksheet.',
    time: '1d ago', unread: 2, online: true,
  },
  {
    id: '3', name: 'Ms. Kapoor', subject: 'Science', initials: 'SK',
    lastMsg: 'Science fair registration closes on Friday.',
    time: '2d ago', unread: 0, online: false,
  },
];

const UPCOMING_DATES = [
  { day: '07', month: 'Apr', event: 'Math Unit Test', type: 'Test' },
  { day: '11', month: 'Apr', event: 'Parent-Teacher Meet', type: 'PTM' },
  { day: '14', month: 'Apr', event: 'Ambedkar Jayanti', type: 'Holiday' },
  { day: '22', month: 'Apr', event: 'Science Fair', type: 'Exam' },
];

const ATTENDANCE_MONTHS = [
  { month: 'Jan', pct: 96 }, { month: 'Feb', pct: 88 }, { month: 'Mar', pct: 91 },
];

const GRADES = [
  { subject: 'Mathematics', grade: 'B+', pct: 87, color: Colors.mint },
  { subject: 'Science', grade: 'A', pct: 92, color: Colors.purple },
  { subject: 'English', grade: 'A+', pct: 96, color: Colors.coral },
  { subject: 'History', grade: 'B', pct: 80, color: Colors.yellow },
  { subject: 'PE', grade: 'A', pct: 91, color: Colors.mintDark },
];

// ─── Tiny student-at-desk illustration ─────────────────────────────────────
const StudentAtDesk = () => (
  <Svg width={100} height={80} viewBox="0 0 100 80" fill="none">
    {/* Sparkles */}
    <Circle cx={72} cy={12} r={3} fill={Colors.yellow} opacity={0.8} />
    <Circle cx={82} cy={22} r={2} fill={Colors.yellow} opacity={0.6} />
    <Circle cx={65} cy={20} r={2} fill={Colors.coral} opacity={0.5} />
    {/* Desk */}
    <Rect x={20} y={48} width={60} height={6} rx={2} fill={Colors.mintDark} fillOpacity={0.4} stroke={Colors.mintDark} strokeWidth={1.5} />
    {/* Desk legs */}
    <Rect x={24} y={54} width={4} height={16} rx={2} fill={Colors.mintDark} fillOpacity={0.3} />
    <Rect x={72} y={54} width={4} height={16} rx={2} fill={Colors.mintDark} fillOpacity={0.3} />
    {/* Open book on desk */}
    <Path d="M38 36 Q50 32 50 36 Q50 32 62 36 L62 48 Q50 44 50 48 Q50 44 38 48 Z" fill="white" stroke={Colors.mint} strokeWidth={1.2} />
    <Path d="M50 36 L50 48" stroke={Colors.mint} strokeWidth={1} />
    {/* Body */}
    <Rect x={42} y={20} width={16} height={20} rx={4} fill={Colors.mint} fillOpacity={0.5} stroke={Colors.mint} strokeWidth={1.5} />
    {/* Head */}
    <Circle cx={50} cy={14} r={9} fill={Colors.yellowLight} stroke={Colors.yellow} strokeWidth={1.5} />
    {/* Face */}
    <Circle cx={47} cy={13} r={1.2} fill={Colors.textPrimary} />
    <Circle cx={53} cy={13} r={1.2} fill={Colors.textPrimary} />
    <Path d="M47 17 Q50 19 53 17" stroke={Colors.textPrimary} strokeWidth={1} strokeLinecap="round" fill="none" />
    {/* Arms */}
    <Path d="M42 28 L32 38" stroke={Colors.mint} strokeWidth={3} strokeLinecap="round" />
    <Path d="M58 28 L68 34" stroke={Colors.mint} strokeWidth={3} strokeLinecap="round" />
  </Svg>
);

// ─── Circular progress ──────────────────────────────────────────────────────
const CircularProgress = ({ pct, size = 80, color = Colors.mint }: { pct: number; size?: number; color?: string }) => {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDash = circumference * (pct / 100);

  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={Colors.border} strokeWidth={8} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={`${strokeDash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

// ─── Collapsible Hero Header ────────────────────────────────────────────────
const HeroHeader = ({ scrollY, insetTop, data }: { scrollY: Animated.Value; insetTop: number; data: any }) => {
  const height = scrollY.interpolate({
    inputRange: [0, HEADER_MAX - HEADER_MIN],
    outputRange: [HEADER_MAX, HEADER_MIN],
    extrapolate: 'clamp',
  });
  const detailOpacity = scrollY.interpolate({
    inputRange: [0, (HEADER_MAX - HEADER_MIN) * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const collapsedOpacity = scrollY.interpolate({
    inputRange: [(HEADER_MAX - HEADER_MIN) * 0.7, HEADER_MAX - HEADER_MIN],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.heroHeader, { height, paddingTop: insetTop + 10 }]}>
      {/* ── Expanded State ── */}
      <Animated.View style={[{ opacity: detailOpacity }, styles.heroExpanded]}>
        {/* BG starburst */}
        <View style={styles.heroHeaderStarburst} pointerEvents="none">
          <DoodleStarburst size={90} color={Colors.mint} />
        </View>

        {/* Student Illustration */}
        <View style={styles.heroIllustration}>
          <StudentAtDesk />
          {/* Extra sparkles floating */}
          <View style={{ position: 'absolute', top: 0, left: 10, opacity: 0.7 }}>
            <DoodleSparkle size={16} color={Colors.yellow} />
          </View>
          <View style={{ position: 'absolute', top: 8, right: 8, opacity: 0.6 }}>
            <DoodleSparkle size={12} color={Colors.coral} />
          </View>
        </View>

        {/* Left Text */}
        <View style={styles.heroExpandedText}>
          <Text style={styles.heroName}>{data?.student?.name}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            <KlassoBadge label={data?.student?.class_name || 'Class'} color="mint" />
            <KlassoBadge label={data?.student?.section || 'Section'} color="gray" />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <DoodleCheckCircle size={14} color={Colors.mint} />
            <Text style={styles.heroLastSeen}>Last seen: Today</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Collapsed State ── */}
      <Animated.View style={[styles.heroCollapsed, { opacity: collapsedOpacity }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <KlassoAvatar name={data?.student?.name || 'Student'} size={36} />
        <View>
          <Text style={styles.collapsedName}>{data?.student?.name}</Text>
          <KlassoBadge label={`${data?.student?.class_name} · ${data?.student?.section}`} color="mint" />
        </View>
      </Animated.View>

      {/* Back button (expanded state) */}
      <Animated.View style={[styles.expandedBack, { opacity: detailOpacity }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Tab Navigator ──────────────────────────────────────────────────────────
const TabNav = ({ active, onChange }: { active: string; onChange: (t: string) => void }) => (
  <View style={styles.tabNav}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
      {TABS.map(tab => (
        <TouchableOpacity key={tab} onPress={() => onChange(tab)} style={styles.tabItem}>
          <Text style={[styles.tabText, active === tab && styles.tabTextActive]}>{tab}</Text>
          {active === tab && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
    <View style={{ paddingHorizontal: 18, paddingTop: 6 }}>
      <DoodleWave size={14} color={Colors.mint} />
    </View>
  </View>
);

// ─── OVERVIEW TAB ──────────────────────────────────────────────────────────
const OverviewTab = ({ data }: { data: any }) => {
  const attendancePct = data?.attendance?.percentage || 0;
  return (
  <View style={styles.tabContent}>
    {/* Performance Snapshot */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.perfScroll} contentContainerStyle={{ gap: 12, paddingHorizontal: 18 }}>
      {/* Attendance Card */}
      <View style={[styles.perfCard, retroShadow(3, 3, Colors.mintDark)]}>
        <View style={styles.perfCardInner}>
          <CircularProgress pct={attendancePct} size={72} color={Colors.mint} />
          <Text style={styles.perfPct}>{attendancePct}%</Text>
        </View>
        <Text style={styles.perfLabel}>Attendance</Text>
        <DoodleCheckCircle size={14} color={Colors.mint} />
      </View>

      {/* Grade Card */}
      <View style={[styles.perfCard, retroShadow(3, 3, Colors.purpleDark), { borderColor: Colors.purple }]}>
        <Text style={styles.perfGradeLetter}>A-</Text>
        <Text style={styles.perfGpaText}>GPA {data?.marks?.cgpa || 'N/A'}</Text>
        <Text style={styles.perfLabel}>Avg Grade</Text>
        <DoodleStar size={14} color={Colors.purple} />
      </View>

      {/* Assignment Card */}
      <View style={[styles.perfCard, retroShadow(3, 3, Colors.coralDark), { borderColor: Colors.coral }]}>
        <Text style={styles.perfGradeLetter}>{data?.pending_assignments?.length || 0}</Text>
        <View style={styles.perfBar}>
          <View style={[styles.perfBarFill, { width: `50%`, backgroundColor: Colors.coral }]} />
        </View>
        <Text style={styles.perfLabel}>Pend. Assign.</Text>
        <DoodleBook size={14} color={Colors.coral} />
      </View>
    </ScrollView>

    {/* AI Insights Card */}
    <View style={[styles.insightCard, retroShadow(4, 4, Colors.mintDark)]}>
      {/* BG starburst */}
      <View style={styles.insightStarburst} pointerEvents="none">
        <DoodleStarburst size={30} color={Colors.mint} />
      </View>

      <View style={styles.insightHeader}>
        <DoodleLightbulb size={24} color={Colors.yellow} />
        <Text style={styles.insightTitle}>Klasso AI Insights</Text>
      </View>

      {[
        'Arjun improved 14% in Math this term',
        'Science attendance dropped last week',
        '2 assignments overdue this week',
      ].map((insight, i) => (
        <View key={i} style={styles.insightRow}>
          <DoodleArrow size={14} color={Colors.mint} />
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      ))}

      <KlassoButton
        label="Generate Full Report"
        variant="primary"
        size="md"
        style={{ alignSelf: 'stretch', marginTop: 14 }}
      />
    </View>

    {/* Upcoming Dates */}
    <View style={[styles.sectionHeader, { paddingHorizontal: 18 }]}>
      <DoodleRuler size={20} color={Colors.yellow} />
      <Text style={styles.sectionTitle}>Coming Up</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 18 }}>
      {UPCOMING_DATES.map((d, i) => (
        <View key={i} style={[styles.dateCard, retroShadow(3, 3, Colors.shadow)]}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateDay}>{d.day}</Text>
            <Text style={styles.dateMonth}>{d.month}</Text>
          </View>
          <View style={styles.dateRight}>
            <Text style={styles.dateEvent}>{d.event}</Text>
            <View style={{ marginTop: 6 }}>
              <KlassoBadge
                label={d.type}
                color={d.type === 'Test' || d.type === 'Exam' ? 'coral' : d.type === 'PTM' ? 'purple' : 'gray'}
              />
            </View>
            {(d.type === 'Test' || d.type === 'Exam') && (
              <View style={{ position: 'absolute', top: -4, right: -4 }}>
                <DoodleSparkle size={14} color={Colors.yellow} />
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
  );
};

// ─── ATTENDANCE TAB ─────────────────────────────────────────────────────────
const AttendanceTab = () => (
  <View style={[styles.tabContent, { paddingHorizontal: 18 }]}>
    <View style={[styles.attendCard, retroShadow(4, 4, Colors.mintDark)]}>
      <CircularProgress pct={94} size={100} color={Colors.mint} />
      <View style={{ marginLeft: 20 }}>
        <Text style={styles.attendPct}>94%</Text>
        <Text style={styles.attendSub}>Overall Attendance</Text>
        <Text style={styles.attendDetail}>172 / 183 days present</Text>
        <KlassoBadge label="Excellent" color="mint" />
      </View>
    </View>

    <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Monthly Breakdown</Text>
    {ATTENDANCE_MONTHS.map((m, i) => (
      <View key={i} style={styles.monthRow}>
        <Text style={styles.monthLabel}>{m.month}</Text>
        <View style={styles.monthBarBg}>
          <View style={[styles.monthBarFill, { width: `${m.pct}%` }]} />
        </View>
        <Text style={styles.monthPct}>{m.pct}%</Text>
      </View>
    ))}
  </View>
);

// ─── GRADES TAB ─────────────────────────────────────────────────────────────
const GradesTab = () => (
  <View style={[styles.tabContent, { paddingHorizontal: 18 }]}>
    <View style={[styles.gradeHero, retroShadow(4, 4, Colors.purpleDark)]}>
      <View>
        <Text style={styles.gradeLetterLarge}>A-</Text>
        <Text style={styles.gradeGpa}>GPA 3.7 · Term 2</Text>
      </View>
      <DoodleStar size={50} color={Colors.purple} />
    </View>

    <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Subject Breakdown</Text>
    {GRADES.map((g, i) => (
      <View key={i} style={[styles.subjectRow, retroShadow(2, 2, Colors.shadow)]}>
        <View style={[styles.subjectDot, { backgroundColor: g.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.subjectName}>{g.subject}</Text>
          <View style={styles.subjectBarBg}>
            <View style={[styles.subjectBarFill, { width: `${g.pct}%`, backgroundColor: g.color }]} />
          </View>
        </View>
        <Text style={[styles.subjectGrade, { color: g.color }]}>{g.grade}</Text>
      </View>
    ))}
  </View>
);

// ─── MESSAGES TAB ──────────────────────────────────────────────────────────
const MessagesTab = () => {
  const [chatOpen, setChatOpen] = useState<typeof TEACHER_MESSAGES[0] | null>(null);
  const [message, setMessage] = useState('');

  if (chatOpen) {
    return (
      <View style={styles.chatView}>
        {/* Chat header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setChatOpen(null)} style={styles.backBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <KlassoAvatar name={chatOpen.name} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatTeacherName}>{chatOpen.name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <KlassoBadge label={chatOpen.subject} color="purple" />
              <Text style={styles.chatOnline}>
                {chatOpen.online ? '● Online' : 'Online 2h ago'}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView style={styles.chatBody} contentContainerStyle={{ padding: 16, gap: 12 }}>
          <View style={styles.chatBubbleTeacher}>
            <Text style={styles.chatBubbleText}>{chatOpen.lastMsg}</Text>
          </View>
          <View style={styles.chatBubbleParent}>
            <Text style={[styles.chatBubbleText, { color: 'white' }]}>Thank you for the update! We'll make sure he submits it.</Text>
          </View>
          <Text style={styles.chatTimestamp}>2h ago · Read</Text>
        </ScrollView>

        {/* Input */}
        <View style={styles.chatInputRow}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textLight}
            style={styles.chatInput}
          />
          <TouchableOpacity style={styles.chatSendBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.tabContent, { paddingHorizontal: 18 }]}>
      {TEACHER_MESSAGES.map(t => (
        <TouchableOpacity
          key={t.id}
          onPress={() => setChatOpen(t)}
          activeOpacity={0.85}
          style={[styles.teacherCard, retroShadow(3, 3, Colors.shadow)]}
        >
          {/* Corner doodle */}
          <View style={styles.teacherCardDoodle} pointerEvents="none">
            <DoodleFlower size={18} color={Colors.mint} />
          </View>

          <View style={styles.teacherCardTop}>
            <KlassoAvatar name={t.name} size={42} online={t.online} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.teacherName}>{t.name}</Text>
              <KlassoBadge label={t.subject} color="purple" />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <KlassoButton label="Message" variant="ghost" size="sm" onPress={() => setChatOpen(t)} />
              {t.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{t.unread}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.teacherLastMsg} numberOfLines={1}>{t.lastMsg}</Text>
          <Text style={styles.teacherTime}>{t.time}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── MAIN SCREEN ───────────────────────────────────────────────────────────
export default function ChildOverview() {
  const insets = useSafeAreaInsets();
  const { childId } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const scrollY = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (childId) {
      apiData(`/api/analytics/student/${childId}`).then(setData).catch(console.warn);
    }
  }, [childId]);

  if (!data) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'Overview':   return <OverviewTab data={data} />;
      case 'Attendance': return <AttendanceTab />;
      case 'Grades':     return <GradesTab />;
      case 'Messages':   return <MessagesTab />;
      default:           return <OverviewTab data={data} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Collapsible Hero */}
      <HeroHeader scrollY={scrollY} insetTop={insets.top} data={data} />

      {/* Sticky Tab Nav */}
      <TabNav active={activeTab} onChange={setActiveTab} />

      {/* Scrollable Tab Content */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      >
        {renderTab()}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Hero header
  heroHeader: {
    backgroundColor: '#E8FAF7',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  heroExpanded: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  heroHeaderStarburst: {
    position: 'absolute',
    right: 20,
    top: 20,
    opacity: 0.2,
  },
  heroIllustration: {
    position: 'relative',
  },
  heroExpandedText: {
    flex: 1,
    paddingBottom: 16,
  },
  heroName: {
    fontFamily: Fonts.headingXB,
    fontSize: 24,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  heroLastSeen: {
    fontFamily: Fonts.accent,
    fontSize: 13,
    color: Colors.textMuted,
  },
  heroCollapsed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: '#E8FAF7',
  },
  collapsedName: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  expandedBack: {
    position: 'absolute',
    top: 60,
    left: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...retroShadow(2, 2, Colors.shadow),
  },

  // Tab nav
  tabNav: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsRow: {
    paddingHorizontal: 18,
    gap: 4,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  tabTextActive: {
    fontFamily: Fonts.heading,
    color: Colors.mint,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.mint,
  },

  // Tab content
  tabContent: {
    gap: 16,
    paddingBottom: 20,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: Colors.textPrimary,
  },

  // Performance cards
  perfScroll: {
    marginBottom: 4,
  },
  perfCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.mint,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  perfCardInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfPct: {
    position: 'absolute',
    fontFamily: Fonts.headingXB,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  perfGradeLetter: {
    fontFamily: Fonts.headingXB,
    fontSize: 36,
    color: Colors.textPrimary,
    lineHeight: 44,
  },
  perfGpaText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  perfLabel: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textMuted,
  },
  perfBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  perfBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // AI Insights
  insightCard: {
    backgroundColor: '#E8FAF7',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.mint,
    padding: 18,
    marginHorizontal: 18,
    position: 'relative',
    gap: 10,
  },
  insightStarburst: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.15,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  insightText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },

  // Upcoming dates
  dateCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    width: 180,
  },
  dateBlock: {
    backgroundColor: Colors.coral,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dateDay: {
    fontFamily: Fonts.headingXB,
    fontSize: 22,
    color: 'white',
  },
  dateMonth: {
    fontFamily: Fonts.accent,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  dateRight: {
    flex: 1,
    padding: 10,
    position: 'relative',
  },
  dateEvent: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textPrimary,
  },

  // Attendance tab
  attendCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.mint,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendPct: {
    fontFamily: Fonts.headingXB,
    fontSize: 32,
    color: Colors.mint,
  },
  attendSub: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  attendDetail: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  monthLabel: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textMuted,
    width: 32,
  },
  monthBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  monthBarFill: {
    height: '100%',
    backgroundColor: Colors.mint,
    borderRadius: 5,
  },
  monthPct: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textPrimary,
    width: 36,
    textAlign: 'right',
  },

  // Grades tab
  gradeHero: {
    backgroundColor: Colors.purpleLight,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.purple,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeLetterLarge: {
    fontFamily: Fonts.headingXB,
    fontSize: 56,
    color: Colors.purple,
    lineHeight: 60,
  },
  gradeGpa: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  subjectRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  subjectDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectName: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subjectBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  subjectGrade: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    width: 36,
    textAlign: 'right',
  },

  // Messages tab — teacher cards
  teacherCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  teacherCardDoodle: {
    position: 'absolute',
    top: -4,
    right: -4,
    opacity: 0.35,
  },
  teacherCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherName: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  teacherLastMsg: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  teacherTime: {
    fontFamily: Fonts.accent,
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: Colors.coral,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: 'white',
  },

  // Chat view
  chatView: {
    flex: 1,
    backgroundColor: '#F7FBF9',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 14,
  },
  chatTeacherName: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  chatOnline: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  chatBody: {
    flex: 1,
  },
  chatBubbleTeacher: {
    backgroundColor: Colors.purpleLight,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.purple,
  },
  chatBubbleParent: {
    backgroundColor: Colors.mint,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  chatBubbleText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  chatTimestamp: {
    fontFamily: Fonts.accent,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  chatSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    ...retroShadow(2, 2, Colors.mintDark),
  },
});
