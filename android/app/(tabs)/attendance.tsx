import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  KlassoScreen, KlassoCard, KlassoBadge,
  DoodleCheckCircle, DoodleRuler, DoodleStar, DoodleLeaf, DoodleCircleDot,
  Colors, Fonts,
} from '@/src/components';

const { width } = Dimensions.get('window');

// Custom SVG Circular Progress
function HandDrawnCircularProgress({ percentage, size = 200, strokeWidth = 16 }: { percentage: number, size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const color = percentage > 85 ? Colors.mint : percentage > 75 ? Colors.yellow : Colors.coral;
  
  const isLarge = size > 100;
  const numberFontSize = size * 0.21; // Scales to 42 for size=200, ~13 for size=60
  const subFontSize = size * 0.06;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background track (slightly wavy/wobbly by rotation) */}
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={Colors.bg}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
        />
        {/* Foreground progress */}
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size/2}, ${size/2}`}
        />
      </Svg>
      
      {/* Absolute positioned inner ring info */}
      <View style={styles.circularInner}>
        {isLarge && (
          <View style={{ position: 'absolute', top: -15 }}>
            <DoodleStar size={16} color={Colors.yellow} />
          </View>
        )}
        <Text style={[styles.circularNumber, { color, fontSize: numberFontSize, marginTop: isLarge ? 8 : 0 }]}>
          {percentage}%
        </Text>
        {isLarge && <Text style={[styles.circularSub, { fontSize: subFontSize }]}>Overall</Text>}
      </View>
    </View>
  );
}

// Mini Calendar
function MonthlyCalendar() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S']; // Specification asked for 6/7 days
  const fullDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Create a 5x7 grid of fake statuses
  const grid = Array.from({ length: 35 }).map((_, i) => {
    if (i < 3) return null; // Offset
    if (i > 31) return null; // End offset
    const date = i - 2;
    let status = 'future';
    if (date < 22) status = 'present';
    if (date === 5 || date === 12) status = 'absent';
    if (date === 8) status = 'late';
    if (date === 15 || date === 16) status = 'holiday';
    if (date === 22) status = 'today';
    return { date, status };
  });

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calHeaderRow}>
        {fullDays.map((d, i) => (
          <View key={i} style={styles.calCell}>
            <Text style={styles.calHeadText}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calGrid}>
        {grid.map((cell, i) => {
          if (!cell) return <View key={i} style={styles.calCell} />;
          
          let content = <Text style={styles.calDateText}>{cell.date}</Text>;
          let cellStyle = styles.calCell;

          if (cell.status === 'present') {
            content = (
              <View style={[styles.calDot, { backgroundColor: Colors.mint }]}>
                <DoodleCheckCircle size={10} color="white" />
              </View>
            );
          } else if (cell.status === 'absent') {
            content = (
              <View style={[styles.calDot, { backgroundColor: Colors.coral }]}>
                <Text style={styles.calTinyX}>×</Text>
              </View>
            );
          } else if (cell.status === 'late') {
            content = (
              <View style={[styles.calDot, { backgroundColor: Colors.yellowDark }]}>
                <Text style={styles.calTinyClock}>L</Text>
              </View>
            );
          } else if (cell.status === 'holiday') {
            content = (
              <View style={[styles.calDot, { backgroundColor: '#E8E4D9' }]}>
                <Text style={styles.calTinyX}>-</Text>
              </View>
            );
          } else if (cell.status === 'today') {
            content = (
              <View style={styles.calTodayWrapper}>
                <View style={[styles.calDot, { backgroundColor: Colors.textPrimary }]}>
                  <Text style={[styles.calTinyClock, { color: 'white' }]}>{cell.date}</Text>
                </View>
              </View>
            );
          }

          return <View key={i} style={cellStyle}>{content}</View>;
        })}
      </View>

      <View style={styles.calLegend}>
        {[
          { label: 'Present', color: Colors.mint },
          { label: 'Absent', color: Colors.coral },
          { label: 'Late', color: Colors.yellowDark },
          { label: 'Holiday', color: '#E8E4D9' },
        ].map((item) => (
          <View key={item.label} style={styles.calLegendItem}>
            <View style={[styles.calLegendDot, { backgroundColor: item.color }]} />
            <Text style={styles.calLegendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();

  const subjects = [
    { name: 'Mathematics', percent: 96, current: 38, total: 40, color: Colors.mint, icon: DoodleRuler },
    { name: 'Science', percent: 85, current: 34, total: 40, color: Colors.purple, icon: DoodleStar },
    { name: 'History', percent: 72, current: 29, total: 40, color: Colors.coral, icon: DoodleLeaf },
  ];

  return (
    <KlassoScreen noSafeArea>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <DoodleCheckCircle size={28} color={Colors.mint} />
            <Text style={styles.headerTitle}>My Attendance</Text>
          </View>
          <KlassoBadge label="94.2%" color="mint" />
        </View>
        <Text style={styles.headerSubtitle}>Term 2 · April 2025</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ─── OVERALL HERO WIDGET ─────────────────────── */}
        <View style={styles.heroWrapper}>
          <KlassoCard variant="default" style={[styles.heroCard, { shadowColor: '#1C2B27', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0 }]}>
            <HandDrawnCircularProgress percentage={94} size={200} strokeWidth={18} />
          </KlassoCard>
        </View>

        {/* ─── SUBJECT BREAKDOWN ───────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={styles.hScrollContent}>
          {subjects.map((sub, i) => {
            const Icon = sub.icon;
            return (
              <KlassoCard key={i} variant="default" style={[styles.subCard, { borderLeftColor: sub.color, borderLeftWidth: 6 }]}>
                <View style={styles.subCardTop}>
                  <Text style={styles.subCardTitle} numberOfLines={1}>{sub.name}</Text>
                  <View style={{ opacity: 0.3 }}><Icon size={18} color={sub.color} /></View>
                </View>
                <View style={styles.subCardBody}>
                  <HandDrawnCircularProgress percentage={sub.percent} size={60} strokeWidth={6} />
                </View>
                <Text style={styles.subCardBottom}>{sub.current}/{sub.total} classes</Text>
              </KlassoCard>
            );
          })}
        </ScrollView>

        {/* ─── CALENDAR VIEW ───────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <DoodleRuler size={24} color={Colors.coral} />
        </View>
        <MonthlyCalendar />

        {/* ─── ABSENCE LOG ─────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Absences</Text>
          <View style={styles.absenceCountBadge}>
            <Text style={styles.absenceCountText}>3</Text>
          </View>
        </View>

        {[
          { date: '12 Apr', subject: 'History', reason: 'Sick', notified: true },
          { date: '05 Apr', subject: 'Mathematics', reason: 'Family', notified: true },
          { date: '21 Mar', subject: 'Science', reason: 'Unexcused', notified: false },
        ].map((log, i) => (
          <View key={i} style={styles.logCard}>
            <View style={styles.logLeftAccent} />
            <View style={styles.logContent}>
              <View style={styles.logRowTop}>
                <Text style={styles.logDate}>{log.date}</Text>
                <View style={styles.logReasonChip}><Text style={styles.logReasonText}>{log.reason}</Text></View>
                <View style={[styles.notifiedChip, { backgroundColor: log.notified ? Colors.mint : Colors.coral }]}>
                  <Text style={styles.notifiedText}>{log.notified ? 'Parent Notified' : 'Not Notified'}</Text>
                </View>
              </View>
              <Text style={styles.logSubject}>Missed {log.subject}</Text>
            </View>
            <View style={{ position: 'absolute', bottom: -5, right: -5, opacity: 0.3 }}>
              <DoodleLeaf size={24} color={Colors.coral} />
            </View>
          </View>
        ))}

        <View style={{ height: 100 }}/>
      </ScrollView>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F7FBF9',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
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
  },
  content: {
    padding: 24,
  },
  heroWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 24,
  },
  circularInner: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularNumber: {
    fontFamily: Fonts.headingXB,
    fontSize: 42,
    marginTop: 8,
  },
  circularSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -4,
  },
  hScroll: {
    marginHorizontal: -24,
    marginBottom: 30,
  },
  hScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  subCard: {
    width: 150,
    padding: 16,
    shadowColor: '#1C2B27',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subCardTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  subCardBody: {
    alignItems: 'center',
    marginBottom: 12,
  },
  subCardBottom: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.headingXB,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: '#1C2B27',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  calHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100/7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calHeadText: {
    fontFamily: Fonts.accent,
    fontSize: 16,
    color: Colors.textMuted,
  },
  calDateText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  calDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calTinyX: { color: 'white', fontFamily: Fonts.headingXB, fontSize: 14, marginTop: -2 },
  calTinyClock: { color: 'white', fontFamily: Fonts.headingXB, fontSize: 12 },
  calTodayWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.bg,
  },
  calLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calLegendDot: { width: 10, height: 10, borderRadius: 5 },
  calLegendText: { fontFamily: Fonts.accent, fontSize: 14, color: Colors.textMuted },
  absenceCountBadge: {
    backgroundColor: Colors.coral,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
  },
  absenceCountText: {
    fontFamily: Fonts.headingXB,
    color: 'white',
    fontSize: 14,
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#1C2B27',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logLeftAccent: {
    width: 6,
    backgroundColor: Colors.coral,
  },
  logContent: {
    flex: 1,
    padding: 16,
  },
  logRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  logDate: {
    fontFamily: Fonts.headingXB,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  logReasonChip: {
    backgroundColor: Colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logReasonText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textPrimary,
  },
  notifiedChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  notifiedText: {
    fontFamily: Fonts.headingXB,
    fontSize: 9,
    color: 'white',
    textTransform: 'uppercase',
  },
  logSubject: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
});
