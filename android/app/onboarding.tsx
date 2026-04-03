import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, {
  Rect, Path, Circle, Line, Ellipse, G,
} from 'react-native-svg';
import {
  DoodleSparkle, DoodleStarburst, DoodleArrow,
  DoodleHeart, DoodleBook, DoodleRocket, DoodleLightbulb,
  DoodleWave,
  Colors, Fonts,
} from '@/src/components';
import { KlassoButton } from '@/src/components';

const { width: W, height: H } = Dimensions.get('window');

// ──────────────────────────────────────────────────────────
//  SLIDE ILLUSTRATIONS
// ──────────────────────────────────────────────────────────

// Slide 1 — Student Desk Scene
const DeskIllustration = () => (
  <Svg width={W * 0.85} height={220} viewBox="0 0 320 220" fill="none">
    {/* Desk surface */}
    <Rect x="30" y="140" width="260" height="28" rx="6" fill="#D4EDE8" stroke={Colors.textPrimary} strokeWidth="2" />
    {/* Desk leg left */}
    <Rect x="42" y="168" width="14" height="42" rx="4" fill="#B5CDC6" stroke={Colors.textPrimary} strokeWidth="1.5" />
    {/* Desk leg right */}
    <Rect x="264" y="168" width="14" height="42" rx="4" fill="#B5CDC6" stroke={Colors.textPrimary} strokeWidth="1.5" />

    {/* Open Book — left page */}
    <Path d="M80 140C80 108 106 96 140 98V140H80Z" fill="#FFFEF8" stroke={Colors.textPrimary} strokeWidth="1.8" strokeLinejoin="round" />
    {/* Open Book — right page */}
    <Path d="M140 98C174 96 200 108 200 140H140V98Z" fill="#F8FFFC" stroke={Colors.textPrimary} strokeWidth="1.8" strokeLinejoin="round" />
    {/* Book spine */}
    <Line x1="140" y1="98" x2="140" y2="140" stroke={Colors.textPrimary} strokeWidth="2.2" />
    {/* Text lines - left page */}
    <Line x1="90" y1="112" x2="132" y2="112" stroke={Colors.mint} strokeWidth="1.8" opacity={0.7} />
    <Line x1="90" y1="121" x2="128" y2="121" stroke={Colors.mint} strokeWidth="1.8" opacity={0.7} />
    <Line x1="90" y1="130" x2="132" y2="130" stroke={Colors.mint} strokeWidth="1.8" opacity={0.7} />
    {/* Text lines - right page */}
    <Line x1="148" y1="112" x2="190" y2="112" stroke={Colors.mint} strokeWidth="1.8" opacity={0.5} />
    <Line x1="148" y1="121" x2="186" y2="121" stroke={Colors.mint} strokeWidth="1.8" opacity={0.5} />
    <Line x1="148" y1="130" x2="190" y2="130" stroke={Colors.mint} strokeWidth="1.8" opacity={0.5} />

    {/* Pencil resting diagonally */}
    <Rect x="155" y="105" width="62" height="8" rx="3" fill={Colors.yellow} stroke={Colors.textPrimary} strokeWidth="1.5" transform="rotate(-18 180 109)" />
    <Rect x="155" y="105" width="10" height="8" rx="3" fill={Colors.coral} stroke={Colors.textPrimary} strokeWidth="1" transform="rotate(-18 180 109)" opacity={0.8} />
    {/* Pencil tip */}
    <Path d="M214 99L220 96L218 103Z" fill={Colors.textPrimary} transform="rotate(-18 217 100)" />

    {/* Apple */}
    <Circle cx="225" cy="132" r="13" fill={Colors.coral} stroke={Colors.textPrimary} strokeWidth="1.8" />
    <Path d="M225 119 Q225 115 229 113" stroke="#2C7A4B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <Circle cx="218" cy="127" r="3" fill="white" opacity={0.35} />

    {/* Backpack */}
    <Rect x="240" y="150" width="44" height="54" rx="10" fill="#A78BFA" stroke={Colors.textPrimary} strokeWidth="1.8" />
    <Rect x="247" y="158" width="30" height="20" rx="5" fill="#8B6FE8" stroke={Colors.textPrimary} strokeWidth="1.2" />
    <Line x1="262" y1="158" x2="262" y2="178" stroke={Colors.textPrimary} strokeWidth="1" opacity={0.4} />
    <Ellipse cx="262" cy="204" rx="16" ry="5" fill="#8B6FE8" opacity={0.3} />

    {/* Floating sparkles */}
    <Circle cx="55" cy="100" r="5" fill={Colors.yellow} opacity={0.8} />
    <Line x1="55" y1="90" x2="55" y2="110" stroke={Colors.yellow} strokeWidth="1.5" opacity={0.7} />
    <Line x1="45" y1="100" x2="65" y2="100" stroke={Colors.yellow} strokeWidth="1.5" opacity={0.7} />

    <Circle cx="268" cy="82" r="4" fill={Colors.mint} opacity={0.9} />
    <Line x1="268" y1="74" x2="268" y2="90" stroke={Colors.mint} strokeWidth="1.5" opacity={0.7} />
    <Line x1="260" y1="82" x2="276" y2="82" stroke={Colors.mint} strokeWidth="1.5" opacity={0.7} />

    {/* Starburst top-right */}
    {[0,45,90,135,180,225,270,315].map((deg, i) => {
      const r = Math.PI * deg / 180;
      return <Line key={i} x1={295} y1={45}
        x2={295 + Math.cos(r) * 18} y2={45 + Math.sin(r) * 18}
        stroke={Colors.mint} strokeWidth="2" strokeLinecap="round" opacity={0.6} />;
    })}
    <Circle cx="295" cy="45" r="6" fill={Colors.mint} opacity={0.8} />
  </Svg>
);

