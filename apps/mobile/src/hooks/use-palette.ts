import { dark, light } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Raw colour values for props that can't take a className (icon tints, spinners, placeholders) */
export function usePalette() {
  return useColorScheme() === 'dark' ? dark : light;
}
