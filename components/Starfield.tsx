import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StarfieldProps {
  density?: 'sparse' | 'normal' | 'dense';
  height?: number;
  width?: number;
}

export function Starfield({ density = 'normal', height, width }: StarfieldProps) {
  const w = width ?? SCREEN_WIDTH;
  const h = height ?? 200;

  const stars = useMemo(() => {
    const count = density === 'sparse' ? 15 : density === 'dense' ? 40 : 25;
    const result = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 0.3 + Math.random() * 0.8;
      const opacity = 0.15 + Math.random() * 0.45;
      const isGold = Math.random() < 0.1;
      const isTeal = Math.random() < 0.08;
      const fill = isGold
        ? 'rgba(201,169,97,0.6)'
        : isTeal
        ? 'rgba(95,212,194,0.5)'
        : `rgba(232,234,240,${opacity})`;
      result.push({ x, y, r, fill, key: i });
    }
    return result;
  }, [w, h, density]);

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        {stars.map(s => (
          <Circle key={s.key} cx={s.x} cy={s.y} r={s.r} fill={s.fill} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
