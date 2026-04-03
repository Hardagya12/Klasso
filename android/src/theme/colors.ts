// Klasso Design System — Color Palette
export const Colors = {
  // Primary palette
  mint:       '#3ECFB2',
  mintLight:  '#D4F5EE',
  mintDark:   '#28A990',
  coral:      '#FF6B6B',
  coralLight: '#FFE5E5',
  coralDark:  '#D94848',
  yellow:     '#FFE566',
  yellowLight:'#FFF8C2',
  yellowDark: '#C9AF00',
  purple:     '#A78BFA',
  purpleLight:'#EDE9FE',
  purpleDark: '#6D28D9',

  // Neutrals
  bg:         '#F7FBF9',   // off-white app background
  surface:    '#FFFFFF',
  border:     '#D4EDE8',
  textPrimary:'#1C2B27',   // very dark green-black
  textMuted:  '#6B8C82',
  textLight:  '#A5C4BC',

  // Shadows (retro flat offset)
  shadow:     '#1C2B27',
  shadowMint: '#28A990',
  shadowCoral:'#D94848',
} as const;

export const Fonts = {
  heading:   'Nunito_700Bold',
  headingXB: 'Nunito_800ExtraBold',
  body:      'DMSans_400Regular',
  bodyMed:   'DMSans_500Medium',
  accent:    'Caveat_400Regular',
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 100,
} as const;

// Retro flat shadow — the signature mid-century look
export const retroShadow = (offsetX = 4, offsetY = 4, color = Colors.shadow) => ({
  shadowColor: color,
  shadowOffset: { width: offsetX, height: offsetY },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: offsetY * 2,
});
