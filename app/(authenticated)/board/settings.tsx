import UserListItem from '@/components/UserListItem';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Board, User } from '@/types/enums';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Platform, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useAuth } from '@/context/ClerkContext';

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getBoardInfo, updateBoard, deleteBoard, getBoardMember, removeUserFromBoard } = useSupabase();
  const { userId } = useAuth();
  const router = useRouter();
  const [board, setBoard] = useState<Board>();
  const [member, setMember] = useState<User[]>();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  useEffect(() => {
    if (!id) return;
    loadInfo();
  }, [id]);

  const loadInfo = async () => {
    if (!id) return;

    const data = await getBoardInfo!(id);
    setBoard(data);

    const member = await getBoardMember!(id);
    setMember(member);
  };

  const onDelete = async () => {
    Alert.alert(
      "Doskani yopish",
      "Haqiqatan ham ushbu doskani o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
      [
        { text: "Bekor qilish", style: "cancel" },
        { 
          text: "O'chirish", 
          style: "destructive",
          onPress: async () => {
            await deleteBoard!(`${id}`);
            router.dismissAll();
          }
        }
      ]
    );
  };

  const onRemoveMember = async (memberId: string) => {
    if (board?.creator !== userId) {
      Alert.alert("Ruxsat yo'q", "Faqat doska egasi a'zolarni o'chira oladi.");
      return;
    }

    if (memberId === userId) {
      Alert.alert("Xato", "O'zingizni doskadan o'chira olmaysiz.");
      return;
    }

    Alert.alert(
      "A'zoni o'chirish",
      "Ushbu foydalanuvchini doskadan chetlatmoqchimisiz?",
      [
        { text: "Bekor qilish", style: "cancel" },
        { 
          text: "O'chirish", 
          style: "destructive",
          onPress: async () => {
            await removeUserFromBoard!(`${id}`, memberId);
            loadInfo();
          }
        }
      ]
    );
  };

  const onUpdateBoard = async () => {
    const updated = await updateBoard!(board!);
    setBoard(updated);
  };

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View>
          <Text style={styles.label}>Doska nomi</Text>
          <TextInput
            value={board?.title || ''}
            onChangeText={(e) => setBoard({ ...board!, title: e })}
            style={styles.input}
            enterKeyHint="done"
            onEndEditing={onUpdateBoard}
            placeholderTextColor={Colors.grey}
          />
        </View>
      </View>

      <View style={styles.container}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Ionicons name="person-outline" size={18} color={Colors.fontLight} />
          <Text style={styles.sectionTitle}>A'zolar</Text>
        </View>

        <FlatList
          data={member}
          keyExtractor={(item) => `${item.id}`}
          renderItem={(info) => (
            <UserListItem 
              onPress={() => onRemoveMember(info.item.id)} 
              user={info.item} 
            />
          )}
          contentContainerStyle={{ gap: 8 }}
          style={{ marginVertical: 12 }}
        />

        <Link href={`/board/invite?id=${id}`} asChild>
          <View style={StyleSheet.flatten(styles.fullBtn)}>
            <Ionicons name="person-add-outline" size={18} color="#fff" />
            <Text style={styles.fullBtnText}>Taklif qilish...</Text>
          </View>
        </Link>
      </View>

      <Pressable onPress={onDelete} style={styles.deleteBtn} role="button">
        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        <Text style={styles.deleteBtnText}>Doskani yopish</Text>
      </Pressable>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  label: {
    color: Colors.fontSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: Colors.fontLight,
    padding: 0,
  },
  sectionTitle: {
    fontWeight: '700',
    color: Colors.fontLight,
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  deleteBtnText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  fullBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: `0 4px 10px ${Colors.shadowPrimary || 'rgba(0,0,0,0.3)'}`,
      },
      ios: {
        shadowColor: Colors.shadowPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fullBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
export default Page;
