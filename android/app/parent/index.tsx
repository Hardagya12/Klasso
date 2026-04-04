import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Pressable, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle, Rect } from 'react-native-svg';
import {
  KlassoAvatar, KlassoBadge, KlassoButton,
  DoodleSparkle, DoodleCheckCircle, DoodleStar, DoodleBook,
  DoodleStarburst, DoodleDiamond, DoodleLightbulb, DoodleCircleDot,
  DoodleArrow, DoodleRuler, DoodleWave, DoodleFlower,
  Colors, Fonts, retroShadow, Radius,
} from '@/src/components';
import { apiData } from '@/lib/api';

// ─── Notification Bell ─────────────────────────────────────────────────────
const NotifBell = () => (
  <View style={{ position: 'relative' }}>
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.7 2 6 4.7 6 8v5l-2 2v1h16v-1l-2-2V8c0-3.3-2.7-6-6-6z"
        fill={Colors.textPrimary}
        fillOpacity={0.08}
        stroke={Colors.textPrimary}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Path d="M9.5 18a2.5 2.5 0 005 0" stroke={Colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
    <View style={styles.notifDot} />
  </View>
);

// ─── Child Switcher Pill ────────────────────────────────────────────────────
const ChildPill = ({
  child, active, onPress,
}: { child: any; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.childPill,
      active
        ? { backgroundColor: Colors.mint, borderColor: Colors.mintDark, ...retroShadow(2, 2, Colors.mintDark) }
        : { backgroundColor: Colors.surface, borderColor: Colors.border },
    ]}
    activeOpacity={0.8}
  >
    <KlassoAvatar name={child.name} size={30} />
    <View style={{ marginLeft: 4 }}>
      <Text style={[styles.pillName, { color: active ? Colors.textPrimary : Colors.textMuted }]}>
        {child.name?.split(' ')[0]}
      </Text>
      <Text style={[styles.pillClass, { color: active ? Colors.textPrimary : Colors.textLight }]}>
        {child.class}
      </Text>
    </View>
  </TouchableOpacity>
);

// ─── Mini Stat Row ─────────────────────────────────────────────────────────
const MiniStat = ({
  icon, value, label,
}: { icon: React.ReactNode; value: string; label: string }) => (
  <View style={styles.miniStatRow}>
    {icon}
    <View style={{ marginLeft: 6 }}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  </View>
);

// ─── Quick Action Card ─────────────────────────────────────────────────────
const QuickCard = ({
  icon, label, onPress,
}: { icon: React.ReactNode; label: string; onPress?: () => void }) => {
  const press = useRef(new Animated.Value(0)).current;

  const handlePressIn = () =>
    Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () =>
    Animated.spring(press, { toValue: 0, useNativeDriver: true, speed: 20 }).start();

  // Translate 4px down+right on press to simulate shadow sinking
  const translate = press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.quickCard,
          { transform: [{ translateX: translate }, { translateY: translate }] },
        ]}
      >
        {icon}
        <Text style={styles.quickLabel}>{label}</Text>
        {/* Right arrow doodle */}
        <View style={styles.quickArrow}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12h14M14 6l6 6-6 6" stroke={Colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ─── Schedule Node ─────────────────────────────────────────────────────────
const ScheduleNode = ({ item, isLast }: { item: any; isLast: boolean }) => {
  const isDone = item.status === 'done';
  const isCurrent = item.status === 'current';

  return (
    <View style={styles.nodeRow}>
      {/* vertical line */}
      {!isLast && <View style={styles.nodeLine} />}
      {/* node circle */}
      <View style={styles.nodeCircleWrap}>
        {isCurrent ? (
          <View style={styles.nodeCurrentRing}>
            <View style={[styles.nodeCircle, { backgroundColor: Colors.coral }]} />
          </View>
        ) : (
          <View style={[styles.nodeCircle, { backgroundColor: isDone ? Colors.mint : 'transparent', borderColor: isDone ? Colors.mint : Colors.border }]} />
        )}
      </View>
      {/* content */}
      <View style={styles.nodeContent}>
        <Text style={[styles.nodeTime, { color: isCurrent ? Colors.coral : Colors.textMuted }]}>
          {item.time}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={[styles.nodeSubject, { color: isCurrent ? Colors.textPrimary : isDone ? Colors.textMuted : Colors.textPrimary }]}>
            {item.subject}
          </Text>
          {isCurrent && <KlassoBadge label="In Class Now" color="coral" />}
        </View>
        {item.teacher ? (
          <Text style={styles.nodeTeacher}>{item.teacher}</Text>
        ) : null}
      </View>
    </View>
  );
};

