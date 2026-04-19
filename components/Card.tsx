import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/lib/constants';

interface CardProps {
  children: React.ReactNode;
  style?: object;
  delay?: number;
  borderColor?: string;
  glow?: boolean;
}

export function Card({ children, style, delay = 0, borderColor, glow }: CardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350).springify().damping(18)}
      style={[
        styles.card,
        borderColor ? { borderColor } : undefined,
        glow && styles.cardGlow,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.labelContainer}>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#6B4E9E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardGlow: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  labelContainer: { marginBottom: 8, marginTop: 4 },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.label,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
});
