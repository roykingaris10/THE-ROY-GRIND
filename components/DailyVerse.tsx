import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '@/lib/constants';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface DailyVerseProps {
  text: string;
  reference: string;
  compact?: boolean;
}

export function DailyVerse({ text, reference, compact }: DailyVerseProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Text style={styles.cross}>{'\u2626'}</Text>
      <Text style={[styles.text, compact && styles.textCompact]} numberOfLines={compact ? 2 : undefined}>
        "{text}"
      </Text>
      <Text style={styles.reference}>-- {reference}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  compact: { padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  cross: { fontSize: 18, color: COLORS.primary, marginBottom: 8 },
  text: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: mono,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  textCompact: { flex: 1, textAlign: 'left', fontSize: 11 },
  reference: {
    fontSize: 9,
    color: COLORS.primaryDark,
    fontFamily: mono,
    letterSpacing: 1,
    marginTop: 8,
    fontWeight: '700',
  },
});
