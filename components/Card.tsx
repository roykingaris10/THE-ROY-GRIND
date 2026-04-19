import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { COLORS } from '@/lib/constants';

interface CardProps {
  children: React.ReactNode;
  style?: object;
  delay?: number;
  borderColor?: string;
}

export function Card({ children, style, delay = 0, borderColor }: CardProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[styles.card, { opacity, transform: [{ translateY }] }, borderColor ? { borderColor } : undefined, style]}
    >
      {children}
    </Animated.View>
  );
}

export function SectionLabel({ children }: { children: string }) {
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  labelContainer: { marginBottom: 8, marginTop: 4 },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.label,
    fontFamily: 'monospace',
  },
});
