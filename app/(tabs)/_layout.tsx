import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/lib/constants';

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

function TabIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <FontAwesome
      name={name}
      size={focused ? 22 : 20}
      color={color}
      style={{ marginBottom: -2 }}
    />
  );
}

function HeaderTitle({ title }: { title: string }) {
  return (
    <Text style={styles.headerTitle}>{title}</Text>
  );
}

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: mono,
          fontSize: 9,
          letterSpacing: 1,
          fontWeight: '700',
          textTransform: 'uppercase',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="th-large" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'LOG',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="pencil" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="lifts"
        options={{
          title: 'LIFTS',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="line-chart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'STATS',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
});
