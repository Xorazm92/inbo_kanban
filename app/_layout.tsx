import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProviderComponent, useAuth } from '@/context/ClerkContext';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { SupabaseProvider } from '@/context/SupabaseContext';
import { Ionicons } from '@expo/vector-icons';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

// Cache the Clerk JWT - Only for Native
const tokenCache = Platform.OS !== 'web' ? {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
} : undefined;

const MissingConfig = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="construct-outline" size={48} color={Colors.accent} />
      </View>
      <Text style={styles.errorTitle}>NBT-Tasker Setup Required</Text>
      <Text style={styles.errorText}>
        Ilovani ishga tushirish uchun API kalitlarini (keys) kiritish kerak.
      </Text>
      
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>1. <Text style={{fontWeight: 'bold', color: Colors.fontLight}}>.env.local</Text> faylini oching.</Text>
        <Text style={styles.instructionText}>2. Supabase URL va Anon Keyni yozing.</Text>
        <Text style={styles.instructionText}>3. Clerk Publishable Keyni yozing.</Text>
      </View>

      <Text style={styles.helpText}>
        Hamma narsa to'g'ri bo'lganda, bu xabar o'rniga login oynasi chiqadi.
      </Text>
    </View>
  );
};

const WebStyles = ({ colors }: { colors: any }) => {
  if (Platform.OS !== 'web') return null;
  return (
    <style type="text/css">{`
      .zeego-dropdown-content {
        background-color: ${colors.surfaceElevated} !important;
        border: 1px solid ${colors.glassBorderStrong} !important;
        border-radius: 14px;
        padding: 6px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      }
      .zeego-dropdown-item {
        padding: 10px 14px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        outline: none;
      }
      .zeego-dropdown-item:hover, .zeego-dropdown-item[data-highlighted] {
        background-color: ${colors.surfaceHover} !important;
      }
    `}</style>
  );
};

const InitialLayout = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const Colors = useThemeColors();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(authenticated)';
    const isCallback = segments[0] === 'oauth-native-callback';

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(authenticated)/(tabs)/boards');
    } else if (!isSignedIn && !isCallback) {
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SupabaseProvider>
      <WebStyles colors={Colors} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
      </Stack>
    </SupabaseProvider>
  );
};

const RootLayoutNav = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <MissingConfig />;
  }

  return (
    <ClerkProviderComponent publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <StatusBar style="light" />
      <ActionSheetProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <InitialLayout />
        </GestureHandlerRootView>
      </ActionSheetProvider>
    </ClerkProviderComponent>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 24,
    gap: 16,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.fontLight,
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: Colors.fontSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  instructionBox: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    width: '100%',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.fontSecondary,
  },
  helpText: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
    marginTop: 20,
  }
});

export default RootLayoutNav;
