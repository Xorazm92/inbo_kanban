import { useThemeColors } from '@/hooks/useThemeColors';
import { Text, View, StyleSheet, Image, Pressable, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as WebBrowser from 'expo-web-browser';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ModalType } from '@/types/enums';

import AuthModal from '@/components/AuthModal';

const { width } = Dimensions.get('window');

export default function Index() {
  const { top, bottom } = useSafeAreaInsets();
  const { showActionSheetWithOptions } = useActionSheet();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['40%'], []);
  const [authType, setAuthType] = useState<ModalType | null>(null);
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const openLink = async () => {
    WebBrowser.openBrowserAsync('https://galaxies.dev');
  };

  const openActionSheet = async () => {
    const options = ['Qo\'llab-quvvatlash hujjatlarini ko\'rish', 'Biz bilan bog\'lanish', 'Bekor qilish'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: `Tizimga kira olmayapsizmi yoki ro'yxatdan o'ta olmayapsizmi?`,
      },
      (selectedIndex: any) => {
        switch (selectedIndex) {
          case 1:
            break;
          case cancelButtonIndex:
        }
      }
    );
  };

  const showModal = async (type: ModalType) => {
    setAuthType(type);
    bottomSheetModalRef.current?.present();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.6}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => bottomSheetModalRef.current?.close()}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <View style={[styles.content, { paddingTop: top + 30, paddingBottom: bottom + 20 }]}>
          <Image 
            source={require('@/assets/images/login/inbo_logo.png')} 
            style={styles.image} 
            resizeMode="contain"
          />
          
          <View style={styles.glassIntro}>
            <Text style={styles.introText}>Jamoaviy mehnatni har qanday joyda rivojlantiring</Text>
          </View>

          <View style={styles.bottomContainer}>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => showModal(ModalType.Login)}
              role="button">
              <Text style={styles.btnTextPrimary}>Kirish</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.btn, styles.btnSecondary]} 
              onPress={() => showModal(ModalType.SignUp)}
              role="button">
              <Text style={styles.btnTextSecondary}>Ro'yxatdan o'tish</Text>
            </Pressable>

            <Text style={styles.description}>
              Ro'yxatdan o'tish orqali siz bizning{' '}
              <Text style={styles.link} onPress={openLink}>
                Foydalanish shartlari
              </Text>{' '}
              va{' '}
              <Text style={styles.link} onPress={openLink}>
                Maxfiylik siyosatiga
              </Text>
              {' '}rozilik bildirasiz.
            </Text>

            <Pressable onPress={openActionSheet} role="button" style={{ marginTop: 10 }}>
              <Text style={styles.helpLink}>
                Kirish yoki ro'yxatdan o'tishda muammo bormi?
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        enableOverDrag={false}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: 'transparent' }}>
        <AuthModal authType={authType} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  image: {
    height: Math.min(width * 0.7, 300),
    width: Math.min(width * 0.7, 300),
  },
  glassIntro: {
    marginHorizontal: 30,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    padding: 24,
  },
  introText: {
    fontWeight: '700',
    color: Colors.fontLight,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 30,
    gap: 12,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 24px rgba(108, 92, 231, 0.5)',
      },
      default: {
        shadowColor: Colors.shadowPrimary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  btnSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorderStrong,
  },
  btnTextPrimary: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  btnTextSecondary: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.fontLight,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.fontSecondary,
    marginHorizontal: 40,
    marginTop: 10,
    lineHeight: 18,
  },
  link: {
    color: Colors.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  helpLink: {
    color: Colors.fontSecondary,
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
