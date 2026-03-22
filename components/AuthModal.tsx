import { AuthStrategy, ModalType } from '@/types/enums';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Image, Text, Pressable, StyleSheet, Platform, View } from 'react-native';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useOAuth, useSignIn, useSignUp } from '@/context/ClerkContext';
import * as Linking from 'expo-linking';

interface AuthModalProps {
  authType: ModalType | null;
}

const AuthModal = ({ authType }: AuthModalProps) => {
  useWarmUpBrowser();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: AuthStrategy.Google });
  const { startOAuthFlow: microsoftAuth } = useOAuth({ strategy: AuthStrategy.Microsoft });
  const { startOAuthFlow: slackAuth } = useOAuth({ strategy: AuthStrategy.Slack });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: AuthStrategy.Apple });
  
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signIn, setActive: setSignInActive } = useSignIn();

  const onSelectAuth = async (strategy: AuthStrategy) => {
    if (!signIn || !signUp) return null;

    const selectedAuth = {
      [AuthStrategy.Google]: googleAuth,
      [AuthStrategy.Microsoft]: microsoftAuth,
      [AuthStrategy.Slack]: slackAuth,
      [AuthStrategy.Apple]: appleAuth,
    }[strategy];

    try {
      const result = await selectedAuth({
        redirectUrl: Linking.createURL('/oauth-native-callback', { scheme: 'myapp' }),
      });
      if (!result) return;
      
      const { createdSessionId, setActive } = result;

      if (createdSessionId) {
        const setSession = Platform.OS === 'web' ? (setSignInActive || setSignUpActive) : setActive;
        if (setSession) {
          await setSession({ session: createdSessionId });
        }
      } else if (Platform.OS === 'web') {
        console.log('Web OAuth redirect initiated...');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const LOGIN_OPTIONS = [
    {
      text: 'Google bilan davom etish',
      icon: require('@/assets/images/login/google.png'),
      strategy: AuthStrategy.Google,
    },
    {
      text: 'Microsoft bilan davom etish',
      icon: require('@/assets/images/login/microsoft.png'),
      strategy: AuthStrategy.Microsoft,
    },
    {
      text: 'Apple bilan davom etish',
      icon: require('@/assets/images/login/apple.png'),
      strategy: AuthStrategy.Apple,
    },
    {
      text: 'Slack bilan davom etish',
      icon: require('@/assets/images/login/slack.png'),
      strategy: AuthStrategy.Slack,
    },
  ];

  return (
    <BottomSheetView style={styles.modalContainer}>
      <View style={styles.headerIndicator} />
      <Text style={styles.modalTitle}>
        {authType === ModalType.Login ? 'Xush kelibsiz!' : 'Hisob yaratish'}
      </Text>
      <Text style={styles.modalSubtitle}>
        {authType === ModalType.Login 
          ? 'Davom etish uchun tizimga kiring' 
          : "Boshlash uchun ro'yxatdan o'ting"}
      </Text>

      <Pressable style={styles.emailBtn} role="button">
        <Ionicons name="mail-outline" size={20} color={Colors.accent} />
        <Text style={[styles.btnText, { color: Colors.accent, fontWeight: '700' }]}>
          {authType === ModalType.Login ? 'Email orqali kirish' : 'Email orqali ro\'yxatdan o\'tish'}
        </Text>
      </Pressable>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>yoki</Text>
        <View style={styles.divider} />
      </View>

      {LOGIN_OPTIONS.map((option, index) => (
        <Pressable
          key={index}
          style={styles.modalBtn}
          onPress={() => onSelectAuth(option.strategy!)}
          role="button">
          <Image 
            source={option.icon} 
            style={styles.btnIcon}
          />
          <Text style={styles.btnText}>{option.text}</Text>
        </Pressable>
      ))}
    </BottomSheetView>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  modalContainer: {
    padding: 24,
    gap: 12,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.glassBorderStrong,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.glassBorderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.fontLight,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.fontSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  emailBtn: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glassBorder,
  },
  dividerText: {
    color: Colors.grey,
    fontSize: 12,
    fontWeight: '600',
  },
  modalBtn: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderColor: Colors.glassBorder,
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    width: '100%',
    backgroundColor: Colors.surface,
  },
  btnIcon: {
    width: 22,
    height: 22,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fontLight,
  },
});

export default AuthModal;
