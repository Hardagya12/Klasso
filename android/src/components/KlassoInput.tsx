import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Fonts } from '../theme/colors';

// Pencil icon for focused state
const PencilTip = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 40 40" fill="none">
    <Path
      d="M8 30L28 10L35 17L15 37L8 30Z"
      fill={color}
      fillOpacity={0.2}
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path d="M8 30L5 38L13 35L8 30Z" fill={color} stroke={color} strokeWidth="1.5" />
    <Path d="M29 11L34 8L35 17L30 16" fill="#FF6B6B" stroke="#FF6B6B" strokeWidth="1" />
  </Svg>
);

// X for error state
const ErrorX = () => (
  <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="9" fill={Colors.coralLight} stroke={Colors.coral} strokeWidth="1.5" />
    <Path d="M7 7L13 13M13 7L7 13" stroke={Colors.coral} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

interface KlassoInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const KlassoInput = ({
  label,
  error,
  containerStyle,
  ...inputProps
}: KlassoInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(inputProps.value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!inputProps.value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = error
    ? Colors.coral
    : isFocused
    ? Colors.mint
    : Colors.border;

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, -4] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 12] });
  const labelColor = isFocused ? Colors.mint : Colors.textMuted;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Floating label */}
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelSize,
              color: error ? Colors.coral : labelColor,
              fontFamily: isFocused ? Fonts.accent : Fonts.body,
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          {...inputProps}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { borderBottomColor: borderColor },
            inputProps.style,
          ]}
          placeholderTextColor={Colors.textLight}
        />
        {/* Right icon: pencil when focused, X when error */}
        <View style={styles.rightIcon}>
          {error ? <ErrorX /> : isFocused ? <PencilTip color={Colors.mint} /> : null}
        </View>
      </View>

      {/* Error message */}
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: 18,
    paddingBottom: 4,
  },
  label: {
    position: 'absolute',
    left: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    paddingBottom: 8,
    paddingTop: 4,
    // No box border — just bottom underline (ruled notebook style)
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    backgroundColor: 'transparent',
    outlineWidth: 0,
  } as any,
  rightIcon: {
    marginLeft: 8,
    width: 20,
    alignItems: 'center',
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.coral,
    marginTop: 4,
  },
});
