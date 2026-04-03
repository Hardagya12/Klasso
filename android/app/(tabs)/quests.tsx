import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, ActivityIndicator, Easing,
} from 'react-native';
import Svg, { Rect, Path, Circle, Polygon, Line, Ellipse } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Fonts } from '@/src/components';

// ─── Types ───────────────────────────────────────────────────────────────────
type QuestTarget = { metric?: string; value?: number; subjectId?: string };

type Quest = {
  id: string;
  title: string;
  description: string;
  type: string;
  target: QuestTarget;
  xpReward: number;
  badgeName?: string | null;
  badgeColor?: string | null;
  endDate: string;
};

type QuestWithProgress = {
  quest: Quest;
  progress: { currentValue: number; targetValue: number; progressPercent: number };
  isComplete: boolean;
};

type CompletedQuest = QuestWithProgress & { completedAt: string; xpAwarded: number };

type StudentQuestsData = {
  active: QuestWithProgress[];
  completed: CompletedQuest[];
  upcoming: QuestWithProgress[];
};

// ─── Quest-type colours ───────────────────────────────────────────────────────
const QUEST_COLORS: Record<string, string> = {
  ATTENDANCE_STREAK: '#FF6B6B',
  AI_BUDDY_SESSIONS: '#3ECFB2',
  ASSIGNMENT_SUBMISSIONS: '#4A90D9',
  GRADE_TARGET: '#F5A623',
  ZERO_ABSENCES_WEEK: '#7C5CBF',
  CUSTOM: '#6B8C82',
};

const QUEST_LABELS: Record<string, string> = {
  ATTENDANCE_STREAK: 'Attendance Streak',
  AI_BUDDY_SESSIONS: 'AI Buddy Sessions',
  ASSIGNMENT_SUBMISSIONS: 'Submissions',
  GRADE_TARGET: 'Grade Target',
  ZERO_ABSENCES_WEEK: 'Zero Absences',
  CUSTOM: 'Special Quest',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const FlameIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#FF6B6B">
    <Path d="M12 2c0 0-6 5.4-6 10.5C6 16.1 8.7 19 12 19s6-2.9 6-6.5C18 7.4 12 2 12 2zm0 15c-2.2 0-4-1.8-4-4 0-2.1 1.5-4.2 4-7 2.5 2.8 4 4.9 4 7 0 2.2-1.8 4-4 4z" />
  </Svg>
);
const LightbulbIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#3ECFB2">
    <Path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
  </Svg>
);
const BookIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#4A90D9">
    <Path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
  </Svg>
);
const StarIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#F5A623">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);
const ShieldIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#7C5CBF">
    <Path d="M12 2L4 5v6c0 5.25 3.4 10.14 8 11.35C16.6 21.14 20 16.25 20 11V5l-8-3z" />
  </Svg>
);
const CustomQuestIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="#6B8C82">
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
  </Svg>
);

const QUEST_ICONS: Record<string, React.ReactNode> = {
  ATTENDANCE_STREAK: <FlameIcon />,
  AI_BUDDY_SESSIONS: <LightbulbIcon />,
  ASSIGNMENT_SUBMISSIONS: <BookIcon />,
  GRADE_TARGET: <StarIcon />,
  ZERO_ABSENCES_WEEK: <ShieldIcon />,
  CUSTOM: <CustomQuestIcon />,
};

// ─── Doodle Starburst ─────────────────────────────────────────────────────────
const DoodleStarburst = ({ size = 32, color = '#F5A623' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = 20 + 18 * Math.cos(rad);
      const y = 20 + 18 * Math.sin(rad);
      return <Line key={i} x1="20" y1="20" x2={x} y2={y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
    })}
    <Circle cx="20" cy="20" r="4" fill={color} />
  </Svg>
);

// ─── Checkmark SVG ────────────────────────────────────────────────────────────
const CheckmarkSVG = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Circle cx="20" cy="20" r="19" fill="#3ECFB2" stroke="#1C2B27" strokeWidth="2" />
    <Path d="M11 20l6 7 12-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// ─── Parchment scroll banner SVG ──────────────────────────────────────────────
const ScrollBanner = ({ width }: { width: number }) => (
  <Svg width={width} height={78} viewBox={`0 0 ${width} 78`}>
    {/* Main scroll body */}
    <Rect x="0" y="10" width={width} height="58" fill="#FFFBF0" rx="4" />
    {/* Top wavy edge */}
    <Path
      d={`M0,16 Q${width * 0.1},4 ${width * 0.2},12 Q${width * 0.3},20 ${width * 0.4},10 Q${width * 0.5},2 ${width * 0.6},10 Q${width * 0.7},20 ${width * 0.8},12 Q${width * 0.9},4 ${width},16 L${width},10 L0,10 Z`}
      fill="#D4A853"
    />
    {/* Bottom wavy edge */}
    <Path
      d={`M0,62 Q${width * 0.1},74 ${width * 0.2},66 Q${width * 0.3},58 ${width * 0.4},68 Q${width * 0.5},76 ${width * 0.6},68 Q${width * 0.7},58 ${width * 0.8},66 Q${width * 0.9},74 ${width},62 L${width},68 L0,68 Z`}
      fill="#D4A853"
    />
    {/* Gold side highlights */}
    <Rect x="0" y="10" width="8" height="58" fill="#F0C040" opacity="0.5" />
    <Rect x={width - 8} y="10" width="8" height="58" fill="#F0C040" opacity="0.5" />
  </Svg>
);

