import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/constants';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface DailyVerseProps {
  text: string;
  reference: string;
  compact?: boolean;
}

export function DailyVerse({ text, reference, compact }: DailyVerseProps) {
  return (
    <LinearGradient
      colors={['rgba(107,78,158,0.08)', 'rgba(201,169,97,0.04)', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, compact && styles.compact]}
    >
      <Text style={styles.cross}>{'\u2670'}</Text>
      <View style={compact ? styles.textWrap : undefined}>
        <Text style={[styles.text, compact && styles.textCompact]} numberOfLines={compact ? 2 : undefined}>
          {'\u201C'}{text}{'\u201D'}
        </Text>
        <Text style={[styles.reference, compact && styles.referenceCompact]}>{'\u2014'} {reference}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6B4E9E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  compact: { padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  textWrap: { flex: 1 },
  cross: { fontSize: 18, color: COLORS.gold, marginBottom: 8 },
  text: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  textCompact: { flex: 1, textAlign: 'left', fontSize: 11, lineHeight: 18 },
  reference: {
    fontSize: 9,
    color: COLORS.purpleWarm,
    fontFamily: mono,
    letterSpacing: 1,
    marginTop: 8,
    fontWeight: '700',
  },
  referenceCompact: { marginTop: 4 },
});
