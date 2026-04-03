import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  Caveat_400Regular,
} from '@expo-google-fonts/caveat';

import {
  KlassoScreen,
  KlassoCard,
  KlassoButton,
  KlassoInput,
  KlassoBadge,
  KlassoAvatar,
  StatCard,
  // Doodles
  DoodleStar, DoodleCloud, DoodlePencil, DoodleLeaf,
  DoodleHeart, DoodleSparkle, DoodleBook, DoodleCheckCircle,
  DoodleArrow, DoodleRuler, DoodleLightbulb, DoodleRocket,
  DoodleMushroom, DoodleFlower, DoodleWave, DoodleDiamond,
  DoodleCircleDot, DoodleStarburst,
  Colors, Fonts,
} from '@/src/components';

// Fonts need to be loaded before rendering
function AppContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <KlassoScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HEADER ──────────────────────────────── */}
        <View style={styles.header}>
          <DoodlePencil size={32} color={Colors.mint} />
          <View style={{ flex: 1 }}>
            <Text style={styles.h1}>Klasso Design System</Text>
            <Text style={styles.subtitle}>Student + Parent App · v1.0</Text>
          </View>
          <DoodleStarburst size={28} color={Colors.yellow} />
        </View>

        <DoodleWave size={40} color={Colors.mint} />

        {/* ─── CARDS ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>Cards</Text>

        <KlassoCard variant="default" doodle="star" style={styles.mb}>
          <Text style={styles.cardHeading}>Default Card</Text>
          <Text style={styles.cardBody}>Retro 4px flat shadow. Star doodle top-right.</Text>
        </KlassoCard>

        <KlassoCard variant="mint" doodle="pencil" style={styles.mb}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <DoodleCheckCircle size={22} color={Colors.mint} />
            <Text style={styles.cardHeading}>Attendance — 94%</Text>
          </View>
          <Text style={styles.cardBody}>Mint background, pencil doodle decoration.</Text>
        </KlassoCard>

        <KlassoCard variant="coral" doodle="cloud" style={styles.mb}>
          <Text style={styles.cardHeading}>⚠️ Fee Reminder</Text>
          <Text style={styles.cardBody}>Term 2 fees due by 15th April.</Text>
          <View style={{ marginTop: 10 }}>
            <KlassoButton label="Pay Now" variant="coral" size="sm" />
          </View>
        </KlassoCard>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <KlassoCard variant="yellow" doodle="plant" size="sm" style={{ flex: 1 }}>
            <Text style={styles.cardHeading}>Homework</Text>
            <Text style={styles.cardBody}>3 pending</Text>
          </KlassoCard>
          <KlassoCard variant="purple" doodle="star" size="sm" style={{ flex: 1 }}>
            <Text style={styles.cardHeading}>Grade</Text>
            <Text style={styles.cardBody}>A+ · Term 1</Text>
          </KlassoCard>
        </View>

        {/* ─── STAT CARDS ──────────────────────────── */}
        <Text style={styles.sectionTitle}>Stat Cards</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <StatCard value="94%" label="Attendance" statType="attendance" style={{ flex: 1 }} />
          <StatCard value="A+"  label="Avg Grade"  statType="grade"      style={{ flex: 1 }} />
          <StatCard value="12"  label="Assignments" statType="assignment" style={{ flex: 1 }} />
        </View>
        <StatCard value="🔥 7" label="Day Streak" sublabel="Keep it up!" statType="streak" style={styles.mb} />

        {/* ─── BUTTONS ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Buttons</Text>
        <View style={styles.row}>
          <KlassoButton label="Primary" variant="primary" />
          <KlassoButton label="Coral" variant="coral" />
        </View>
        <View style={[styles.row, styles.mb]}>
          <KlassoButton label="Ghost" variant="ghost" />
          <KlassoButton label="Yellow" variant="yellow" />
        </View>
        <View style={[styles.row, styles.mb]}>
          <KlassoButton label="Small" variant="primary" size="sm" />
          <KlassoButton label="Medium" variant="primary" size="md" />
          <KlassoButton label="Large" variant="primary" size="lg" />
        </View>
        <KlassoButton label="Loading..." variant="primary" loading style={styles.mb} />

        {/* ─── INPUTS ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Inputs</Text>
        <KlassoCard variant="default" style={styles.mb}>
          <KlassoInput
            label="Student Name"
            placeholder="Aarav Sharma"
            value={name}
            onChangeText={setName}
          />
          <KlassoInput
            label="Email"
            placeholder="aarav@school.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <KlassoInput
            label="Grade (has error)"
            placeholder="e.g. 8-A"
            error="This field is required"
          />
        </KlassoCard>

        {/* ─── BADGES ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.row}>
          <KlassoBadge label="Present" color="mint" />
          <KlassoBadge label="Late" color="yellow" />
          <KlassoBadge label="Absent" color="coral" />
          <KlassoBadge label="Top Scorer" color="purple" />
          <KlassoBadge label="Pending" color="gray" />
        </View>

        {/* ─── AVATARS ─────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Avatars</Text>
        <View style={styles.row}>
          <KlassoAvatar name="Aarav Patel" size={52} online />
          <KlassoAvatar name="Priya Sharma" size={52} />
          <KlassoAvatar name="Rohan Gupta" size={40} online />
          <KlassoAvatar name="Meera Singh" size={40} />
        </View>

        {/* ─── DOODLE GALLERY ──────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Doodle Library</Text>
        <View style={styles.doodleGrid}>
          {[
            { D: DoodleStar,       label: 'Star' },
            { D: DoodleCloud,      label: 'Cloud' },
            { D: DoodlePencil,     label: 'Pencil' },
            { D: DoodleLeaf,       label: 'Leaf' },
            { D: DoodleHeart,      label: 'Heart' },
            { D: DoodleSparkle,    label: 'Sparkle' },
            { D: DoodleBook,       label: 'Book' },
            { D: DoodleCheckCircle,label: 'Check' },
            { D: DoodleArrow,      label: 'Arrow' },
            { D: DoodleRuler,      label: 'Ruler' },
            { D: DoodleLightbulb,  label: 'Bulb' },
            { D: DoodleRocket,     label: 'Rocket' },
            { D: DoodleMushroom,   label: 'Mushroom' },
            { D: DoodleFlower,     label: 'Flower' },
            { D: DoodleWave,       label: 'Wave' },
            { D: DoodleDiamond,    label: 'Diamond' },
            { D: DoodleCircleDot,  label: 'Dot' },
            { D: DoodleStarburst,  label: 'Burst' },
          ].map(({ D, label }) => (
            <View key={label} style={styles.doodleCell}>
              <D size={28} color={Colors.mint} />
              <Text style={styles.doodleLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KlassoScreen>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    Caveat_400Regular,
  });

  if (!fontsLoaded) return null;

  return <AppContent />;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  h1: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.accent, fontSize: 14, color: Colors.textMuted },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  cardHeading: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardBody: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  mb: { marginBottom: 16 },
  doodleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  doodleCell: {
    width: '18%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  doodleLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
