import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, retroShadow, Radius, Fonts } from '../theme/colors';
import {
  DoodleStar, DoodleSparkle, DoodleCheckCircle, DoodleRocket,
} from './doodles/index';

type StatType = 'attendance' | 'grade' | 'assignment' | 'streak' | 'default';

const STAT_CONFIG: Record<StatType, {
  bg: string; shadow: string; doodle: React.FC<any>; doodleColor: string;
}> = {
  attendance: {
    bg: Colors.mintLight,   shadow: Colors.mintDark,
    doodle: DoodleCheckCircle, doodleColor: Colors.mint,
  },
  grade: {
    bg: Colors.purpleLight, shadow: Colors.purpleDark,
    doodle: DoodleStar,        doodleColor: Colors.purple,
  },
  assignment: {
    bg: Colors.yellowLight, shadow: Colors.yellowDark,
    doodle: DoodleSparkle,     doodleColor: Colors.yellowDark,
  },
  streak: {
    bg: Colors.coralLight,  shadow: Colors.coralDark,
    doodle: DoodleRocket,      doodleColor: Colors.coral,
  },
  default: {
    bg: '#F0F4F3',          shadow: Colors.shadow,
    doodle: DoodleSparkle,     doodleColor: Colors.mint,
  },
};

interface StatCardProps {
  value: string | number;
  label: string;
  statType?: StatType;
  sublabel?: string;
  style?: import('react-native').StyleProp<ViewStyle>;
}

export const StatCard = ({
  value,
  label,
  statType = 'default',
  sublabel,
  style,
}: StatCardProps) => {
  const cfg = STAT_CONFIG[statType];
  const DoodleComp = cfg.doodle;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cfg.bg,
          ...retroShadow(4, 4, cfg.shadow),
        },
        style,
      ]}
    >
      {/* Background doodle (watermark) */}
      <View style={styles.bgDoodle} pointerEvents="none">
        <DoodleComp size={40} color={cfg.doodleColor} />
      </View>

      {/* Stat value */}
      <Text style={styles.value}>{value}</Text>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Optional sublabel */}
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bgDoodle: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    opacity: 0.08,
  },
  value: {
    fontFamily: Fonts.headingXB,
    fontSize: 26,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sublabel: {
    fontFamily: Fonts.accent,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
