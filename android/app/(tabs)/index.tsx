import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { apiData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  KlassoScreen, StatCard, KlassoCard, KlassoBadge, KlassoButton, KlassoAvatar,
  DoodleCheckCircle, DoodleStar, DoodlePencil, DoodleBook, DoodleLeaf, DoodleLightbulb,
  Colors, Fonts,
} from '@/src/components';
import { ClassXPWidget } from '@/src/components/ClassXPWidget';
import { LevelUpModal } from '@/src/components/LevelUpModal';
import StreakWidget from '@/src/components/StreakWidget';

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

  if (user && user.role !== 'student') {
    return (
      <KlassoScreen>
        <View style={{ padding: 24 }}>
          <Text style={{ fontFamily: Fonts.heading, fontSize: 18, color: Colors.textPrimary }}>
            Student home is for student accounts. You are signed in as {user.role}.
          </Text>
        </View>
      </KlassoScreen>
    );
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

        <ClassXPWidget />
        <StreakWidget />

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
