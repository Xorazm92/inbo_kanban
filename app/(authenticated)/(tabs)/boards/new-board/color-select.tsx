import { useThemeColors } from '@/hooks/useThemeColors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';

const COLORS = [
  '#6C5CE7',
  '#0079bf',
  '#d29034',
  '#519839',
  '#b04632',
  '#89609e',
  '#cd5a91',
  '#4bbf6b',
  '#00aecc',
  '#838c91',
  '#3A7BD5',
  '#00D2FF',
];
export const DEFAULT_COLOR = COLORS[0];

const Page = () => {
  const [selected, setSelected] = useState<string>(DEFAULT_COLOR);
  const router = useRouter();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const onColorSelect = (color: string) => {
    setSelected(color);
    router.setParams({ bg: color });
  };

  return (
    <View style={styles.container}>
      {COLORS.map((color) => (
        <Pressable
          key={color}
          style={[
            styles.colorSwatch,
            { backgroundColor: color },
            selected === color && styles.selectedSwatch,
          ]}
          onPress={() => onColorSelect(color)}
          role="button"
        />
      ))}
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexGrow: 1,
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.background,
  },
  colorSwatch: {
    height: 80,
    width: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSwatch: {
    borderColor: Colors.fontLight,
    ...Platform.select({
      web: {
        boxShadow: '0 0 8px #fff',
      },
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
export default Page;
