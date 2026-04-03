import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, retroShadow, Radius, Fonts } from '../theme/colors';
import {
  DoodleStar, DoodlePencil, DoodleCloud, DoodleLeaf,
} from './doodles/index';

type Variant = 'default' | 'mint' | 'coral' | 'yellow' | 'purple';
type DoodleType = 'star' | 'pencil' | 'cloud' | 'plant' | 'none';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; shadow: string }> = {
  default: { bg: Colors.surface,    border: Colors.border,    shadow: Colors.shadow },
  mint:    { bg: Colors.mintLight,  border: Colors.mint,      shadow: Colors.mintDark },
  coral:   { bg: Colors.coralLight, border: Colors.coral,     shadow: Colors.coralDark },
  yellow:  { bg: Colors.yellowLight,border: Colors.yellow,    shadow: Colors.yellowDark },
  purple:  { bg: Colors.purpleLight,border: Colors.purple,    shadow: Colors.purpleDark },
};

const SIZE_STYLES: Record<Size, { padding: number; radius: number }> = {
  sm: { padding: 12, radius: Radius.sm },
  md: { padding: 16, radius: Radius.md },
  lg: { padding: 20, radius: Radius.lg },
};

const DOODLE_MAP: Record<DoodleType, React.FC<{ size: number; color: string }> | null> = {
  star:   DoodleStar,
  pencil: DoodlePencil,
  cloud:  DoodleCloud,
  plant:  DoodleLeaf,
  none:   null,
};

interface KlassoCardProps {
  children: React.ReactNode;
  variant?: Variant;
  doodle?: DoodleType;
  size?: Size;
  style?: import('react-native').StyleProp<ViewStyle>;
}

export const KlassoCard = ({
  children,
  variant = 'default',
  doodle = 'none',
  size = 'md',
  style,
}: KlassoCardProps) => {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const DoodleComp = DOODLE_MAP[doodle];

  // Pick a doodle color based on variant
  const doodleColor = variant === 'coral' ? Colors.coral
    : variant === 'yellow' ? Colors.yellowDark
    : variant === 'purple' ? Colors.purple
    : Colors.mint;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderRadius: s.radius,
          padding: s.padding,
          ...retroShadow(4, 4, v.shadow),
        },
        style,
      ]}
    >
      {/* Corner doodle decoration */}
      {DoodleComp && (
        <View style={styles.cornerDoodle} pointerEvents="none">
          <DoodleComp size={28} color={doodleColor} />
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'visible',
  },
  cornerDoodle: {
    position: 'absolute',
    top: -6,
    right: -6,
    opacity: 0.35,
    zIndex: 10,
  },
});
