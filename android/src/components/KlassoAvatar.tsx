import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { Colors, Fonts } from '../theme/colors';

// Hand-drawn imperfect oval ring around the avatar
const HandDrawnRing = ({ size }: { size: number }) => {
  const r = size / 2;
  return (
    <Svg
      width={size + 12}
      height={size + 12}
      viewBox={`0 0 ${size + 12} ${size + 12}`}
      fill="none"
      style={{ position: 'absolute', top: -6, left: -6 }}
    >
      {/* Slightly wobbly oval — intentionally imperfect */}
      <Ellipse
        cx={(size + 12) / 2}
        cy={(size + 12) / 2 + 1}
        rx={r + 4}
        ry={r + 3}
        stroke={Colors.mint}
        strokeWidth="1.8"
        strokeDasharray="4 3"
        fill="none"
      />
      <Ellipse
        cx={(size + 12) / 2 - 1}
        cy={(size + 12) / 2}
        rx={r + 5}
        ry={r + 4}
        stroke={Colors.mint}
        strokeWidth="0.6"
        fill="none"
        opacity={0.35}
      />
    </Svg>
  );
};

interface KlassoAvatarProps {
  name?: string;
  imageUri?: string;
  size?: number;
  online?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

// Simple color from name — deterministic pastel
const avatarBg = (name: string) => {
  const palette = [
    Colors.mintLight, Colors.coralLight, Colors.yellowLight, Colors.purpleLight,
  ];
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[sum % palette.length];
};

export const KlassoAvatar = ({
  name = 'User',
  imageUri,
  size = 48,
  online = false,
}: KlassoAvatarProps) => {
  const initials = getInitials(name);
  const bg = avatarBg(name);

  return (
    <View style={{ width: size + 12, height: size + 12, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      {/* Hand-drawn ring */}
      <HandDrawnRing size={size} />

      {/* Circle avatar */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: imageUri ? 'transparent' : bg,
            borderColor: Colors.mint,
          },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <Text
            style={[
              styles.initials,
              { fontSize: size * 0.34, color: Colors.textPrimary },
            ]}
          >
            {initials}
          </Text>
        )}
      </View>

      {/* Online dot */}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              bottom: 4,
              right: 4,
              width: 9,
              height: 9,
              borderRadius: 4.5,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: Colors.coral,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
});
