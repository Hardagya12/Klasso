import React from 'react';
import Svg, { Path, Circle, Line, Rect, Ellipse, Polygon } from 'react-native-svg';

// ─── Shared type ────────────────────────────────────────────────────────────
interface DoodleProps {
  size?: number;
  color?: string;
}

// ─── 1. DoodleStar ──────────────────────────────────────────────────────────
// 5-pointed, slightly wobbly & asymmetric
export const DoodleStar = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 3L24.7 14.3H37L27 21.5L30.6 33.5L20 27L9.4 33.5L13.1 21.4L3 14.3H15.4L20 3Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Slight extra wobble stroke */}
    <Path
      d="M20 5L23.9 14.8H35.8L26.5 21.2L29.8 32L20 26.5L10.2 32L13.6 21.1L4.2 14.8H16.2L20 5Z"
      stroke={color}
      strokeWidth="0.8"
      fill="none"
      opacity={0.4}
    />
  </Svg>
);

// ─── 2. DoodleCloud ─────────────────────────────────────────────────────────
export const DoodleCloud = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 50 35" fill="none">
    <Path
      d="M10 28C5 28 2 24 2 20C2 16.5 4.5 13.5 8 13C8 8.5 11.5 5 16 5C18.5 5 20.8 6.2 22.2 8.1C23.2 7.5 24.5 7 26 7C29.5 7 32 9.5 32 13C32 13.2 32 13.4 32 13.5C35.5 14 38 17 38 20.5C38 24.5 35 28 31 28H10Z"
      fill={color}
      fillOpacity={0.2}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cute face */}
    <Circle cx="18" cy="20" r="1.2" fill={color} />
    <Circle cx="24" cy="20" r="1.2" fill={color} />
    <Path d="M19.5 23C20.5 24 22.5 24 23.5 23" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

// ─── 3. DoodlePencil ────────────────────────────────────────────────────────
export const DoodlePencil = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Body */}
    <Path
      d="M8 30L28 10L35 17L15 37L8 30Z"
      fill={color}
      fillOpacity={0.25}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Tip */}
    <Path d="M8 30L5 38L13 35L8 30Z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    {/* Eraser band */}
    <Path d="M26 12L31 9L35 13L30 16" fill="#FF6B6B" fillOpacity={0.6} stroke="#FF6B6B" strokeWidth="1.2" />
    {/* Center line */}
    <Path d="M11 27L28 10" stroke={color} strokeWidth="0.8" strokeDasharray="2 2" opacity={0.6} />
  </Svg>
);

// ─── 4. DoodleLeaf ──────────────────────────────────────────────────────────
export const DoodleLeaf = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 35C20 35 5 25 5 13C5 7 10 4 20 5C30 4 35 7 35 13C35 25 20 35 20 35Z"
      fill={color}
      fillOpacity={0.2}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Vein */}
    <Path d="M20 35L20 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M20 20L27 14" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity={0.7} />
    <Path d="M20 20L13 14" stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity={0.7} />
  </Svg>
);

// ─── 5. DoodleHeart ─────────────────────────────────────────────────────────
export const DoodleHeart = ({ size = 28, color = '#FF6B6B' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 34S4 24 4 13.5C4 8.8 7.6 5 12 5C14.8 5 17.3 6.4 19 8.6C20.7 6.3 23.3 5 26 5C30.4 5 34 8.8 34 13.5C34 24 20 34 20 34Z"
      fill={color}
      fillOpacity={0.3}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Extra hand-drawn wobble */}
    <Path
      d="M20 32C20 32 6 23 6 13.5C6 9.6 9 6.5 12 6.5"
      stroke={color}
      strokeWidth="0.7"
      opacity={0.4}
      fill="none"
    />
  </Svg>
);

