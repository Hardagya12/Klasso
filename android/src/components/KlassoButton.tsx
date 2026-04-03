import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, retroShadow, Radius, Fonts } from '../theme/colors';

type Variant = 'primary' | 'coral' | 'ghost' | 'yellow';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CONFIG: Record<Variant, {
  bg: string; text: string; border: string; shadow: string;
}> = {
  primary: { bg: Colors.mint,   text: Colors.textPrimary,  border: Colors.mint,   shadow: Colors.shadow },
  coral:   { bg: Colors.coral,  text: '#FFFFFF',            border: Colors.coral,  shadow: Colors.coralDark },
  ghost:   { bg: Colors.surface,text: Colors.mint,          border: Colors.mint,   shadow: Colors.mint },
  yellow:  { bg: Colors.yellow, text: Colors.textPrimary,   border: Colors.yellow, shadow: Colors.yellowDark },
};

const SIZE_CONFIG: Record<Size, { px: number; py: number; font: number; iconSize: number }> = {
  sm: { px: 16, py: 8,  font: 13, iconSize: 14 },
  md: { px: 24, py: 12, font: 15, iconSize: 18 },
  lg: { px: 32, py: 16, font: 17, iconSize: 22 },
};

// Tiny spinning pencil for loading state
const SpinningPencil = () => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={16} height={16} viewBox="0 0 40 40" fill="none">
        <Path
          d="M8 30L28 10L35 17L15 37L8 30Z"
          fill="white"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <Path d="M8 30L5 38L13 35L8 30Z" fill="white" />
      </Svg>
    </Animated.View>
  );
};

interface KlassoButtonProps {
  label: string;
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const KlassoButton = ({
  label,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  onPress,
  disabled = false,
  style,
}: KlassoButtonProps) => {
  const v = VARIANT_CONFIG[variant];
  const s = SIZE_CONFIG[size];
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: isGhost ? 1.5 : 0,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          opacity: disabled ? 0.5 : 1,
          ...retroShadow(3, 3, v.shadow),
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <SpinningPencil />
        ) : (
          <>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text
              style={[
                styles.label,
                { color: v.text, fontSize: s.font },
              ]}
            >
              {label}
            </Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontFamily: Fonts.heading,
    letterSpacing: 0.2,
  },
  iconLeft: { marginRight: 2 },
  iconRight: { marginLeft: 2 },
});
