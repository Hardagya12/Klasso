import React from 'react';
import { Tabs } from 'expo-router';
import {
  KlassoTabBar,
  DoodleCheckCircle, DoodleStar, DoodleBook, DoodleLightbulb, DoodleCloudHouse
} from '@/src/components';

const STUDENT_TABS_CONFIG = [
  { name: 'index',      label: 'Home',       Icon: DoodleCloudHouse },
  { name: 'attendance', label: 'Attendance', Icon: DoodleCheckCircle },
  { name: 'grades',     label: 'Grades',     Icon: DoodleStar },
  { name: 'homework',   label: 'Homework',   Icon: DoodleBook },
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
