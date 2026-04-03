import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KlassoScreen, Fonts, Colors, DoodleStar } from '@/src/components';

export default function GradesScreen() {
  return (
    <KlassoScreen>
      <View style={styles.container}>
        <DoodleStar size={64} color={Colors.coral} />
        <Text style={styles.title}>Grades</Text>
        <Text style={styles.subtitle}>Coming soon!</Text>
      </View>
    </KlassoScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Fonts.headingXB, fontSize: 28, marginTop: 16, color: Colors.textPrimary },
  subtitle: { fontFamily: Fonts.accent, fontSize: 20, color: Colors.textMuted },
});
