import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { KlassoButton } from './KlassoButton';
import { DoodleSparkle } from './doodles';
import { Colors, Fonts } from '../../constants/theme';

export function LevelUpModal({ visible, newLevel, newTitle, onClose }: { visible: boolean, newLevel: number, newTitle: string, onClose: () => void }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
           Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
           Animated.spring(scale, { toValue: 1.2, friction: 5, useNativeDriver: true })
        ]),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true })
      ]).start();

      // Auto dismiss after 4 seconds
      const t = setTimeout(() => handleClose(), 4000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={styles.confettiArea}>
        {[...Array(12)].map((_, i) => (
           <View key={i} style={{ position: 'absolute', top: `${Math.random()*80}%`, left: `${Math.random()*80+10}%` }}>
             <DoodleSparkle size={Math.random()*30 + 10} color={Math.random() > 0.5 ? Colors.yellow : 'white'} />
           </View>
        ))}
      </View>
      
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <Svg width={120} height={120} viewBox="0 0 100 100">
           <Path d="M50 5 L90 20 L90 60 C90 80 60 95 50 95 C40 95 10 80 10 60 L10 20 Z" fill={Colors.yellow} />
           <Path d="M50 12 L82 25 L82 58 C82 72 60 85 50 85 C40 85 18 72 18 58 L18 25 Z" fill={Colors.mint} />
           <Text style={{ fontFamily: Fonts.headingXB, fontSize: 44, color: 'white', position: 'absolute', width: 120, height: 120, textAlign: 'center', textAlignVertical: 'center' }}>{newLevel}</Text>
        </Svg>
        <Text style={styles.levelUpText}>LEVEL UP!</Text>
        <Text style={styles.titleText}>You are now {newTitle}</Text>

        <View style={styles.btnWrap}>
           <KlassoButton label="Awesome!" onPress={handleClose} variant="primary" />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(62, 207, 178, 0.95)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiArea: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
  },
  levelUpText: {
    fontFamily: Fonts.headingXB,
    fontSize: 48,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 0,
    marginTop: 16,
  },
  titleText: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 26,
    color: 'white',
    marginTop: 4,
  },
  btnWrap: {
    marginTop: 32,
    width: 200,
  }
});
