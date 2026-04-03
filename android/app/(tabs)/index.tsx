import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { apiData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  KlassoScreen, StatCard, KlassoCard, KlassoBadge, KlassoButton, KlassoAvatar,
  DoodleCheckCircle, DoodleStar, DoodlePencil, DoodleBook, DoodleLeaf, DoodleLightbulb, DoodleSparkle,
  Colors, Fonts,
} from '@/src/components';
import { ClassXPWidget } from '@/src/components/ClassXPWidget';
import { LevelUpModal } from '@/src/components/LevelUpModal';
import StreakWidget from '@/src/components/StreakWidget';
import { DuelWidget } from '@/src/components/DuelWidget';
import Svg, { Path, Rect } from 'react-native-svg';

// ── Design tokens used in teacher home ─────────────────────────────────────
const TC = {
  mint: '#3ECFB2', mintLight: '#D4F5EE', mintDark: '#28A990',
  coral: '#FF6B6B', coralLight: '#FFE5E5',
  yellow: '#FFE566', yellowLight: '#FFF8C2',
  bg: '#F7FBF9', surface: '#FFFFFF', border: '#D4EDE8',
  dark: '#1C2B27', muted: '#6B8C82', light: '#A5C4BC',
};
const tShadow = { shadowColor: TC.dark, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 8 };

// ── Mini SVG doodles ─────────────────────────────────────────────────────────
const ClipSvg = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="3" width="14" height="18" rx="2" stroke={TC.mint} strokeWidth="2" fill="none" />
    <Rect x="9" y="1" width="6" height="4" rx="1" fill={TC.mint} />
    <Path d="M8 10h8M8 14h5" stroke={TC.mint} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);
const SparkSvg = ({ size = 18, color = TC.mint }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill={color} />
  </Svg>
);

// ── Substitution row type ────────────────────────────────────────────────────
type SubRow = {
  substitution_id: string;
  date: string;
  class_name: string;
  section: string;
  subject_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
  briefing_id?: string;
  is_viewed?: boolean;
  ai_summary?: string;
};

// ── Time formatter ────────────────────────────────────────────────────────────
const fmtT = (t: any): string => {
  if (!t) return '';
  try {
    const d = new Date(t.includes('T') ? t : `1970-01-01T${t}`);
    return Number.isNaN(d.getTime()) ? String(t) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return String(t); }
};

