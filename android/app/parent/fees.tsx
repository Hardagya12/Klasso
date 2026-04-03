import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import {
  KlassoBadge, KlassoButton,
  DoodleCheckCircle, DoodleSparkle, DoodleBook,
  DoodleStarburst, DoodleRuler, DoodleArrow, DoodleWave,
  Colors, Fonts, retroShadow, Radius,
} from '@/src/components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Rupee Coin SVG ───────────────────────────────────────────────────────────
const DoodleCoin = ({ size = 28, color = Colors.yellow }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx={20} cy={20} r={17} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.8} />
    <Circle cx={20} cy={20} r={12} stroke={color} strokeWidth={0.8} fill="none" opacity={0.4} />
    <Path
      d="M14 13h12M14 13c0 4 4 5 6 5s6 1 6 5H14"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    />
    <Path d="M14 18h12" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

// ─── Pulsing Doodle ─────────────────────────────────────────────────────────
const PulsingDoodle = ({ children }: { children: React.ReactNode }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={{ transform: [{ scale: pulse }] }}>{children}</Animated.View>;
};

// ─── Data ────────────────────────────────────────────────────────────────────
const TERMS = [
  {
    id: '1', label: 'Term 1', status: 'PAID', amount: '₹20,000',
    pills: ['Tuition', 'Transport', 'Activity'],
    items: [
      { name: 'Tuition Fee', amount: '₹15,000' },
      { name: 'Transport', amount: '₹3,000' },
      { name: 'Activity Fee', amount: '₹2,000' },
    ],
  },
  {
    id: '2', label: 'Term 2', status: 'PAID', amount: '₹22,000',
    pills: ['Tuition', 'Lab', 'Sports'],
    items: [
      { name: 'Tuition Fee', amount: '₹17,000' },
      { name: 'Lab Fee', amount: '₹3,000' },
      { name: 'Sports Fee', amount: '₹2,000' },
    ],
  },
  {
    id: '3', label: 'Term 3', status: 'DUE', amount: '₹18,000',
    pills: ['Tuition', 'Transport', 'Exam'],
    items: [
      { name: 'Tuition Fee', amount: '₹13,000' },
      { name: 'Transport', amount: '₹3,000' },
      { name: 'Exam Fee', amount: '₹2,000' },
    ],
  },
];

const HISTORY = [
  { id: '1', day: '10', month: 'Jan', label: 'Term 1 Fee Payment', receipt: 'RCP-2024-001', amount: '₹20,000' },
  { id: '2', day: '08', month: 'Mar', label: 'Term 2 Fee Payment', receipt: 'RCP-2024-002', amount: '₹22,000' },
];

