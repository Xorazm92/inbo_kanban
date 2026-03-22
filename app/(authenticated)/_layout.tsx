import { usePush } from '@/hooks/usePush';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, Platform } from 'react-native';

const Layout = () => {
  usePush();
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
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="board/settings"
        options={{
          presentation: 'modal',
          title: 'Board Menu',
          headerStyle: { backgroundColor: Colors.background },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              role="button"
              style={{
                backgroundColor: Colors.surfaceElevated,
                borderRadius: 16,
                padding: 6,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
              }}>
              <Ionicons name="close" size={18} color={Colors.fontSecondary} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="board/invite"
        options={{
          presentation: 'modal',
          title: 'Manage board members',
          headerStyle: { backgroundColor: Colors.background },
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              role="button"
              style={{
                backgroundColor: Colors.surfaceElevated,
                borderRadius: 16,
                padding: 6,
                borderWidth: 1,
                borderColor: Colors.glassBorder,
              }}>
              <Ionicons name="close" size={18} color={Colors.fontSecondary} />
            </Pressable>
          ),
        }}
      />

      <Stack.Screen
        name="board/card/[id]"
        options={{
          presentation: 'containedModal',
          title: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
    </Stack>
  );
};
export default Layout;
