import React from 'react';
import { Tabs } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import {
  KlassoTabBar,
  DoodleCheckCircle, DoodleStar, DoodleBook, DoodleLightbulb, DoodleCloudHouse
} from '@/src/components';

// Scroll/Quest icon for the quests tab
const DoodleScrollIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 9h18M8 5V3M16 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Path d="M7 13h6M7 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <Circle cx="18" cy="17" r="3" fill="#F5A623" />
    <Path d="M16.5 17l1 1 1.5-1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const STUDENT_TABS_CONFIG = [
  { name: 'index',      label: 'Home',       Icon: DoodleCloudHouse },
  { name: 'attendance', label: 'Attendance', Icon: DoodleCheckCircle },
  { name: 'grades',     label: 'Grades',     Icon: DoodleStar },
  { name: 'homework',   label: 'Homework',   Icon: DoodleBook },
  { name: 'quests',     label: 'Quests',     Icon: DoodleScrollIcon },
  { name: 'badges',     label: 'Badges',     Icon: DoodleStar },
  { name: 'ai',         label: 'AI Buddy',   Icon: DoodleLightbulb },
];

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <KlassoTabBar {...props} tabsConfig={STUDENT_TABS_CONFIG} />}
      screenOptions={{
        headerShown: false,
        // Slide transition for tabs might need customized options, but Expo Router Tabs
        // usually uses standard crossfade or requires react-navigation configuration.
        // We can do standard crossfade:
        animation: 'fade',
      }}
    />
  );
}