// ─── Activity Item ─────────────────────────────────────────────────────────
const ActivityItem = ({ item }: { item: any }) => {
  const DoodleIcon = item.type === 'grade'
    ? DoodleStar
    : item.type === 'attendance'
    ? DoodleCheckCircle
    : DoodleCircleDot;

  return (
    <View style={styles.activityRow}>
      <DoodleIcon size={18} color={item.dot} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.activityText}>{item.text}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );
};

// ─── MAIN SCREEN ───────────────────────────────────────────────────────────
export default function ParentHome() {
  const insets = useSafeAreaInsets();
  const [activeChildId, setActiveChildId] = useState<string | number | null>(null);
  const [data, setData] = useState<{ children: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiData<{ children: any[] }>('/api/analytics/parent')
      .then(res => {
        setData(res);
        if (res.children?.length > 0) setActiveChildId(res.children[0].student.id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.mint} />
      </View>
    );
  }

  if (!data.children || data.children.length === 0) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <DoodleCheckCircle size={80} color={Colors.mint} />
        <Text style={{ fontFamily: Fonts.headingXB, fontSize: 24, marginTop: 16 }}>No Linked Children</Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 16, color: Colors.textMuted, marginTop: 8 }}>Please contact the school admin.</Text>
        <TouchableOpacity style={styles.bottomLink} onPress={() => router.replace('/login')}>
            <Text style={{ fontFamily: Fonts.heading, color: Colors.coral }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeNode = data.children.find(c => c.student?.id === activeChildId) ?? data.children[0];
  if (!activeNode || !activeNode.student) return null;

  const child = activeNode.student;
  const attendance = activeNode.attendance;
  const latestGrade = activeNode.latest_marks?.grade ?? '-';
  const pendingAssignments = activeNode.pending_assignments;

  let scheduleParams = activeNode.today_schedule?.map((item: any) => {
    // determine status based on time (mock logic for demo):
    const hour = parseInt(item.start_time.split(':')[0], 10);
    const pm = item.start_time.includes('PM');
    const realHour = (pm && hour !== 12) ? hour + 12 : hour;
    const nowHour = new Date().getHours();
    const status = realHour < nowHour ? 'done' : realHour === nowHour ? 'current' : 'upcoming';

    return {
      time: item.start_time,
      subject: item.subject,
      teacher: item.teacher || 'Teacher',
      status,
    };
  }) || [];
  
  if (scheduleParams.length === 0) {
    scheduleParams = [
      { time: '08:00 AM', subject: 'No classes today', teacher: '', status: 'done' },
    ];
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Hello, Parent 👋</Text>
          <Text style={styles.headerDate}>{new Date().toDateString()}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => router.push('/parent/notifications' as any)}>
            <NotifBell />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/parent/settings' as any)}>
            <KlassoAvatar name="Mrs Mehta" size={40} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── CHILD SWITCHER ── */}
        <View style={styles.switcherSection}>
          <View style={styles.waveRow}>
            <DoodleWave size={18} color={Colors.coral} />
            <DoodleWave size={18} color={Colors.coral} />
            <DoodleWave size={18} color={Colors.coral} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherScroll}>
            {data.children.map(c => (
              <ChildPill
                key={c.student.id}
                child={c.student}
                active={c.student.id === activeChildId}
                onPress={() => setActiveChildId(c.student.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── CHILD SNAPSHOT HERO CARD ── */}
        <TouchableOpacity
          activeOpacity={0.93}
          onPress={() => router.push({ pathname: '/parent/child-overview', params: { childId: child.id } } as any)}
          style={[styles.heroCard, retroShadow(5, 5, Colors.shadow)]}
        >
          {/* BG starburst */}
          <View style={styles.heroStarburst} pointerEvents="none">
            <DoodleStarburst size={80} color={Colors.mint} />
          </View>

          {/* Left column */}
          <View style={styles.heroLeft}>
            <Text style={styles.heroChildName}>{child.name}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <KlassoBadge label={child.class} color="mint" />
            </View>
            <Text style={styles.heroLastSeen}>Last seen in school: Today</Text>
          </View>

          {/* Right column — mini stats */}
          <View style={styles.heroRight}>
            <MiniStat icon={<DoodleCheckCircle size={16} color={Colors.mint} />} value={`${attendance.percentage}%`} label="Attendance" />
            <MiniStat icon={<DoodleStar size={16} color={Colors.purple} />} value={latestGrade} label="Latest Grade" />
            <MiniStat icon={<DoodleBook size={16} color={Colors.coral} />} value={`${pendingAssignments} due`} label="Assignments" />
          </View>

          {/* Coral bottom strip */}
          <View style={styles.heroStrip}>
            {Array.from({ length: 10 }).map((_, i) => (
              <DoodleDiamond key={i} size={12} color="white" />
            ))}
          </View>
        </TouchableOpacity>

        {/* ── ALERTS ── */}
        {attendance.days_absent_this_month > 0 && (
          <View style={[styles.alertCard, retroShadow(4, 4, Colors.coralDark)]}>
            <View style={styles.alertLeft}>
              <DoodleSparkle size={22} color={Colors.coral} />
              <Text style={styles.alertText}>{child.name?.split(' ')[0]} was absent {attendance.days_absent_this_month} time(s) this month</Text>
            </View>
            <KlassoButton label="Contact School" variant="ghost" size="sm" style={{ borderColor: 'rgba(255,255,255,0.6)' }} />
          </View>
        )}

        {/* ── TODAY'S SCHEDULE ── */}
        <View style={styles.sectionHeader}>
          <DoodleRuler size={22} color={Colors.yellow} />
          <Text style={styles.sectionTitle}>Arjun's Day Today</Text>
        </View>
        <View style={[styles.scheduleCard, retroShadow(3, 3, Colors.shadow)]}>
          {scheduleParams.map((item: any, idx: number) => (
            <ScheduleNode key={idx} item={item} isLast={idx === scheduleParams.length - 1} />
          ))}
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickGrid}>
          <QuickCard
            icon={<DoodleBook size={30} color={Colors.coral} />}
            label="View Grades"
            onPress={() => router.push({ pathname: '/parent/child-overview', params: { childId: child.id } } as any)}
          />
          <QuickCard
            icon={<DoodleCheckCircle size={30} color={Colors.mint} />}
            label="Attendance"
            onPress={() => router.push({ pathname: '/parent/child-overview', params: { childId: child.id } } as any)}
          />
          <QuickCard
            icon={<DoodleFlower size={30} color={Colors.purple} />}
            label="Message Teacher"
            onPress={() => router.push({ pathname: '/parent/child-overview', params: { childId: child.id } } as any)}
          />
          <QuickCard
            icon={<DoodleLightbulb size={30} color={Colors.yellow} />}
            label="AI Reports"
            onPress={() => router.push({ pathname: '/parent/child-overview', params: { childId: child.id } } as any)}
          />
        </View>

        {/* ── RECENT ACTIVITY ── */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          <DoodleArrow size={20} color={Colors.textMuted} />
        </View>
        <View style={[styles.activityCard, retroShadow(3, 3, Colors.shadow)]}>
          {activeNode.recent_notifications?.length > 0 ? activeNode.recent_notifications.map((item: any, idx: number) => (
            <ActivityItem key={idx} item={{ type: 'message', dot: Colors.mint, text: item.title, time: new Date(item.created_at).toLocaleDateString() }} />
          )) : (
            <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted }}>No recent updates.</Text>
          )}
        </View>

        {/* ── BOTTOM QUICK LINKS ── */}
        <View style={styles.bottomLinks}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/parent/fees', params: { childId: child.id } } as any)}
            style={styles.bottomLink}
            activeOpacity={0.8}
          >
            <Text style={styles.bottomLinkIcon}>💰</Text>
            <Text style={styles.bottomLinkText}>Fee Tracker</Text>
          </TouchableOpacity>
          <View style={styles.bottomLinkDivider} />
          <TouchableOpacity
            onPress={() => router.push('/parent/notifications' as any)}
            style={styles.bottomLink}
            activeOpacity={0.8}
          >
            <Text style={styles.bottomLinkIcon}>🔔</Text>
            <Text style={styles.bottomLinkText}>Notifications</Text>
          </TouchableOpacity>
          <View style={styles.bottomLinkDivider} />
          <TouchableOpacity
            onPress={() => router.push('/parent/settings' as any)}
            style={styles.bottomLink}
            activeOpacity={0.8}
          >
            <Text style={styles.bottomLinkIcon}>⚙️</Text>
            <Text style={styles.bottomLinkText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // Header
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerDate: {
    fontFamily: Fonts.accent,
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  // Child switcher
  switcherSection: {
    marginBottom: 16,
  },
  waveRow: {
    flexDirection: 'row',
    opacity: 0.15,
    marginBottom: 10,
  },
  switcherScroll: {
    gap: 10,
  },
  childPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingRight: 14,
    paddingVertical: 4,
  },
  pillName: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  pillClass: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
  },

  // Hero card
  heroCard: {
    backgroundColor: '#E8FAF7',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    minHeight: 200,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroStarburst: {
    position: 'absolute',
    right: 80,
    top: 20,
    opacity: 0.25,
  },
  heroLeft: {
    flex: 1,
    padding: 18,
    paddingBottom: 40,
  },
  heroChildName: {
    fontFamily: Fonts.headingXB,
    fontSize: 22,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroLastSeen: {
    fontFamily: Fonts.accent,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 10,
  },
  heroRight: {
    width: 130,
    padding: 18,
    paddingBottom: 40,
    justifyContent: 'space-around',
  },
  miniStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStatValue: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  miniStatLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textMuted,
  },
  heroStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: Colors.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  // Alert card
  alertCard: {
    backgroundColor: Colors.coralLight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.coral,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 8,
  },
  alertText: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.coralDark,
    flex: 1,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 17,
    color: Colors.textPrimary,
  },

  // Schedule
  scheduleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  nodeRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    position: 'relative',
  },
  nodeLine: {
    position: 'absolute',
    left: 8,
    top: 28,
    bottom: -8,
    width: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.mint,
    borderRadius: 1,
  },
  nodeCircleWrap: {
    width: 18,
    alignItems: 'center',
    marginRight: 14,
    paddingTop: 2,
  },
  nodeCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.mint,
  },
  nodeCurrentRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeContent: {
    flex: 1,
  },
  nodeTime: {
    fontFamily: Fonts.accent,
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 1,
  },
  nodeSubject: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  nodeTeacher: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },

  // Quick actions
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    position: 'relative',
    minHeight: 90,
    justifyContent: 'space-between',
  },
  quickLabel: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 8,
  },
  quickArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },

  // Activity feed
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  activityTime: {
    fontFamily: Fonts.accent,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Bottom quick links
  bottomLinks: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bottomLink: {
    flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4,
  },
  bottomLinkIcon: { fontSize: 20 },
  bottomLinkText: { fontFamily: Fonts.heading, fontSize: 12, color: Colors.textMuted },
  bottomLinkDivider: { width: 1, backgroundColor: Colors.border },
});
