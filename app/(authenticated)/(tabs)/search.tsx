import { useSupabase } from '@/context/SupabaseContext';
import { User } from '@/types/enums';
import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Platform } from 'react-native';
import { Stack } from 'expo-router';
import UserListItem from '@/components/UserListItem';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { findUsers } = useSupabase();
  const [userList, setUserList] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const onSearchUser = async (text: string) => {
    setSearch(text);
    if (!text || text.length < 2) {
      setUserList([]);
      return;
    }
    const data = await findUsers!(text);
    setUserList(data || []);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          ...(Platform.OS !== 'web'
            ? {
                headerSearchBarOptions: {
                  placeholder: 'Foydalanuvchilarni email orqali qidirish...',
                  onChangeText: (e: any) => onSearchUser(e.nativeEvent.text),
                  autoCapitalize: 'none',
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
            placeholder="Foydalanuvchilarni email orqali qidirish..."
            placeholderTextColor={Colors.grey}
            value={search}
            onChangeText={onSearchUser}
            autoCapitalize="none"
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserListItem user={item} onPress={() => {}} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={Colors.grey} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>Hamkorlarni qidiring</Text>
            <Text style={styles.emptyText}>
              Doskalaringizga hamkorlarni qo'shish uchun email yoki ism kiriting
            </Text>
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
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.fontLight,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.fontSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Page;
