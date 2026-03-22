import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

const Layout = () => {
  const router = useRouter();
  const Colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.fontLight,
        headerTitleStyle: { color: Colors.fontLight, fontWeight: '700' },
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Doska',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} role="button">
              <Ionicons name="close" size={26} color={Colors.primary} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="color-select"
        options={{
          title: 'Doska foni',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
};
export default Layout;
