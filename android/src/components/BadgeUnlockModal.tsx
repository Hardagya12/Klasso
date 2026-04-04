import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { KlassoButton } from './KlassoButton';

interface BadgeUnlockModalProps {
  visible: boolean;
  badge: any;
  onClose: () => void;
}

export default function BadgeUnlockModal({ visible, badge, onClose }: BadgeUnlockModalProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const confettiY = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (visible && badge) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.3,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(confettiY, {
        toValue: 800,
        duration: 2500,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(0);
      opacity.setValue(0);
      confettiY.setValue(-200);
    }
  }, [visible, badge, scale, opacity, confettiY]);

  if (!badge) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Confetti Animation */}
        <Animated.View style={[styles.confettiContainer, { transform: [{ translateY: confettiY }] }]}>
           <Svg width="100%" height={200} viewBox="0 0 300 200" fill="none">
              <Rect x="50" y="20" width="10" height="20" fill="#FF8C42" transform="rotate(45 50 20)"/>
              <Rect x="150" y="40" width="8" height="15" fill="#3ECFB2" transform="rotate(20 150 40)"/>
              <Rect x="250" y="10" width="12" height="18" fill="#B5A8FF" transform="rotate(75 250 10)"/>
              <Circle cx="100" cy="80" r="5" fill="#FFD700" />
              <Circle cx="200" cy="60" r="6" fill="#FF6B6B" />
           </Svg>
        </Animated.View>

        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.title}>Badge Unlocked!</Text>
          
          <View style={styles.badgeContainer}>
            {/* Simple spark burst behind */}
            <View style={styles.sparkleBg}>
              <Svg width={150} height={150} viewBox="0 0 100 100">
                <Path d="M50 0L55 45L100 50L55 55L50 100L45 55L0 50L45 45Z" fill="#FFE566" opacity={0.3} />
              </Svg>
            </View>
            
            <View style={[styles.badgeCircle, { borderColor: badge.color, backgroundColor: `${badge.color}15` }]}>
              {/* Dummy SVG icon here, real code uses same factory as BadgeCard */}
              <Svg width={64} height={64} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" fill={badge.color} />
              </Svg>
            </View>
          </View>

          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDesc}>{badge.description}</Text>
          
          <View style={styles.buttonWrapper}>
            <KlassoButton onPress={onClose} label="Awesome!" />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 43, 39, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
  },
  content: {
    backgroundColor: '#FDFBF5',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    borderWidth: 3,
    borderColor: '#2C2A24',
    shadowColor: '#1C2B27',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    zIndex: 10,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: '#2C2A24',
    marginBottom: 24,
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sparkleBg: {
    position: 'absolute',
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  badgeName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#2C2A24',
    marginBottom: 8,
  },
  badgeDesc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#7A7670',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
  }
});
