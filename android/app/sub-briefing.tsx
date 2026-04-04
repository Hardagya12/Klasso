import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { apiData as api } from '../lib/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  mint: '#3ECFB2', mintLight: '#D4F5EE', mintDark: '#28A990',
  coral: '#FF6B6B', coralLight: '#FFE5E5',
  yellow: '#FFE566', yellowLight: '#FFF8C2',
  bg: '#F7FBF9', surface: '#FFFFFF', border: '#D4EDE8',
  dark: '#1C2B27', muted: '#6B8C82', light: '#A5C4BC',
};
const shadow = (c = C.dark) => ({
  shadowColor: c, shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1, shadowRadius: 0, elevation: 8,
});

// ── Inline SVG Doodles ────────────────────────────────────────────────────────
const ClipboardSvg = ({ size = 40, color = C.mint }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="3" width="14" height="18" rx="2" stroke={color} strokeWidth="2" fill="none" />
    <Rect x="9" y="1" width="6" height="4" rx="1" fill={color} />
    <Path d="M8 10h8M8 14h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);
const StarSvg = ({ size = 18, color = C.coral }: { size?: number, color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill={color} />
  </Svg>
);
const FlagSvg = ({ size = 18, color = C.yellow }: { size?: number, color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 21V4h16l-4 5 4 5H4" stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </Svg>
);
const BookSvg = ({ size = 18, color = C.mint }: { size?: number, color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M4 4.5A2.5 2.5 0 0 0 6.5 7H20V21H6.5A2.5 2.5 0 0 1 4 18.5Z" stroke={color} strokeWidth="2" />
  </Svg>
);
const LightbulbSvg = ({ size = 18, color = C.mint }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21h6M12 3a6 6 0 0 1 3.75 10.66L15 17H9l-.75-3.34A6 6 0 0 1 12 3Z"
      stroke={color} strokeWidth="2" />
  </Svg>
);
const SparkSvg = ({ size = 18, color = C.mint }: { size?: number, color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
      fill={color} />
  </Svg>
);

// ── Accordion section ─────────────────────────────────────────────────────────
const Section = ({ title, icon, children, defaultOpen = false }: { title: string, icon?: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const toVal = open ? 0 : 1;
    setOpen(!open);
    Animated.timing(anim, { toValue: toVal, duration: 250, useNativeDriver: false }).start();
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={styles.sectionHeaderLeft}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={[styles.sectionChevron, { transform: [{ rotate: open ? '180deg' : '0deg' }] }]}>
          ▾
        </Text>
      </TouchableOpacity>
      {open && (
        <Animated.View style={styles.sectionBody}>
          {children}
        </Animated.View>
      )}
    </View>
  );
};

// ── Avatar initials circle ────────────────────────────────────────────────────
const Avatar = ({ name, color = C.mint }: { name: string, color?: string }) => {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : '?';
  return (
    <View style={[styles.avatar, { backgroundColor: color + '33', borderColor: color }]}>
      <Text style={[styles.avatarText, { color }]}>{initials}</Text>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function SubBriefingScreen() {
  const router = useRouter();
  const { substitutionId } = useLocalSearchParams<{ substitutionId: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchBriefing();
  }, [substitutionId]);

  const fetchBriefing = async () => {
    try {
      const res = await api<any>(`/api/substitution/${substitutionId}/briefing`);
      setData(res.briefing);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (e: any) {
      Alert.alert('Oops', e.message || 'Could not load briefing. Try again soon.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingInner}>
          <ActivityIndicator size="large" color={C.mint} />
          <Text style={styles.loadingText}>Preparing your briefing…</Text>
          <Text style={styles.loadingSubtext}>Klasso AI is reviewing the class</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingSubtext}>Briefing not available yet. Check back soon.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { content, aiSummary, generatedAt } = data;
  const { classInfo, topStudents, needsAttention, subjectProgress,
          recentAssessments, todayAssignments, classXP, avgAttendance } = content;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <View style={styles.header}>
            {/* Doodle decorations */}
            <View style={[styles.headerDoodle, { top: 12, left: 20 }]}>
              <SparkSvg size={22} color={C.mint + '88'} />
            </View>
            <View style={[styles.headerDoodle, { top: 14, right: 24 }]}>
              <StarSvg size={18} color={C.coral + '66'} />
            </View>

            <ClipboardSvg size={44} color={C.mint} />
            <Text style={styles.headerTitle}>Your Class Briefing</Text>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {classInfo.subject} · {classInfo.name} {classInfo.section}
                </Text>
              </View>
            </View>

            <Text style={styles.headerMeta}>
              Period {classInfo.period} · {formatTime(classInfo.startTime)}–{formatTime(classInfo.endTime)}
            </Text>
            {classInfo.room ? (
              <Text style={styles.headerMeta}>Room {classInfo.room}</Text>
            ) : null}
          </View>

          {/* ── AI SUMMARY CARD ───────────────────────────────────────── */}
          <View style={[styles.aiCard, shadow(C.mintDark)]}>
            <View style={styles.aiCardDecoration}>
              <LightbulbSvg size={24} color={C.mint} />
            </View>
            <Text style={styles.aiCardLabel}>AI-Generated Summary</Text>
            <Text style={styles.aiCardText}>{aiSummary}</Text>
          </View>

          {/* ── ACCORDION SECTIONS ────────────────────────────────────── */}

          {/* Section 1: The Class */}
          <Section
            title="The Class"
            icon={<BookSvg size={18} color={C.mint} />}
            defaultOpen
          >
            <View style={styles.statRow}>
              <StatPill label="Students" value={`${classInfo.studentCount}`} color={C.mint} />
              <StatPill label="Avg Attendance" value={`${avgAttendance}%`}
                color={avgAttendance >= 80 ? C.mint : C.coral} />
              <StatPill label="XP Level" value={`Lv.${classXP.level}`} color={C.yellow} />
            </View>
            <View style={styles.funNote}>
              <SparkSvg size={14} color={C.mint} />
              <Text style={styles.funNoteText}>
                They're Level {classXP.level} "{classXP.title}" — they're doing great! 🎉
              </Text>
            </View>
          </Section>

          {/* Section 2: Quick Wins */}
          <Section
            title="Quick Wins"
            icon={<StarSvg size={18} color={C.coral} />}
          >
            {topStudents && topStudents.length > 0 ? (
              topStudents.map((s: any, i: number) => (
                <View key={i} style={styles.studentRow}>
                  <Avatar name={s.name} color={C.mint} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentMeta}>
                      {s.avgScore >= 80 ? 'Strong performer' : 'Engaged learner'} · Avg {s.avgScore}%
                    </Text>
                  </View>
                  <StarSvg size={14} color={C.coral} />
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>No grade data yet.</Text>
            )}
          </Section>

          {/* Section 3: Check in with */}
          <Section
            title="Check in with these students"
            icon={<FlagSvg size={18} color={C.yellow} />}
          >
            <View style={styles.gentleNote}>
              <Text style={styles.gentleNoteText}>
                This is a gentle nudge — use your judgement 💛
              </Text>
            </View>
            {needsAttention && needsAttention.length > 0 ? (
              needsAttention.map((s: any, i: number) => (
                <View key={i} style={styles.studentRow}>
                  <Avatar name={s.name} color={C.yellow} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentMeta}>{s.reason}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyNote}>No flagged students — great sign! 🌟</Text>
            )}
          </Section>

          {/* Section 4: Where they are */}
          <Section
            title="Where they are in the syllabus"
            icon={<BookSvg size={18} color={C.mint} />}
          >
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Recent Topic</Text>
              <Text style={styles.infoValue}>{subjectProgress?.recentTopic || 'Not available'}</Text>
            </View>
            {recentAssessments && recentAssessments.length > 0 && (
              <View>
                <Text style={styles.infoLabel}>Recent Assessments</Text>
                {recentAssessments.map((a: any, i: number) => (
                  <View key={i} style={styles.assessmentRow}>
                    <Text style={styles.assessmentName}>{a.examName}</Text>
                    <View style={[styles.scoreBadge,
                      { backgroundColor: a.classAvgPct >= 70 ? C.mintLight : C.coralLight }]}>
                      <Text style={[styles.scoreText,
                        { color: a.classAvgPct >= 70 ? C.mintDark : C.coral }]}>
                        {a.classAvgPct}% avg
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Section>

          {/* Section 5: Today's Assignments */}
          <Section
            title="Today's Assignments"
            icon={<ClipboardSvg size={18} color={C.mint} />}
          >
            {todayAssignments && todayAssignments.length > 0 ? (
              <>
                {todayAssignments.map((a: any, i: number) => (
                  <View key={i} style={styles.assignmentCard}>
                    <Text style={styles.assignmentTitle}>{a.title}</Text>
                    <Text style={styles.assignmentDue}>Due today · {formatTime(a.dueTime)}</Text>
                  </View>
                ))}
                <Text style={styles.remindNote}>
                  📌 Remind students if needed
                </Text>
              </>
            ) : (
              <Text style={styles.emptyNote}>No assignments due today. Smooth sailing ⛵</Text>
            )}
          </Section>

          {/* ── FOOTER ─────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Generated from real class data via Klasso AI
            </Text>
            <Text style={styles.footerTime}>
              {generatedAt ? new Date(generatedAt).toLocaleString() : ''}
            </Text>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back to Schedule</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatTime = (t: any): string => {
  if (!t) return '';
  try {
    const d = new Date(t);
    if (isNaN(d.getTime())) return String(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(t);
  }
};

const StatPill = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={[styles.statPill, { borderColor: color, backgroundColor: color + '18' }]}>
    <Text style={[styles.statPillVal, { color }]}>{value}</Text>
    <Text style={styles.statPillLabel}>{label}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 48 },

  loadingContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  loadingInner: { alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: C.dark },
  loadingSubtext: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: C.muted },

  // Header
  header: {
    alignItems: 'center', paddingTop: 24, paddingBottom: 16, marginBottom: 20, position: 'relative',
  },
  headerDoodle: { position: 'absolute' },
  headerTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: C.dark, marginTop: 10 },
  badgeRow: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  badge: {
    backgroundColor: C.mint, paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 100, borderWidth: 1.5, borderColor: C.mintDark,
  },
  badgeText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: '#fff' },
  headerMeta: { fontFamily: 'Caveat_400Regular', fontSize: 17, color: C.muted, marginTop: 4 },

  // AI Card
  aiCard: {
    backgroundColor: C.mintLight, borderWidth: 1.5, borderColor: C.mint,
    borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative', overflow: 'visible',
  },
  aiCardDecoration: { position: 'absolute', top: -10, right: -8 },
  aiCardLabel: {
    fontFamily: 'Caveat_400Regular', fontSize: 14, color: C.mintDark, marginBottom: 8,
  },
  aiCardText: {
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: C.dark, lineHeight: 24,
  },

  // Sections
  section: {
    backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 16, marginBottom: 12, overflow: 'hidden', ...shadow(C.dark),
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: C.dark },
  sectionChevron: { fontFamily: 'DMSans_400Regular', fontSize: 18, color: C.muted },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16 },

  // Stat pills
  statRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  statPill: {
    flex: 1, minWidth: 80, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8,
    borderRadius: 12, borderWidth: 1.5,
  },
  statPillVal: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20 },
  statPillLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: C.muted, marginTop: 2 },

  // Fun note
  funNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.mintLight, borderRadius: 10, padding: 10,
  },
  funNoteText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: C.mintDark, flex: 1 },

  // Students
  studentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  studentName: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.dark },
  studentMeta: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.muted, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },

  emptyNote: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 8 },

  // Gentle note
  gentleNote: {
    backgroundColor: C.yellowLight, borderRadius: 10, padding: 10, marginBottom: 12,
  },
  gentleNoteText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#92400E' },

  // Info block
  infoBlock: { marginBottom: 12 },
  infoLabel: { fontFamily: 'Caveat_400Regular', fontSize: 14, color: C.muted, marginBottom: 2 },
  infoValue: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: C.dark },
  assessmentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  assessmentName: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: C.dark, flex: 1 },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  scoreText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },

  // Assignments
  assignmentCard: {
    backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border,
    padding: 12, marginBottom: 8,
  },
  assignmentTitle: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: C.dark },
  assignmentDue: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.muted, marginTop: 2 },
  remindNote: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: C.muted, marginTop: 4 },

  // Footer
  footer: { alignItems: 'center', marginTop: 24, marginBottom: 12 },
  footerText: { fontFamily: 'Caveat_400Regular', fontSize: 13, color: C.light },
  footerTime: { fontFamily: 'Caveat_400Regular', fontSize: 12, color: C.light, marginTop: 4 },

  backBtn: {
    marginTop: 8, borderRadius: 100, backgroundColor: C.surface,
    borderWidth: 1.5, borderColor: C.border, paddingVertical: 14, alignItems: 'center',
    ...shadow(C.dark),
  },
  backBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: C.dark },
});
