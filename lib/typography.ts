import { Platform } from 'react-native';

export const FONTS = {
  serif: 'CormorantGaramond_400Regular',
  serifMedium: 'CormorantGaramond_500Medium',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  serifBold: 'CormorantGaramond_700Bold',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  heading: 'CormorantGaramond_700Bold',
  headingBlack: 'CormorantGaramond_700Bold',
  headingRegular: 'CormorantGaramond_400Regular',
  mono: Platform.select({ ios: 'JetBrainsMono_400Regular', default: 'JetBrainsMono_400Regular' }),
  monoMedium: Platform.select({ ios: 'JetBrainsMono_500Medium', default: 'JetBrainsMono_500Medium' }),
  monoBold: Platform.select({ ios: 'JetBrainsMono_700Bold', default: 'JetBrainsMono_700Bold' }),
  monoFallback: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;