// ─── Quest Complete Animation Modal ──────────────────────────────────────────
function QuestCompleteModal({ quest, onDismiss }: { quest: Quest; onDismiss: () => void }) {
  const scaleX = useRef(new Animated.Value(0)).current;
  const starsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleX, { toValue: 1, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.back(1.2)) }),
      Animated.timing(starsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.modalOverlay}>
      <Animated.View style={[styles.completeModal, { transform: [{ scaleX }] }]}>
        {/* Corner starbursts */}
        <View style={{ position: 'absolute', top: 8, left: 8 }}>
          <Animated.View style={{ opacity: starsOpacity }}>
            <DoodleStarburst size={28} color="#F5A623" />
          </Animated.View>
        </View>
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <Animated.View style={{ opacity: starsOpacity }}>
            <DoodleStarburst size={28} color="#FF6B6B" />
          </Animated.View>
        </View>
        <View style={{ position: 'absolute', bottom: 12, left: 12 }}>
          <Animated.View style={{ opacity: starsOpacity }}>
            <DoodleStarburst size={22} color="#3ECFB2" />
          </Animated.View>
        </View>
        <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
          <Animated.View style={{ opacity: starsOpacity }}>
            <DoodleStarburst size={22} color="#7C5CBF" />
          </Animated.View>
        </View>

        <Text style={styles.completeLabel}>QUEST COMPLETE!</Text>
        <Text style={styles.completeTitle}>{quest.title}</Text>
        <CheckmarkSVG size={56} />
        <Text style={styles.completeXP}>+{quest.xpReward} XP added to your class!</Text>
      </Animated.View>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function XPBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View style={styles.xpTrack}>
      <View style={[styles.xpFill, { width: `${Math.min(100, percent)}%` as any, backgroundColor: color }]} />
    </View>
  );
}