// ─── 6. DoodleSparkle ───────────────────────────────────────────────────────
export const DoodleSparkle = ({ size = 28, color = '#FFE566' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 3L22.5 17.5L37 20L22.5 22.5L20 37L17.5 22.5L3 20L17.5 17.5L20 3Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <Circle cx="20" cy="20" r="3" fill="white" opacity={0.6} />
  </Svg>
);

// ─── 7. DoodleBook ──────────────────────────────────────────────────────────
export const DoodleBook = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Left page */}
    <Path
      d="M5 8H20V34H5L4 33V9L5 8Z"
      fill={color}
      fillOpacity={0.15}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Right page */}
    <Path
      d="M35 8H20V34H35L36 33V9L35 8Z"
      fill={color}
      fillOpacity={0.08}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Spine */}
    <Line x1="20" y1="8" x2="20" y2="34" stroke={color} strokeWidth="2" />
    {/* Text lines */}
    <Line x1="8" y1="15" x2="17" y2="15" stroke={color} strokeWidth="1" opacity={0.6} />
    <Line x1="8" y1="19" x2="17" y2="19" stroke={color} strokeWidth="1" opacity={0.6} />
    <Line x1="23" y1="15" x2="32" y2="15" stroke={color} strokeWidth="1" opacity={0.6} />
    <Line x1="23" y1="19" x2="32" y2="19" stroke={color} strokeWidth="1" opacity={0.6} />
  </Svg>
);

// ─── 8. DoodleCheckCircle ───────────────────────────────────────────────────
export const DoodleCheckCircle = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx="20" cy="20" r="16" fill={color} fillOpacity={0.15} stroke={color} strokeWidth="1.8" />
    {/* Wobbly checkmark */}
    <Path
      d="M12 21L17.5 27L29 14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── 9. DoodleArrow ─────────────────────────────────────────────────────────
export const DoodleArrow = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M6 30C8 20 16 10 30 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Arrowhead */}
    <Path
      d="M24 6L30 10L26 16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

// ─── 10. DoodleRuler ────────────────────────────────────────────────────────
export const DoodleRuler = ({ size = 28, color = '#FFE566' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 50 20" fill="none">
    <Rect x="1" y="1" width="48" height="18" rx="3" fill={color} fillOpacity={0.25} stroke={color} strokeWidth="1.8" />
    {/* Tick marks */}
    {[8, 16, 24, 32, 40].map((x, i) => (
      <Line key={i} x1={x} y1="1" x2={x} y2={i % 2 === 0 ? 12 : 8} stroke={color} strokeWidth="1.2" />
    ))}
    {[4, 12, 20, 28, 36, 44].map((x, i) => (
      <Line key={`s${i}`} x1={x} y1="1" x2={x} y2="6" stroke={color} strokeWidth="0.8" opacity={0.7} />
    ))}
  </Svg>
);

// ─── 11. DoodleLightbulb ────────────────────────────────────────────────────
export const DoodleLightbulb = ({ size = 28, color = '#FFE566' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 44" fill="none">
    {/* Bulb */}
    <Path
      d="M20 4C12 4 6 10 6 18C6 24 10 28 14 31V34H26V31C30 28 34 24 34 18C34 10 28 4 20 4Z"
      fill={color}
      fillOpacity={0.25}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Base */}
    <Rect x="14" y="34" width="12" height="4" rx="2" fill={color} fillOpacity={0.4} stroke={color} strokeWidth="1.5" />
    <Line x1="17" y1="38" x2="23" y2="38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Filament */}
    <Path d="M17 22L20 18L23 22" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Rays */}
    <Line x1="20" y1="1" x2="20" y2="-1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="32" y1="8" x2="34" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="8" y1="8" x2="6" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="36" y1="18" x2="39" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="4" y1="18" x2="1" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ─── 12. DoodleRocket ───────────────────────────────────────────────────────
export const DoodleRocket = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Body */}
    <Path
      d="M20 5C20 5 30 12 30 24H10C10 12 20 5 20 5Z"
      fill={color}
      fillOpacity={0.2}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Fins */}
    <Path d="M10 24L6 32L14 28" fill={color} fillOpacity={0.3} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="M30 24L34 32L26 28" fill={color} fillOpacity={0.3} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    {/* Window */}
    <Circle cx="20" cy="20" r="4" fill={color} fillOpacity={0.4} stroke={color} strokeWidth="1.5" />
    {/* Flames */}
    <Path d="M15 32C15 32 17 38 20 36C20 36 23 38 25 32" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

