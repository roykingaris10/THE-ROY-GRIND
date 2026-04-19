import { Platform } from 'react-native';

export const FONTS = {
  heading: 'Cinzel_700Bold',
  headingBlack: 'Cinzel_900Black',
  headingRegular: 'Cinzel_400Regular',
  mono: Platform.select({ ios: 'JetBrainsMono_400Regular', default: 'JetBrainsMono_400Regular' }),
  monoMedium: Platform.select({ ios: 'JetBrainsMono_500Medium', default: 'JetBrainsMono_500Medium' }),
  monoBold: Platform.select({ ios: 'JetBrainsMono_700Bold', default: 'JetBrainsMono_700Bold' }),
  monoFallback: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;