// Slide 2 — Phone + Notifications
const PhoneIllustration = () => (
  <Svg width={W * 0.85} height={220} viewBox="0 0 320 220" fill="none">
    {/* Phone body */}
    <Rect x="100" y="30" width="120" height="185" rx="18" fill="white" stroke={Colors.textPrimary} strokeWidth="2.5" />
    {/* Screen */}
    <Rect x="108" y="48" width="104" height="152" rx="10" fill="#F7FBF9" />
    {/* Camera notch */}
    <Circle cx="160" cy="42" r="5" fill="#E8E4D9" />
    {/* Calendar grid inside phone */}
    <Rect x="118" y="58" width="84" height="70" rx="6" fill="white" stroke={Colors.border} strokeWidth="1" />
    {/* Calendar header */}
    <Rect x="118" y="58" width="84" height="18" rx="6" fill={Colors.mint} />
    <Rect x="118" y="70" width="84" height="6" rx="0" fill={Colors.mint} />
    {/* Calendar grid lines */}
    {[0,1,2].map(r => [0,1,2,3,4,5,6].map(c => (
      <Rect key={`${r}-${c}`} x={120 + c * 12} y={80 + r * 14} width={10} height={11} rx="2"
        fill={r === 0 && c === 2 ? Colors.coral : r === 1 && c === 4 ? Colors.yellow : '#F0F4F3'}
        opacity={0.9} />
    )))}

    {/* Notification bubble 1 — top-left */}
    <Rect x="28" y="20" width="88" height="36" rx="10" fill="white" stroke={Colors.coral} strokeWidth="1.8" />
    <Circle cx="45" cy="38" r="8" fill={Colors.coralLight} />
    <Path d="M40 38L44 42L51 34" stroke={Colors.coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="58" y1="32" x2="108" y2="32" stroke="#D4EDE8" strokeWidth="1.5" />
    <Line x1="58" y1="40" x2="100" y2="40" stroke="#D4EDE8" strokeWidth="1.5" />

    {/* Notification bubble 2 — top-right */}
    <Rect x="200" y="30" width="86" height="34" rx="10" fill="white" stroke={Colors.yellow} strokeWidth="1.8" />
    <Circle cx="216" cy="47" r="8" fill={Colors.yellowLight} />
    {/* Mini star inside */}
    <Path d="M216 41L217.5 45.5H222L218.5 48L219.7 52.5L216 50L212.3 52.5L213.5 48L210 45.5H214.5L216 41Z"
      fill={Colors.yellow} scale="0.55" origin="216, 47" />
    <Line x1="228" y1="41" x2="278" y2="41" stroke="#D4EDE8" strokeWidth="1.5" />
    <Line x1="228" y1="49" x2="270" y2="49" stroke="#D4EDE8" strokeWidth="1.5" />

    {/* Notification bubble 3 — bottom-right */}
    <Rect x="195" y="140" width="88" height="36" rx="10" fill="white" stroke="#A78BFA" strokeWidth="1.8" />
    <Circle cx="212" cy="158" r="8" fill={Colors.purpleLight} />
    <Path d="M208 156L211 160L218 153" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="225" y1="152" x2="275" y2="152" stroke="#D4EDE8" strokeWidth="1.5" />
    <Line x1="225" y1="160" x2="265" y2="160" stroke="#D4EDE8" strokeWidth="1.5" />

    {/* Arrow pointing to notif 1 */}
    <Path d="M95 38C95 38 98 30 104 35" stroke={Colors.coral} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <Path d="M104 35L100 34L103 38" stroke={Colors.coral} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Floating heart */}
    <Path d="M275 35C275 35 264 27 264 20C264 16 267 13 270 13C271.8 13 273.3 14 275 16C276.7 14 278.2 13 280 13C283 13 286 16 286 20C286 27 275 35 275 35Z"
      fill={Colors.coral} fillOpacity={0.25} stroke={Colors.coral} strokeWidth="1.5" />
  </Svg>
);

