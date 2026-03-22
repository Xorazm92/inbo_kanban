import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export const useThemeColors = () => {
  const scheme = useColorScheme() ?? 'dark';
  return Colors[scheme];
};
