import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/lib/constants';
import type { RedFlag } from '@/lib/redflags';

interface RedFlagAlertProps {
  flags: RedFlag[];
}

export function RedFlagAlert({ flags }: RedFlagAlertProps) {
  if (flags.length === 0) return null;

  return (
    <View style={styles.container}>
      {flags.map((flag, index) => (
        <View
          key={index}
          style={[
            styles.flag,
            flag.level === 'critical' ? styles.critical : styles.warning,
          ]}
        >
          <Text style={styles.icon}>
            {flag.level === 'critical' ? '!!' : '!'}
          </Text>
          <Text style={styles.message}>{flag.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    backgroundColor: COLORS.card,
  },
  critical: {
    borderColor: COLORS.danger,
  },
  warning: {
    borderColor: COLORS.warning,
  },
  icon: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: COLORS.primary,
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    flex: 1,
    lineHeight: 18,
  },
});