// Slide 3 — AI Lightbulb Scene
const AISuiteIllustration = () => (
  <Svg width={W * 0.85} height={220} viewBox="0 0 320 220" fill="none">
    {/* Thought bubbles leading to bulb */}
    <Circle cx="80" cy="160" r="8" fill={Colors.purpleLight} stroke="#A78BFA" strokeWidth="1.5" />
    <Circle cx="102" cy="148" r="12" fill={Colors.purpleLight} stroke="#A78BFA" strokeWidth="1.5" />
    <Circle cx="134" cy="132" r="18" fill={Colors.purpleLight} stroke="#A78BFA" strokeWidth="1.8" />

    {/* Lightbulb body */}
    <Path d="M160 60C140 60 126 74 126 92C126 108 136 118 142 126V136H178V126C184 118 194 108 194 92C194 74 180 60 160 60Z"
      fill={Colors.yellowLight} stroke={Colors.textPrimary} strokeWidth="2.2" strokeLinejoin="round" />
    {/* Base */}
    <Rect x="142" y="136" width="36" height="9" rx="4" fill={Colors.yellow} stroke={Colors.textPrimary} strokeWidth="1.8" />
    <Line x1="148" y1="145" x2="172" y2="145" stroke={Colors.textPrimary} strokeWidth="1.8" strokeLinecap="round" />
    {/* Filament */}
    <Path d="M153 105L160 96L167 105" stroke={Colors.yellowDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Rays */}
    {[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0]].map(([dx, dy], i) => (
      <Line key={i}
        x1={160 + dx * 26} y1={92 + dy * 26}
        x2={160 + dx * 37} y2={92 + dy * 37}
        stroke={Colors.yellow} strokeWidth="2.2" strokeLinecap="round" opacity={0.8} />
    ))}
    <Line x1={160} y1={92-26} x2={160} y2={92-40} stroke={Colors.yellow} strokeWidth="2.5" strokeLinecap="round" opacity={0.9} />

    {/* Radiating sparkles */}
    {[[50,55],[260,55],[50,155],[260,155]].map(([cx,cy],i) => (
      <G key={i}>
        <Circle cx={cx} cy={cy} r="4" fill={Colors.yellow} opacity={0.9} />
        <Line x1={cx} y1={cy-8} x2={cx} y2={cy+8} stroke={Colors.yellow} strokeWidth="1.5" opacity={0.7} />
        <Line x1={cx-8} y1={cy} x2={cx+8} y2={cy} stroke={Colors.yellow} strokeWidth="1.5" opacity={0.7} />
      </G>
    ))}

    {/* Small book left */}
    <Rect x="30" y="68" width="42" height="54" rx="4" fill="white" stroke={Colors.textPrimary} strokeWidth="1.5" />
    <Rect x="30" y="68" width="8" height="54" rx="4" fill={Colors.mint} />
    <Line x1="42" y1="82" x2="66" y2="82" stroke="#D4EDE8" strokeWidth="1.2" />
    <Line x1="42" y1="91" x2="66" y2="91" stroke="#D4EDE8" strokeWidth="1.2" />
    <Line x1="42" y1="100" x2="66" y2="100" stroke="#D4EDE8" strokeWidth="1.2" />
    <Line x1="42" y1="109" x2="60" y2="109" stroke="#D4EDE8" strokeWidth="1.2" />

    {/* Rocket top-right */}
    <Path d="M248 52C248 52 256 38 264 38C272 38 278 52 278 68H234C234 52 248 52 248 52Z"
      fill={Colors.mintLight} stroke={Colors.mint} strokeWidth="1.8" strokeLinejoin="round" />
    <Path d="M234 68L228 80L240 74" fill={Colors.mint} fillOpacity={0.4} stroke={Colors.mint} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M278 68L284 80L272 74" fill={Colors.mint} fillOpacity={0.4} stroke={Colors.mint} strokeWidth="1.5" strokeLinejoin="round" />
    <Circle cx="256" cy="60" r="7" fill={Colors.mint} fillOpacity={0.5} stroke={Colors.mint} strokeWidth="1.5" />
    <Path d="M248 76C250 82 256 84 262 82" stroke="#FF6B6B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);

