import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';

const Layout = () => {
  const router = useRouter();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.fontLight,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
          headerTitle: () => (
            <View style={styles.logoContainer}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>INBO</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="new-board"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="templates"
        options={{
          title: 'Andozalar',
          presentation: 'fullScreenModal',
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.fontLight },
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              role="button"
              style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.fontSecondary} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    ...Platform.select({
      web: {
        boxShadow: `0 0 6px ${Colors.primary}`,
      },
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.fontLight,
    letterSpacing: 2,
  },
  closeBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});

export default Layout;
