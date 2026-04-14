import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, LIFT_COLORS } from '@/lib/constants';
import type { LiftType } from '@/types';

interface PRToastProps {
  visible: boolean;
  liftType: LiftType;
  e1rm: number;
  onDismiss: () => void;
}

export function PRToast({ visible, liftType, e1rm, onDismiss }: PRToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onDismiss());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const color = LIFT_COLORS[liftType];
  const label = liftType.charAt(0).toUpperCase() + liftType.slice(1);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          borderColor: color,
        },
      ]}
    >
      <Text style={styles.fire}>NEW PR</Text>
      <Text style={[styles.lift, { color }]}>
        {label} E1RM: {e1rm}kg
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fire: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lift: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
