import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/lib/constants';
import { FONTS } from '@/lib/typography';

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

export function HairlineDivider() {
  return (
    <View style={styles.hairline}>
      <View style={styles.hairlineLine} />
      <Text style={styles.hairlineStar}>{'\u2734'}</Text>
      <View style={styles.hairlineLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#6B4E9E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#6B4E9E',
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  labelContainer: { marginBottom: 8, marginTop: 4 },
  label: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  hairline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  hairlineLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderBright,
    opacity: 0.5,
  },
  hairlineStar: {
    fontSize: 8,
    color: COLORS.silverDim,
  },
});