// ─── Progress Bar with Wavy End ───────────────────────────────────────────────
const FeeProgressBar = ({ pct }: { pct: number }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${pct}%` }]}>
      <View style={styles.progressWaveEdge}>
        <DoodleWave size={8} color={Colors.mint} />
      </View>
    </View>
    <Text style={styles.progressLabel}>{pct}% paid</Text>
  </View>
);

// ─── Term Row Card ────────────────────────────────────────────────────────────
const TermCard = ({ term }: { term: typeof TERMS[0] }) => {
  const [expanded, setExpanded] = useState(false);
  const isPaid = term.status === 'PAID';
  const isDue = term.status === 'DUE';

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(e => !e);
  };

  return (
    <View style={[
      styles.termCard,
      retroShadow(3, 3, isPaid ? Colors.mintDark : Colors.coralDark),
      { borderColor: isPaid ? Colors.mint : Colors.coral },
    ]}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.8} style={styles.termCardTop}>
        {/* Status icon */}
        {isPaid
          ? <DoodleCheckCircle size={18} color={Colors.mint} />
          : <PulsingDoodle><DoodleSparkle size={18} color={Colors.coral} /></PulsingDoodle>
        }

        {/* Label + pills */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.termLabel}>{term.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 4 }}>
            {term.pills.map(p => (
              <View key={p} style={styles.termPill}>
                <Text style={styles.termPillText}>{p}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Amount + status */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={styles.termAmount}>{term.amount}</Text>
          <KlassoBadge
            label={term.status}
            color={isPaid ? 'mint' : isDue ? 'coral' : 'yellow'}
          />
        </View>

        {/* Expand arrow */}
        <Text style={[styles.expandArrow, expanded && { transform: [{ rotate: '90deg' }] }]}>›</Text>
      </TouchableOpacity>

      {/* Expanded breakdown */}
      {expanded && (
        <View style={styles.termExpanded}>
          {term.items.map((item, i) => (
            <View key={i} style={styles.termItem}>
              <Text style={styles.termItemName}>{item.name}</Text>
              <Text style={styles.termItemAmount}>{item.amount}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Payment History Card ────────────────────────────────────────────────────
const HistoryCard = ({ item }: { item: typeof HISTORY[0] }) => (
  <View style={[styles.historyCard, retroShadow(2, 2, Colors.shadow)]}>
    <View style={styles.historyDate}>
      <Text style={styles.historyDay}>{item.day}</Text>
      <Text style={styles.historyMonth}>{item.month}</Text>
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.historyLabel}>{item.label}</Text>
      <Text style={styles.historyReceipt}>{item.receipt}</Text>
      <TouchableOpacity style={styles.downloadRow}>
        <DoodleBook size={12} color={Colors.coral} />
        <Text style={styles.downloadText}>Download Receipt</Text>
      </TouchableOpacity>
    </View>
    <View style={{ alignItems: 'flex-end', gap: 6 }}>
      <Text style={styles.historyAmount}>{item.amount}</Text>
      <KlassoBadge label="Paid" color="mint" />
    </View>
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function FeeTracker() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <DoodleCoin size={28} color={Colors.yellow} />
          <Text style={styles.headerTitle}>Fee Tracker</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <KlassoBadge label="2024-25" color="mint" />
          <View style={{ opacity: 0.15 }}>
            <DoodleStarburst size={40} color={Colors.mint} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Overview Card */}
        <View style={[styles.overviewCard, retroShadow(5, 5, Colors.shadow)]}>
          {/* BG Ruler doodle */}
          <View style={styles.overviewRuler} pointerEvents="none">
            <DoodleRuler size={40} color={Colors.mint} />
          </View>

          <View style={styles.overviewTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalPaid}>₹42,000</Text>
              <Text style={styles.totalOf}>of ₹60,000 total</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.remaining}>₹18,000 remaining</Text>
              <Text style={styles.nextDue}>Next due: May 1st</Text>
            </View>
          </View>

          <FeeProgressBar pct={70} />
        </View>

        {/* Fee Breakdown */}
        <View style={styles.sectionHeader}>
          <DoodleBook size={20} color={Colors.mint} />
          <Text style={styles.sectionTitle}>Fee Breakdown</Text>
        </View>
        {TERMS.map(t => <TermCard key={t.id} term={t} />)}

        {/* Payment History */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <DoodleArrow size={20} color={Colors.mint} />
          <Text style={styles.sectionTitle}>Payment History</Text>
        </View>
        {HISTORY.map(h => <HistoryCard key={h.id} item={h} />)}

        {/* Pay Now Button */}
        <View style={styles.payNowWrap}>
          <KlassoButton
            label="Pay Now  ₹18,000"
            variant="primary"
            size="lg"
            leftIcon={<DoodleSparkle size={18} color="white" />}
            style={{ alignSelf: 'stretch' }}
          />
        </View>

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

  scroll: { padding: 18 },

  // Overview card
  overviewCard: {
    backgroundColor: Colors.mintLight,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.mint,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  overviewRuler: {
    position: 'absolute', bottom: 8, right: 8, opacity: 0.12,
    transform: [{ rotate: '20deg' }],
  },
  overviewTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  totalPaid: {
    fontFamily: Fonts.headingXB, fontSize: 36, color: Colors.textPrimary, lineHeight: 40,
  },
  totalOf: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  remaining: { fontFamily: Fonts.heading, fontSize: 15, color: Colors.coral },
  nextDue: { fontFamily: Fonts.accent, fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  // Progress bar
  progressTrack: {
    height: 12, backgroundColor: 'white',
    borderRadius: 100, overflow: 'visible',
    borderWidth: 1, borderColor: Colors.border,
    position: 'relative',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.mint,
    borderRadius: 100, position: 'relative',
    overflow: 'hidden',
  },
  progressWaveEdge: {
    position: 'absolute', right: -4, top: -2,
  },
  progressLabel: {
    position: 'absolute', right: 8, top: -20,
    fontFamily: Fonts.accent, fontSize: 13, color: Colors.mintDark,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: Fonts.headingXB, fontSize: 17, color: Colors.textPrimary },

  // Term card
  termCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  termCardTop: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 4,
  },
  termLabel: { fontFamily: Fonts.accent, fontSize: 16, color: Colors.textPrimary, fontWeight: '700' },
  termPill: {
    backgroundColor: Colors.bg, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  termPillText: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textMuted },
  termAmount: { fontFamily: Fonts.heading, fontSize: 15, color: Colors.textPrimary },
  expandArrow: {
    fontFamily: Fonts.heading, fontSize: 20, color: Colors.textMuted, marginLeft: 4,
  },
  termExpanded: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 10, gap: 8,
  },
  termItem: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  termItemName: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted },
  termItemAmount: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.textPrimary },

  // History card
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 14, marginBottom: 10,
  },
  historyDate: {
    backgroundColor: Colors.mint,
    borderRadius: Radius.sm, width: 46, height: 52,
    alignItems: 'center', justifyContent: 'center',
  },
  historyDay: { fontFamily: Fonts.headingXB, fontSize: 20, color: 'white' },
  historyMonth: { fontFamily: Fonts.accent, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  historyLabel: { fontFamily: Fonts.heading, fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  historyReceipt: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted },
  downloadRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
  },
  downloadText: { fontFamily: Fonts.body, fontSize: 12, color: Colors.coral },
  historyAmount: { fontFamily: Fonts.headingXB, fontSize: 16, color: Colors.textPrimary },

  // Pay now
  payNowWrap: { marginTop: 20 },
});
