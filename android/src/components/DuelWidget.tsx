import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { KlassoCard, Colors, Fonts, DoodleStar } from './';

export function DuelWidget() {
  const [code, setCode] = useState('');

  const handleJoin = () => {
    if (code.trim()) {
      router.push(`/duel/${code.trim()}`);
    }
  };

  return (
    <KlassoCard variant="default" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <DoodleStar size={24} color={Colors.yellow} />
          <Text style={styles.title}>Knowledge Duel</Text>
        </View>
        <Text style={styles.subtitle}>Enter a code to join a live quiz!</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Duel Code (e.g. clabc12...)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={!code.trim()}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
    </KlassoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.yellow,
    backgroundColor: '#FFFEF0',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.headingXB,
    fontSize: 18,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8E4D9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: Fonts.heading,
    fontSize: 15,
  },
  joinButton: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  joinButtonText: {
    fontFamily: Fonts.headingXB,
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
