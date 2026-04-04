import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { KlassoCard } from './KlassoCard';

// Badge SVG factory
const getBadgeSVG = (iconName: string, color: string, size = 48) => {
  switch (iconName) {
    case 'SunRisingSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M6 16c0-3.31 2.69-6 6-6s6 2.69 6 6" fill={color} opacity={0.3} />
        </Svg>
      );
    case 'CheckmarkCircleSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} fill={`${color}20`} />
          <Path d="M8 12.5l3 3 5-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'FlameSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C12 2 17 8 17 13C17 16.5 14.5 19 12 19C9.5 19 7 16.5 7 13C7 8 12 2 12 2Z" fill={color} />
          <Path d="M12 6C12 6 15 10 15 14C15 16.2 13.5 18 12 18C10.5 18 9 16.2 9 14C9 10 12 6 12 6Z" fill="#FFE566" />
        </Svg>
      );
    case 'StarCrownSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
          <Path d="M8 10l4-3 4 3v4H8v-4z" fill="#FFE566" />
        </Svg>
      );
    case 'RocketSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4.5 16.5c3.6 1.5 6 1.5 9.5 0 2-4 5-9.5 5-9.5-3.5 0-9.5 3-9.5 5 0 2-3.5 6-5 4.5z" fill={color} />
          <Path d="M10 14l-2 5 2-1 1-2" fill="#FF8C42" />
        </Svg>
      );
    case 'PhoenixSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={`${color}30`} stroke={color} strokeWidth={2} />
          <Path d="M12 8v8M8 12l4-4 4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'CalendarStarSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth={2} />
          <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} />
          <Path d="M12 12l1.5 3 3 .5-2.5 2 .5 3-2.5-1.5L9.5 20l.5-3-2.5-2 3-.5L12 12z" fill={color} />
        </Svg>
      );
    case 'FootprintSVG':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 21c-4 0-5-5-5-9 0-3 2-6 5-6s5 3 5 6c0 4-1 9-5 9z" fill={`${color}40`} stroke={color} strokeWidth={2} />
          <Circle cx="12" cy="4" r="2" fill={color} />
          <Circle cx="8" cy="6" r="1.5" fill={color} />
          <Circle cx="16" cy="6" r="1.5" fill={color} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="12" fill={color} opacity={0.5} />
        </Svg>
      );
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'LEGENDARY': return '#FFD700';
    case 'EPIC': return '#B5A8FF';
    case 'RARE': return '#FF8C42';
    default: return '#3ECFB2';
  }
};

export default function BadgeCard({ badge, earnedAt, locked = false, customStyle = {} }: { badge: any, earnedAt: any, locked?: boolean, customStyle?: any }) {
  const Icon = getBadgeSVG(badge.iconName, badge.color, 48);
  const rarityColor = getRarityColor(badge.rarity);

  return (
    <KlassoCard 
      style={[
        styles.card, 
        locked && styles.lockedCard,
        customStyle
      ]} 
      variant='default'
    >
      <View style={styles.iconContainer}>
        {Icon}
      </View>
      <Text style={[styles.name, locked && styles.lockedText]}>{badge.name}</Text>
      
      {locked ? (
        <>
          <Text style={styles.desc}>{badge.description}</Text>
          <View style={styles.lockedPill}>
            <Text style={styles.lockedPillText}>LOCKED</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.date}>Earned {new Date(earnedAt).toLocaleDateString()}</Text>
          <View style={[styles.rarityPill, { backgroundColor: `${rarityColor}20`, borderColor: rarityColor }]}>
            <Text style={[styles.rarityText, { color: rarityColor === '#FFD700' ? '#D4B300' : rarityColor }]}>
              {badge.rarity}
            </Text>
          </View>
        </>
      )}
    </KlassoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  lockedCard: {
    opacity: 0.6,
  },
  iconContainer: {
    marginBottom: 12,
  },
  name: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#2C2A24',
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedText: {
    color: '#7A7670',
  },
  date: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 14,
    color: '#7A7670',
    marginBottom: 8,
  },
  desc: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#7A7670',
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  rarityText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
  },
  lockedPill: {
    backgroundColor: '#E8E4D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#7A7670',
  }
});
