import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme/colors';

type BadgeColor = 'mint' | 'coral' | 'yellow' | 'purple' | 'gray';

const COLOR_CONFIG: Record<BadgeColor, { bg: string; text: string; border: string }> = {
  mint:   { bg: Colors.mintLight,   text: Colors.mintDark,     border: Colors.mint },
  coral:  { bg: Colors.coralLight,  text: Colors.coralDark,    border: Colors.coral },
  yellow: { bg: Colors.yellowLight, text: Colors.yellowDark,   border: Colors.yellow },
  purple: { bg: Colors.purpleLight, text: Colors.purpleDark,   border: Colors.purple },
  gray:   { bg: '#F0F4F3',          text: Colors.textMuted,    border: Colors.border },
};

interface KlassoBadgeProps {
  label: string;
  color?: BadgeColor;
}

export const KlassoBadge = ({ label, color = 'mint' }: KlassoBadgeProps) => {
  const c = COLOR_CONFIG[color];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    borderWidth: 1.2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