// ── TeacherHomeScreen ─────────────────────────────────────────────────────────
function TeacherHomeScreen({ user }: { user: { name?: string; role?: string } }) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await apiData<SubRow[]>('/api/substitution/my-briefings?upcoming=true');
      setSubs(data || []);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (e: any) {
      setErr(e.message || 'Could not load substitutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchSubs(); }, [fetchSubs]));

  const displayName = user?.name || 'Teacher';

  const BriefingBadge = ({ row }: { row: SubRow }) => {
    if (!row.briefing_id) {
      return (
        <View style={ts.badgeGray}>
          <Text style={[ts.badgeText, { color: TC.muted }]}>Not yet</Text>
        </View>
      );
    }
    return (
      <View style={row.is_viewed ? ts.badgeMintLight : ts.badgeMint}>
        <Text style={[ts.badgeText, { color: row.is_viewed ? TC.mintDark : '#fff' }]}>
          {row.is_viewed ? '✓ Viewed' : '✓ Unread'}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: TC.bg }}>
      {/* ── HEADER ─────────── */}
      <View style={[ts.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ position: 'absolute', top: 8, right: -8, opacity: 0.15 }}>
          <SparkSvg size={100} color="white" />
        </View>
        <View style={{ position: 'absolute', top: 12, left: 20, opacity: 0.2 }}>
          <SparkSvg size={48} color="white" />
        </View>
        <View style={ts.headerTop}>
          <View>
            <Text style={ts.headerGreeting}>Good morning,</Text>
            <Text style={ts.headerName}>{displayName} ✨</Text>
            <Text style={ts.headerRole}>{user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)} · Klasso</Text>
          </View>
          <ClipSvg size={44} />
        </View>
        <Text style={ts.headerSub}>Your upcoming substitution slots.</Text>
      </View>

      <ScrollView
        contentContainerStyle={ts.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ── Error ── */}
          {!!err && (
            <View style={ts.errorCard}>
              <Text style={ts.errorText}>⚠ {err}</Text>
            </View>
          )}

          {/* ── Loading ── */}
          {loading && (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <ActivityIndicator color={TC.mint} size="large" />
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: TC.muted, marginTop: 8 }}>Loading substitutions…</Text>
            </View>
          )}

          {/* ── Section header ── */}
          {!loading && (
            <View style={ts.sectionRow}>
              <Text style={ts.sectionTitle}>Upcoming Substitutions</Text>
              <TouchableOpacity onPress={fetchSubs}>
                <Text style={ts.refreshBtn}>↺ Refresh</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Empty state ── */}
          {!loading && subs.length === 0 && !err && (
            <View style={ts.emptyCard}>
              <ClipSvg size={48} />
              <Text style={ts.emptyTitle}>No upcoming substitutions</Text>
              <Text style={ts.emptySubtitle}>When you're assigned as a substitute, your briefings will appear here.</Text>
            </View>
          )}

          {/* ── Sub cards ── */}
          {subs.map((row) => (
            <View key={row.substitution_id} style={ts.subCard}>
              {/* Corner doodle */}
              <View style={{ position: 'absolute', top: -6, right: -4, opacity: 0.35 }}>
                <SparkSvg size={22} color={TC.mint} />
              </View>

              {/* Top row: subject badge + class */}
              <View style={ts.subCardTop}>
                <View style={ts.subjectBadge}>
                  <Text style={ts.subjectBadgeText}>{row.subject_name}</Text>
                </View>
                <Text style={ts.className}>{row.class_name} {row.section}</Text>
              </View>

              {/* Date & period */}
              <Text style={ts.subMeta}>
                {new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}Period {row.period_number}{' · '}{fmtT(row.start_time)}–{fmtT(row.end_time)}
                {row.room ? ` · Room ${row.room}` : ''}
              </Text>

              {/* Briefing status + action */}
              <View style={ts.subCardFooter}>
                <BriefingBadge row={row} />
                <TouchableOpacity
                  style={[ts.viewBtn, { backgroundColor: row.briefing_id ? TC.dark : TC.coral }]}
                  onPress={() => router.push({ pathname: '/sub-briefing', params: { substitutionId: row.substitution_id } } as any)}
                  activeOpacity={0.85}
                >
                  <Text style={ts.viewBtnText}>
                    {row.briefing_id ? 'View Briefing' : 'Not ready yet'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const ts = StyleSheet.create({
  header: {
    backgroundColor: TC.mint,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerGreeting: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  headerName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 26, color: '#fff', letterSpacing: -0.5 },
  headerRole: { fontFamily: 'Caveat_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerSub: { fontFamily: 'Caveat_400Regular', fontSize: 17, color: 'rgba(255,255,255,0.9)' },
  scroll: { padding: 20, paddingTop: 24 },
  errorCard: { backgroundColor: TC.coralLight, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: TC.coral },
  errorText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: '#D94848' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: TC.dark },
  refreshBtn: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: TC.mint },
  emptyCard: {
    alignItems: 'center', padding: 40, backgroundColor: TC.surface,
    borderRadius: 20, borderWidth: 1.5, borderColor: TC.border, ...tShadow,
  },
  emptyTitle: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: TC.dark, marginTop: 14 },
  emptySubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: TC.muted, textAlign: 'center', marginTop: 6 },
  subCard: {
    backgroundColor: TC.surface, borderRadius: 16, borderWidth: 1.5, borderColor: TC.border,
    padding: 16, marginBottom: 14, position: 'relative', overflow: 'visible', ...tShadow,
  },
  subCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  subjectBadge: { backgroundColor: TC.mint, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  subjectBadgeText: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#fff' },
  className: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: TC.dark },
  subMeta: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: TC.muted, marginBottom: 14 },
  subCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeGray: { backgroundColor: '#F3F4F6', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  badgeMint: { backgroundColor: TC.mint, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  badgeMintLight: { backgroundColor: TC.mintLight, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
  viewBtn: { borderRadius: 100, paddingHorizontal: 18, paddingVertical: 9, shadowColor: TC.muted, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
  viewBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#fff' },
});

type StudentDash = {
  student: {
    name: string;
    class_id: string;
    class_name: string | null;
    section: string | null;
    roll_no: string;
  };
  attendance: { percentage: number; this_month: { present?: number; absent?: number } };
  marks: { latest_exam: { name: string; pct: number } | null };
  today_timetable: Array<{
    period_number: number;
    start_time: string;
    end_time: string;
    subject: string;
    teacher: string | null;
  }>;
  pending_assignments: Array<{
    title: string;
    subject: string;
    due_date: string;
    is_overdue: boolean;
  }>;
};

function fmtTime(s: string) {
  if (!s) return '';
  const d = new Date(s.includes('T') ? s : `1970-01-01T${s}`);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [dash, setDash] = useState<StudentDash | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [moodCheckedIn, setMoodCheckedIn] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      async function checkMood() {
        try {
          const res = await apiData<any>('/api/mood/my-summary');
          if (res.checkIns?.length > 0) {
            const last = res.checkIns[res.checkIns.length - 1];
            const lastDate = new Date(last.date);
            const today = new Date();
            setMoodCheckedIn(lastDate.toDateString() === today.toDateString());
          } else {
            setMoodCheckedIn(false);
          }
        } catch (e) {}
      }
      checkMood();
    }, [])
  );

  useEffect(() => {
    if (user?.role !== 'student') return;
    void (async () => {
      try {
        const d = await apiData<StudentDash>('/api/analytics/student');
        setDash(d);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not load dashboard');
      }
    })();
  }, [user?.role]);

  // ── Teacher / Admin home ─────────────────────────────────────────
  if (user && user.role !== 'student') {
    return <TeacherHomeScreen user={user} />;
  }


  const displayName = dash?.student?.name || user?.name || 'Student';
  const cls =
    dash?.student?.class_name && dash?.student?.section
      ? `${dash.student.class_name}-${dash.student.section}`
      : 'Class';

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
            <Text style={styles.name}>{displayName} ✨</Text>
            <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              {cls} · Roll {dash?.student?.roll_no ?? '—'}
            </Text>
          </View>
          <KlassoAvatar name={displayName} size={48} online />
        </View>

        <Text style={styles.quote}>
          {err ? `⚠ ${err}` : dash ? 'Your live timetable and tasks from school.' : 'Loading your dashboard…'}
        </Text>
      </View>

      {/* ─── STAT CARDS (outside ScrollView to avoid clipping) ── */}
      <View style={styles.statContainer}>
        <StatCard
          label="Attendance"
          value={dash ? `${Math.round(dash.attendance.percentage)}%` : '…'}
          statType="attendance"
          style={{ flex: 1 }}
        />
        <StatCard
          label="Latest exam"
          value={
            dash?.marks?.latest_exam
              ? `${Math.round(Number(dash.marks.latest_exam.pct))}%`
              : '—'
          }
          statType="grade"
          style={{ flex: 1 }}
        />
        <StatCard
          label="This month"
          value={
            dash
              ? `${dash.attendance.this_month?.present ?? 0}P/${dash.attendance.this_month?.absent ?? 0}A`
              : '…'
          }
          statType="streak"
          sublabel="Present / Absent"
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!dash && !err && (
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator color={Colors.mintDark} />
          </View>
        )}

        {!moodCheckedIn && dash && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/mood')}>
            <KlassoCard style={{ marginBottom: 20, backgroundColor: '#E8FAF7', borderColor: '#3ECFB2' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <DoodleLeaf size={32} color="#3ECFB2" />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ fontFamily: Fonts.heading, fontSize: 16, color: '#1C5C4F' }}>Daily Check-in</Text>
                  <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: '#1C5C4F', opacity: 0.8, marginTop: 2 }}>How are you feeling today?</Text>
                </View>
                <View style={{ backgroundColor: '#2C2A24', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 100 }}>
                  <Text style={{ fontFamily: Fonts.heading, color: '#FFF', fontSize: 13 }}>Let's Go</Text>
                </View>
              </View>
            </KlassoCard>
          </TouchableOpacity>
        )}

        {/* ─── TIME CAPSULE WIDGET ───────────────────────── */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/timecapsule')}>
          <KlassoCard style={{ marginBottom: 20, backgroundColor: '#1C2B27', borderColor: '#3ECFB2' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DoodleSparkle size={32} color="#3ECFB2" />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontFamily: Fonts.heading, fontSize: 18, color: '#FFF' }}>Your Year In Review</Text>
                <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: '#A1A1AA', marginTop: 2 }}>Ready to open? See your stats!</Text>
              </View>
              <View style={{ backgroundColor: '#3ECFB2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 100 }}>
                <Text style={{ fontFamily: Fonts.heading, color: '#1C2B27', fontSize: 13, fontWeight: '800' }}>Open</Text>
              </View>
            </View>
          </KlassoCard>
        </TouchableOpacity>

        <ClassXPWidget />
        <StreakWidget />
        <DuelWidget />

        {/* ─── UPCOMING TIMETABLE ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Today</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalScrollContent}>
          {(dash?.today_timetable ?? []).length === 0 && dash && (
            <Text style={{ fontFamily: Fonts.body, color: Colors.textMuted }}>No periods today.</Text>
          )}
          {(dash?.today_timetable ?? []).map((slot, idx) => (
            <KlassoCard key={idx} variant={idx === 0 ? 'mint' : 'purple'} size="md" style={styles.hCard}>
              <Text style={styles.subject}>{slot.subject}</Text>
              <Text style={styles.timeInfo}>
                {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                {slot.teacher ? ` · ${slot.teacher}` : ''}
              </Text>
              <View style={styles.hCardFooter}>
                <KlassoBadge label={idx === 0 ? 'Next' : 'Later'} color={idx === 0 ? 'mint' : 'gray'} />
                {idx === 0 ? (
                  <DoodlePencil size={24} color={Colors.mint} />
                ) : (
                  <DoodleLightbulb size={24} color={Colors.purple} />
                )}
              </View>
            </KlassoCard>
          ))}
        </ScrollView>

        {/* ─── DUE SOON ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Due Soon</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{dash ? `${dash.pending_assignments.length} open` : ''}</Text>
          </TouchableOpacity>
        </View>

        <KlassoCard variant="default" style={styles.mb}>
          {(dash?.pending_assignments ?? []).length === 0 && dash && (
            <Text style={{ fontFamily: Fonts.body, color: Colors.textMuted, padding: 12 }}>No pending homework.</Text>
          )}
          {(dash?.pending_assignments ?? []).map((task, idx) => (
            <View
              key={`${task.title}-${idx}`}
              style={[styles.taskItem, idx === (dash?.pending_assignments?.length ?? 0) - 1 ? { borderBottomWidth: 0 } : {}]}
            >
              <View style={[styles.taskDot, { backgroundColor: task.is_overdue ? Colors.coral : Colors.yellow }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskSubtitle}>
                  {task.subject} · {new Date(task.due_date).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
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
      <LevelUpModal visible={false} newLevel={1} newTitle="Seedlings" onClose={() => {}} />
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
