import { useSupabase } from '@/context/SupabaseContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { User } from '@/types/enums';
import { useHeaderHeight } from '@react-navigation/elements';
import UserListItem from '@/components/UserListItem';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { findUsers, addUserToBoard } = useSupabase();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const onSearchUser = async (text: string) => {
    setSearch(text);
    if (text.length < 2) {
      setUserList([]);
      return;
    }
    setLoading(true);
    try {
      const data = await findUsers!(text);
      setUserList(data || []);
    } finally {
      setLoading(false);
    }
  };

  const onAddUser = async (user: User) => {
    const { error } = await addUserToBoard!(id!, user.id);
    if (error) {
       Alert.alert('Xatolik', 'Foydalanuvchini qo\'shib bo\'lmadi: ' + error.message);
    } else {
       Alert.alert('Muvaffaqiyatli', `${user.first_name || user.email} muvaffaqiyatli qo'shildi!`);
       router.dismiss();
    }
  };

  return (
    <View style={[styles.container]}>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          ...(Platform.OS !== 'web'
            ? {
                headerSearchBarOptions: {
                  inputType: 'email',
                  autoCapitalize: 'none',
                  autoFocus: true,
                  placeholder: 'Ism yoki email orqali taklif qiling',
                  cancelButtonText: 'Tayyor',
                  onChangeText: (e: any) => onSearchUser(e.nativeEvent.text),
                  onCancelButtonPress: () => {},
                },
              }
            : {}),
        }}
      />

      {Platform.OS === 'web' && (
        <View style={styles.webSearchContainer}>
          <Ionicons name="search" size={18} color={Colors.grey} />
          <TextInput
            style={styles.webSearchInput}
            placeholder="Ism yoki email orqali taklif qiling..."
            placeholderTextColor={Colors.grey}
            value={search}
            onChangeText={onSearchUser}
            autoCapitalize="none"
            autoFocus
          />
          {search.length > 0 && (
            <Pressable onPress={() => onSearchUser('')} role="button">
              <Ionicons name="close-circle" size={18} color={Colors.grey} />
            </Pressable>
          )}
        </View>
      )}

      <FlatList
        data={userList}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => <UserListItem onPress={onAddUser} user={item} />}
        style={{ marginTop: Platform.OS !== 'web' ? 60 + headerHeight : 0 }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <Text style={styles.emptyText}>
                {search.length > 1
                  ? 'Foydalanuvchi topilmadi'
                  : 'Taklif qilish uchun email yoki ism kiriting'}
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 16,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  webSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.fontLight,
    outlineStyle: 'none',
  } as any,
  listContent: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyText: {
    color: Colors.fontSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default Page;