// ─── Quest Card ───────────────────────────────────────────────────────────────
function QuestCard({ item, isCompleted = false }: { item: QuestWithProgress; isCompleted?: boolean }) {
  const { quest, progress, isComplete } = item;
  const color = QUEST_COLORS[quest.type] || Colors.mint;
  const icon = QUEST_ICONS[quest.type] ?? <CustomQuestIcon />;
  const displayProgress = isComplete || isCompleted;

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(quest.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));
  const endLabel = daysLeft === 0 ? 'Ends today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`;

  return (
    <View style={[styles.questCard, isCompleted && styles.questCardCompleted]}>
      {/* Completed mint overlay */}
      {isCompleted && (
        <View style={styles.completedOverlay}>
          <CheckmarkSVG size={44} />
          <Text style={styles.completedText}>Completed!</Text>
        </View>
      )}

      {/* Card top: icon + title */}
      <View style={styles.questCardHeader}>
        <View style={[styles.questIconWrap, { borderColor: color }]}>
          {icon}
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.questTitle} numberOfLines={1}>{quest.title}</Text>
          <Text style={styles.questTypeLabel}>{QUEST_LABELS[quest.type] ?? quest.type}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.questDescription} numberOfLines={2}>{quest.description}</Text>

      {/* Progress */}
      <View style={styles.questProgressRow}>
        <Text style={[styles.questProgressLabel, { color }]}>
          {progress.currentValue}/{progress.targetValue}
        </Text>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <XPBar percent={displayProgress ? 100 : progress.progressPercent} color={color} />
        </View>
        <Text style={styles.questProgressPct}>
          {displayProgress ? '100%' : `${progress.progressPercent}%`}
        </Text>
      </View>

      {/* Bottom row */}
      <View style={styles.questCardFooter}>
        <Text style={styles.questEndDate}>{endLabel}</Text>
        <View style={styles.xpPill}>
          <Text style={styles.xpPillText}>+{quest.xpReward} XP</Text>
        </View>
        {quest.badgeName && (
          <View style={[styles.badgePill, { backgroundColor: quest.badgeColor || color }]}>
            <Text style={styles.badgePillText}>🏅 {quest.badgeName}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [data, setData] = useState<StudentQuestsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completeModal, setCompleteModal] = useState<Quest | null>(null);

  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      // Resolve student ID via analytics endpoint (available data)
      const studentRes = await apiData<{ student: { id: string } }>('/api/analytics/student');
      const studentId = (studentRes as any)?.student?.id;
      if (!studentId) { setErr('Could not find student profile'); return; }

      const result = await apiData<StudentQuestsData>(`/api/quests/student/${studentId}`);
      setData(result);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadQuests(); }, [loadQuests]);

  const activeCount = data?.active.length ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ─── HEADER ─── */}
      <View style={styles.headerWrap}>
        <ScrollBanner width={380} />
        <View style={styles.headerContent}>
          {/* Doodle accents */}
          <View style={{ position: 'absolute', left: 16, top: 14, opacity: 0.5 }}>
            <DoodleStarburst size={22} color="#D4A853" />
          </View>
          <View style={{ position: 'absolute', right: 56, top: 8, opacity: 0.5 }}>
            <DoodleStarburst size={18} color="#FF6B6B" />
          </View>
          <Text style={styles.headerTitle}>Study Quests</Text>
          <View style={styles.questCountBadge}>
            <Text style={styles.questCountText}>{activeCount}</Text>
          </View>
        </View>
      </View>

      {/* ─── CONTENT ─── */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.mint} />
          <Text style={{ fontFamily: Fonts.accent, fontSize: 16, color: Colors.textMuted, marginTop: 12 }}>
            Unrolling your quests…
          </Text>
        </View>
      ) : err ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontFamily: Fonts.body, color: Colors.coral, textAlign: 'center' }}>{err}</Text>
          <TouchableOpacity onPress={loadQuests} style={styles.retryBtn}>
            <Text style={{ fontFamily: Fonts.headingXB, color: 'white' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Active Quests */}
          <Text style={styles.sectionTitle}>Active Quests</Text>
          {(data?.active ?? []).length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontFamily: Fonts.accent, fontSize: 17, color: Colors.textMuted, textAlign: 'center' }}>
                No active quests right now.{'\n'}Check back after your teacher creates some!
              </Text>
              {/* 4 decorative doodles */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                {['#F5A623', '#FF6B6B', '#3ECFB2', '#7C5CBF'].map((c, i) => (
                  <DoodleStarburst key={i} size={20} color={c} />
                ))}
              </View>
            </View>
          ) : (
            (data?.active ?? []).map(item => (
              <QuestCard key={item.quest.id} item={item} />
            ))
          )}

          {/* Upcoming */}
          {(data?.upcoming ?? []).length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Upcoming</Text>
              {(data?.upcoming ?? []).map(item => (
                <QuestCard key={item.quest.id} item={item} />
              ))}
            </>
          )}

          {/* Completed toggle */}
          {(data?.completed ?? []).length > 0 && (
            <>
              <TouchableOpacity
                style={styles.completedToggle}
                onPress={() => setShowCompleted(p => !p)}
              >
                <Text style={styles.completedToggleText}>
                  {showCompleted ? 'Hide' : 'Show'} completed ({data?.completed.length})
                </Text>
                <Text style={styles.completedToggleText}>{showCompleted ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showCompleted && (data?.completed ?? []).map(item => (
                <QuestCard key={item.quest.id} item={item} isCompleted />
              ))}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ─── QUEST COMPLETE MODAL ─── */}
      {completeModal && (
        <QuestCompleteModal quest={completeModal} onDismiss={() => setCompleteModal(null)} />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FBF9',
  },
  headerWrap: {
    position: 'relative',
    height: 78,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  headerContent: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#1C2B27',
    letterSpacing: -0.3,
  },
  questCountBadge: {
    marginLeft: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  questCountText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 17,
    color: '#1C2B27',
    marginBottom: 10,
    marginTop: 4,
  },
  // Quest Card
  questCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D4A853',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#8B6914',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  questCardCompleted: {
    opacity: 0.72,
    // sepia-like tint via backgroundColor
    backgroundColor: '#F5EDD4',
  },
  completedOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(62, 207, 178, 0.18)',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
  },
  completedText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#1C5C4F',
  },
  questCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  questIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#1C2B27',
  },
  questTypeLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#6B8C82',
    marginTop: 1,
  },
  questDescription: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#4A5F58',
    marginBottom: 10,
    lineHeight: 18,
  },
  questProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questProgressLabel: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 16,
    minWidth: 36,
  },
  questProgressPct: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#6B8C82',
    minWidth: 32,
    textAlign: 'right',
  },
  xpTrack: {
    height: 10,
    backgroundColor: '#E8E0CC',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 5,
  },
  questCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  questEndDate: {
    fontFamily: 'Caveat_400Regular',
    fontSize: 14,
    color: '#8B6914',
    flex: 1,
  },
  xpPill: {
    backgroundColor: '#F5A623',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  xpPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: 'white',
  },
  badgePill: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgePillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: 'white',
  },
  // Empty state
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D4EDE8',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1C2B27',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: 16,
  },
  // Completed toggle
  completedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  completedToggleText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#6B8C82',
  },
  // Quest complete modal
  modalOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  completeModal: {
    backgroundColor: '#FFFBF0',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#D4A853',
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    shadowColor: '#8B6914',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    minWidth: 280,
  },
  completeLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#D4A853',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  completeTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#1C2B27',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeXP: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 18,
    color: '#3ECFB2',
    marginTop: 12,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.mint,
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 16,
  },
});
