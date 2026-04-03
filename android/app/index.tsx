import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { getToken } from '@/lib/api';
import {
  Colors, Fonts,
  DoodleStarburst, DoodleCloud, DoodleSparkle, DoodleRocket,
  DoodleDiamond, DoodleCircleDot, DoodlePencil
} from '@/src/components';
import Svg, { Path } from 'react-native-svg';

export default function SplashScreen() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: -15, duration: 400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
          ])
        )
      ]);
    };

    Animated.parallel([
      createBounce(anim1, 0),
      createBounce(anim2, 150),
      createBounce(anim3, 300),
    ]).start();

    const timer = setTimeout(() => {
      void (async () => {
        const t = await getToken();
        if (t) router.replace('/(tabs)');
        else router.replace('/login');
      })();
    }, 2000);

    return () => clearTimeout(timer);
  }, [anim1, anim2, anim3]);

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={{ position: 'absolute', top: '10%', left: -30, opacity: 0.3 }}>
        <DoodleStarburst size={120} color="white" />
      </View>
      <View style={{ position: 'absolute', top: '15%', right: 20, opacity: 0.25 }}>
        <DoodleCloud size={80} color="white" />
      </View>
      <View style={{ position: 'absolute', bottom: '15%', right: -20 }}>
        <DoodleRocket size={80} color={Colors.yellow} />
      </View>
      <View style={{ position: 'absolute', bottom: '25%', left: 40, opacity: 0.4 }}>
        <DoodleSparkle size={50} color="white" />
      </View>
      <View style={{ position: 'absolute', top: '45%', left: 20, opacity: 0.2 }}>
        <DoodleDiamond size={40} color="white" />
      </View>
      <View style={{ position: 'absolute', top: '50%', right: 30 }}>
        <DoodleCircleDot size={35} color={Colors.yellow} />
      </View>

      {/* Main Logo Area */}
      <View style={styles.center}>
        <Text style={styles.title}>Klasso</Text>
        <Svg width="180" height="20" viewBox="0 0 180 20" style={styles.underline}>
          <Path
            d="M5 10 C 30 -5, 60 25, 90 10 C 120 -5, 150 25, 175 10"
            stroke={Colors.coral}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <Text style={styles.tagline}>school, but make it fun ✦</Text>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loader}>
        <Animated.View style={{ transform: [{ translateY: anim1 }] }}>
          <DoodlePencil size={32} color="white" />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: anim2 }] }}>
          <DoodlePencil size={32} color="white" />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: anim3 }] }}>
          <DoodlePencil size={32} color="white" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    marginTop: -50,
  },
  title: {
    fontFamily: Fonts.headingXB,
    fontSize: 56,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  underline: {
    marginTop: -10,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: Fonts.accent,
    fontSize: 22,
    color: 'white',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 16,
  },
});