// ─── 13. DoodleMushroom ─────────────────────────────────────────────────────
export const DoodleMushroom = ({ size = 28, color = '#FF6B6B' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 44" fill="none">
    {/* Cap */}
    <Path
      d="M4 22C4 12 11 4 20 4C29 4 36 12 36 22H4Z"
      fill={color}
      fillOpacity={0.3}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Spots */}
    <Circle cx="14" cy="16" r="3" fill="white" fillOpacity={0.7} />
    <Circle cx="24" cy="13" r="2.5" fill="white" fillOpacity={0.7} />
    <Circle cx="28" cy="19" r="2" fill="white" fillOpacity={0.7} />
    {/* Stem */}
    <Path
      d="M14 22V36C14 38 16 40 20 40C24 40 26 38 26 36V22H14Z"
      fill={color}
      fillOpacity={0.15}
      stroke={color}
      strokeWidth="1.8"
    />
    {/* Gills */}
    <Line x1="14" y1="22" x2="14" y2="24" stroke={color} strokeWidth="1" />
    <Line x1="20" y1="22" x2="20" y2="24" stroke={color} strokeWidth="1" />
    <Line x1="26" y1="22" x2="26" y2="24" stroke={color} strokeWidth="1" />
  </Svg>
);

// ─── 14. DoodleFlower ───────────────────────────────────────────────────────
export const DoodleFlower = ({ size = 28, color = '#FFE566' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Petals (5) */}
    {[0, 72, 144, 216, 288].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const cx = 20 + 10 * Math.cos(rad);
      const cy = 20 + 10 * Math.sin(rad);
      return (
        <Ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="6"
          ry="4"
          fill={color}
          fillOpacity={0.5}
          stroke={color}
          strokeWidth="1.5"
          transform={`rotate(${angle}, ${cx}, ${cy})`}
        />
      );
    })}
    {/* Center */}
    <Circle cx="20" cy="20" r="5" fill={color} stroke={color} strokeWidth="1.5" />
  </Svg>
);

// ─── 15. DoodleWave ─────────────────────────────────────────────────────────
export const DoodleWave = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size * 1.8} height={size * 0.6} viewBox="0 0 60 20" fill="none">
    <Path
      d="M2 10C8 4 12 16 18 10C24 4 28 16 34 10C40 4 44 16 50 10C53 7 56 10 58 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

// ─── 16. DoodleDiamond ──────────────────────────────────────────────────────
export const DoodleDiamond = ({ size = 28, color = '#A78BFA' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Polygon
      points="20,3 37,20 20,37 3,20"
      fill={color}
      fillOpacity={0.2}
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <Polygon
      points="20,8 32,20 20,32 8,20"
      fill={color}
      fillOpacity={0.1}
      stroke={color}
      strokeWidth="0.8"
      opacity={0.5}
    />
    {/* Inner sparkle lines */}
    <Line x1="20" y1="3" x2="20" y2="37" stroke={color} strokeWidth="0.7" opacity={0.3} />
    <Line x1="3" y1="20" x2="37" y2="20" stroke={color} strokeWidth="0.7" opacity={0.3} />
  </Svg>
);

// ─── 17. DoodleCircleDot ────────────────────────────────────────────────────
export const DoodleCircleDot = ({ size = 28, color = '#3ECFB2' }: DoodleProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx="20" cy="20" r="16" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="20" cy="20" r="4" fill={color} />
    <Circle cx="20" cy="20" r="8" stroke={color} strokeWidth="0.8" fill="none" opacity={0.4} />
  </Svg>
);

// ─── 18. DoodleStarburst ────────────────────────────────────────────────────
// 8-pointed mid-century starburst
export const DoodleStarburst = ({ size = 28, color = '#FFE566' }: DoodleProps) => {
  const rays = 8;
  const outerR = 18;
  const innerR = 7;
  const cx = 20;
  const cy = 20;
  const points = Array.from({ length: rays * 2 }, (_, i) => {
    const angle = (i * Math.PI) / rays - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Polygon
        points={points}
        fill={color}
        fillOpacity={0.85}
        stroke={color}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <Circle cx="20" cy="20" r="4" fill="white" opacity={0.5} />
    </Svg>
  );
};