// ──────────────────────────────────────────────────────────
//  SLIDE DATA
// ──────────────────────────────────────────────────────────
const SLIDES = [
  {
    key: 'desk',
    heading: 'Your classroom,\nin your pocket',
    sub: 'Attendance, grades, homework — all in one place',
    accent: Colors.mint,
    Illustration: DeskIllustration,
  },
  {
    key: 'phone',
    heading: 'Never miss\na thing',
    sub: 'Get notified about tests, assignments and results instantly',
    accent: Colors.coral,
    Illustration: PhoneIllustration,
  },
  {
    key: 'ai',
    heading: 'Your AI\nstudy buddy',
    sub: 'Ask anything. Get explained like a friend would explain it.',
    accent: '#A78BFA',
    Illustration: AISuiteIllustration,
  },
];

// ──────────────────────────────────────────────────────────
//  DOT INDICATOR
// ──────────────────────────────────────────────────────────
const Dots = ({ current, total }: { current: number; total: number }) => (
  <View style={dotStyles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          dotStyles.dot,
          i === current
            ? { backgroundColor: Colors.mint, width: 22 }
            : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.textLight },
        ]}
      />
    ))}
  </View>
);

const dotStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { height: 8, borderRadius: 6, width: 8 },
});

// ──────────────────────────────────────────────────────────
//  MAIN ONBOARDING SCREEN
// ──────────────────────────────────────────────────────────
export default function Onboarding() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slide carousel */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={s => s.key}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / W);
          setCurrent(idx);
        }}
        renderItem={({ item }) => {
          const { Illustration } = item;
          return (
            <View style={[styles.slide, { width: W }]}>
              {/* Illustration area */}
              <View style={styles.illustrationArea}>
                {/* Ambient starburst top-right */}
                <View style={[{ position: 'absolute', top: 10, right: 12 }]} pointerEvents="none">
                  <DoodleStarburst size={38} color={item.accent} />
                </View>
                <Illustration />
              </View>

              {/* Wave divider */}
              <View style={{ alignItems: 'center', marginVertical: 6 }}>
                <DoodleWave size={36} color={item.accent} />
              </View>

              {/* Text */}
              <View style={styles.textArea}>
                <Text style={[styles.heading, { color: item.accent }]}>
                  {item.heading}
                </Text>
                <Text style={styles.sub}>{item.sub}</Text>

                {/* Last slide CTA */}
                {item.key === 'ai' && (
                  <View style={{ marginTop: 28 }}>
                    <KlassoButton
                      label="Let's Go!"
                      variant="primary"
                      size="lg"
                      onPress={() => router.replace('/login')}
                      style={{ width: W - 64, alignSelf: 'center' }}
                    />
                    <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 14, alignItems: 'center' }}>
                      <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text style={{ color: Colors.coral }}>Log in</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Dots + Next */}
      <View style={styles.footer}>
        <Dots current={current} total={SLIDES.length} />
        {current < SLIDES.length - 1 && (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  skipBtn: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { fontFamily: Fonts.accent, fontSize: 18, color: Colors.coral },
  slide: { alignItems: 'center', paddingTop: 70 },
  illustrationArea: {
    width: W * 0.85,
    height: H * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textArea: { width: W - 64, alignItems: 'center', marginTop: 8 },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 27,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginText: {
    fontFamily: Fonts.accent,
    fontSize: 17,
    color: Colors.textMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 44,
    left: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextBtn: {
    backgroundColor: Colors.mint,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 100,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  nextText: { fontFamily: Fonts.heading, fontSize: 15, color: Colors.textPrimary },
});
