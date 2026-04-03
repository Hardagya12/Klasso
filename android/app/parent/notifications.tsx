import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  KlassoBadge, KlassoButton,
  DoodleSparkle, DoodleStar, DoodleBook, DoodleCloud,
  DoodleWave, DoodleDiamond, DoodleStarburst,
  Colors, Fonts, Radius,
} from '@/src/components';

// ─── Bell SVG ───────────────────────────────────────────────────────────────
const DoodleBell = ({ size = 28, color = Colors.mint }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 40 44" fill="none">
    <Path
      d="M20 4C13 4 8 10 8 18v8l-4 4v2h32v-2l-4-4v-8c0-8-5-14-12-14z"
      fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.8} strokeLinejoin="round"
    />
    <Path d="M16 36a4 4 0 008 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Circle cx={28} cy={8} r={5} fill={Colors.coral} />
  </Svg>
);

// ─── Speech Bubble SVG ────────────────────────────────────────────────────────
const DoodleSpeechBubble = ({ size = 18, color = '#B5A8FF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M6 6h28a2 2 0 012 2v18a2 2 0 01-2 2H14l-8 6v-6H6a2 2 0 01-2-2V8a2 2 0 012-2z"
      fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.8} strokeLinejoin="round"
    />
    <Path d="M12 15h16M12 21h10" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

// ─── Pulsing Animated Doodle ─────────────────────────────────────────────────
const PulsingDoodle = ({ children }: { children: React.ReactNode }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={{ transform: [{ scale: pulse }] }}>{children}</Animated.View>;
};

// ─── Filter Pills ─────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Urgent', 'Grades', 'Attendance', 'Messages'];

const FilterPills = ({ active, onChange }: { active: string; onChange: (f: string) => void }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
    {FILTERS.map(f => (
      <TouchableOpacity
        key={f}
        onPress={() => onChange(f)}
        style={[styles.filterPill, active === f && styles.filterPillActive]}
        activeOpacity={0.8}
      >
        <Text style={[styles.filterText, active === f && styles.filterTextActive]}>{f}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ─── Date Divider ─────────────────────────────────────────────────────────────
const DateDivider = ({ label }: { label: string }) => (
  <View style={styles.dateDivider}>
    <DoodleDiamond size={14} color={Colors.mint} />
    <Text style={styles.dateDividerText}>{label}</Text>
    <DoodleDiamond size={14} color={Colors.mint} />
  </View>
);

// ─── TYPE A: Urgent ───────────────────────────────────────────────────────────
const UrgentCard = () => (
  <View style={[styles.notifCard, styles.urgentCard]}>
    <View style={[styles.leftBorder, { backgroundColor: Colors.coral }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTopRow}>
        <PulsingDoodle><DoodleSparkle size={18} color={Colors.coral} /></PulsingDoodle>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.cardTitle}>Absent: Period 3 today</Text>
          <Text style={styles.cardBody2}>Arjun was marked absent for Science, Period 3</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>10:32 AM</Text>
        <KlassoButton label="Call School" variant="ghost" size="sm"
          style={{ borderColor: Colors.coral }} />
      </View>
    </View>
  </View>
);

// ─── TYPE B: Grade ────────────────────────────────────────────────────────────
const GradeCard = () => (
  <View style={[styles.notifCard, styles.gradeCard]}>
    <View style={[styles.leftBorder, { backgroundColor: Colors.mint }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTopRow}>
        <DoodleStar size={18} color={Colors.yellow} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.cardTitle}>New grade: Math Unit Test — 87/100</Text>
          <Text style={styles.cardBody2}>Arjun scored above class average ↑</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>Yesterday 4:15 PM</Text>
        <KlassoButton label="View Grade" variant="ghost" size="sm"
          style={{ borderColor: Colors.mint }} />
      </View>
    </View>
  </View>
);

// ─── TYPE C: Homework ─────────────────────────────────────────────────────────
const HomeworkCard = () => (
  <View style={[styles.notifCard, styles.hwCard]}>
    <View style={[styles.leftBorder, { backgroundColor: Colors.yellow }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTopRow}>
        <DoodleBook size={18} color={Colors.yellowDark} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.cardTitle}>New assignment: English Essay</Text>
          <Text style={styles.cardBody2}>Due Friday, 5th April — 3 days left</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>Yesterday 2:00 PM</Text>
        <KlassoBadge label="3 days left" color="yellow" />
      </View>
    </View>
  </View>
);

// ─── TYPE D: Teacher Message ──────────────────────────────────────────────────
const MessageCard = () => (
  <View style={[styles.notifCard, styles.msgCard]}>
    <View style={[styles.leftBorder, { backgroundColor: '#B5A8FF' }]} />
    <View style={styles.cardBody}>
      <View style={styles.cardTopRow}>
        <DoodleSpeechBubble size={18} color={Colors.purple} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.cardTitle}>Mrs. Sharma sent you a message</Text>
          <Text style={styles.cardBody2} numberOfLines={1}>
            Arjun's project submission was excellent, well done to both of you!
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTime}>Mon 9:00 AM</Text>
        <KlassoButton label="Reply" variant="ghost" size="sm"
          style={{ borderColor: Colors.purple }} />
      </View>
    </View>
  </View>
);

// ─── TYPE E: Achievement ──────────────────────────────────────────────────────
const AchievementCard = () => (
  <View style={[styles.notifCard, styles.achieveCard]}>
    <View style={styles.achieveContent}>
      <View style={styles.achieveIconRow}>
        <View style={{ position: 'absolute', top: -8, left: 20, opacity: 0.6 }}>
          <DoodleSparkle size={14} color={Colors.yellowDark} />
        </View>
        <View style={{ position: 'absolute', top: -8, right: 20, opacity: 0.6 }}>
          <DoodleSparkle size={14} color={Colors.yellowDark} />
        </View>
        <View style={{ position: 'absolute', bottom: -4, left: 10, opacity: 0.5 }}>
          <DoodleSparkle size={12} color={Colors.coral} />
        </View>
        <View style={{ position: 'absolute', bottom: -4, right: 10, opacity: 0.5 }}>
          <DoodleSparkle size={12} color={Colors.coral} />
        </View>
        <DoodleStarburst size={32} color={Colors.yellow} />
      </View>
      <Text style={styles.achieveTitle}>Arjun's attendance streak: 20 days! 🎉</Text>
      <Text style={styles.achieveSub}>Keep up the great work!</Text>
      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareBtnText}>Share →</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <View style={{ position: 'absolute', top: 0, left: 20 }}>
        <DoodleSparkle size={20} color={Colors.mint} />
      </View>
      <View style={{ position: 'absolute', top: 0, right: 20 }}>
        <DoodleSparkle size={16} color={Colors.yellow} />
      </View>
      <View style={{ position: 'absolute', bottom: 10, left: 30 }}>
        <DoodleSparkle size={14} color={Colors.coral} />
      </View>
      <DoodleCloud size={100} color={Colors.mint} />
    </View>
    <Text style={styles.emptyTitle}>You're all caught up!</Text>
    <Text style={styles.emptySub}>No new notifications</Text>
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function Notifications() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [allRead, setAllRead] = useState(false);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <DoodleBell size={28} color={Colors.mint} />
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity onPress={() => setAllRead(true)}>
          <Text style={styles.markRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <FilterPills active={activeFilter} onChange={setActiveFilter} />
      <View style={styles.waveDivider}>
        <DoodleWave size={16} color={Colors.mint} />
        <DoodleWave size={16} color={Colors.mint} />
        <DoodleWave size={16} color={Colors.mint} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeFilter === 'All' || activeFilter === 'Urgent' ? (
          <>
            <DateDivider label="Today" />
            <UrgentCard />
          </>
        ) : null}

        {activeFilter === 'All' || activeFilter === 'Grades' ? (
          <>
            <DateDivider label="Yesterday" />
            <GradeCard />
          </>
        ) : null}

        {activeFilter === 'All' || activeFilter === 'Attendance' ? (
          <>
            {activeFilter === 'All' ? null : <DateDivider label="Yesterday" />}
            <HomeworkCard />
          </>
        ) : null}

        {activeFilter === 'All' || activeFilter === 'Messages' ? (
          <>
            <DateDivider label="This Week" />
            <MessageCard />
          </>
        ) : null}

        {activeFilter === 'All' && (
          <>
            <AchievementCard />
          </>
        )}

        {activeFilter !== 'All' &&
          activeFilter !== 'Urgent' &&
          activeFilter !== 'Grades' &&
          activeFilter !== 'Messages' &&
          activeFilter !== 'Attendance' && (
            <EmptyState />
          )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.textPrimary },
  markRead: { fontFamily: Fonts.accent, fontSize: 16, color: Colors.coral },

  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: Radius.pill, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  filterPillActive: {
    backgroundColor: Colors.mint, borderColor: Colors.mintDark,
  },
  filterText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted },
  filterTextActive: { fontFamily: Fonts.heading, color: Colors.textPrimary },

  waveDivider: {
    flexDirection: 'row', opacity: 0.3,
    paddingHorizontal: 16, marginBottom: 4,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  dateDivider: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    marginVertical: 12,
  },
  dateDividerText: {
    fontFamily: Fonts.accent, fontSize: 15, color: Colors.textMuted,
  },

  // Notif card base
  notifCard: {
    flexDirection: 'row', borderRadius: Radius.md,
    borderWidth: 1.5, overflow: 'hidden',
    marginBottom: 10,
    shadowColor: Colors.shadow, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  leftBorder: { width: 4 },
  cardBody: { flex: 1, padding: 12 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardTitle: {
    fontFamily: Fonts.heading, fontSize: 14, color: Colors.textPrimary, marginBottom: 3,
  },
  cardBody2: {
    fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted, lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  cardTime: { fontFamily: Fonts.accent, fontSize: 13, color: Colors.textMuted },

  // Variants
  urgentCard: { backgroundColor: '#FFF5F5', borderColor: Colors.coralLight },
  gradeCard: { backgroundColor: '#F5FFFD', borderColor: Colors.mintLight },
  hwCard: { backgroundColor: '#FFFDF0', borderColor: Colors.yellowLight },
  msgCard: { backgroundColor: '#F8F7FF', borderColor: Colors.purpleLight },

  // Achievement
  achieveCard: {
    backgroundColor: '#FFFDE0', borderColor: Colors.yellow,
    borderWidth: 1.5, borderRadius: Radius.md, marginBottom: 10,
    shadowColor: Colors.yellowDark, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  achieveContent: { padding: 20, alignItems: 'center' },
  achieveIconRow: { position: 'relative', marginBottom: 12, height: 48, justifyContent: 'center' },
  achieveTitle: {
    fontFamily: Fonts.headingXB, fontSize: 16, color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 4,
  },
  achieveSub: {
    fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted,
    textAlign: 'center', marginBottom: 12,
  },
  shareBtn: { alignSelf: 'flex-end' },
  shareBtnText: { fontFamily: Fonts.heading, fontSize: 14, color: Colors.coral },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyIconWrap: { position: 'relative', marginBottom: 16 },
  emptyTitle: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.textPrimary },
  emptySub: { fontFamily: Fonts.accent, fontSize: 16, color: Colors.textMuted },
});
