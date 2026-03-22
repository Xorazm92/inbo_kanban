import { DEFAULT_COLOR } from '@/app/(authenticated)/(tabs)/boards/new-board/color-select';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const Page = () => {
  const [boardName, setBoardName] = useState('');
  const { createBoard } = useSupabase();
  const router = useRouter();
  const { bg } = useGlobalSearchParams<{ bg?: string }>();
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR);
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  useEffect(() => {
    if (bg) {
      setSelectedColor(bg);
    }
  }, [bg]);

  const onCreateBoard = async () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createBoard!(boardName, selectedColor);
    router.dismiss();
  };

  return (
    <View style={styles.page}>
      <Stack.Screen
        options={{
          headerTitle: 'Yangi doska',
          headerTitleStyle: { color: Colors.fontLight, fontWeight: '700' },
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} role="button" style={styles.headerBtn}>
              <Ionicons name="close" size={24} color={Colors.fontSecondary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              onPress={onCreateBoard} 
              disabled={boardName === ''} 
              role="button"
              style={[styles.createBtn, boardName === '' && styles.createBtnDisabled]}
            >
              <Text style={boardName === '' ? styles.btnTextDisabled : styles.btnText}>Yaratish</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Doska nomi</Text>
          <TextInput
            style={styles.input}
            value={boardName}
            onChangeText={setBoardName}
            placeholder="Masalan: Sayt redizayni"
            placeholderTextColor={Colors.grey}
            autoFocus
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Asosiy rang</Text>
          <Link href={'/boards/new-board/color-select'} asChild>
            <View style={StyleSheet.flatten(styles.btnItem)}>
              <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
              <Text style={styles.btnItemText}>Rangni o'zgartirish</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </View>
          </Link>
        </View>
      </View>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  page: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  headerBtn: {
    padding: 4,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: `0 6px 12px ${Colors.shadowPrimary || 'rgba(0,0,0,0.3)'}`,
      },
      ios: {
        shadowColor: Colors.shadowPrimary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createBtnDisabled: {
    backgroundColor: Colors.surface,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0, elevation: 0 },
    }),
  },
  btnTextDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.grey,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.fontSecondary,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.fontLight,
  },
  btnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  btnItemText: {
    fontSize: 16,
    flex: 1,
    color: Colors.fontLight,
    fontWeight: '500',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
export default Page;
