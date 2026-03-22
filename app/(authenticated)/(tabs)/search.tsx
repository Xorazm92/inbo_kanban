import { useSupabase } from '@/context/SupabaseContext';
import { User } from '@/types/enums';
import { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import UserListItem from '@/components/UserListItem';
import { useThemeColors } from '@/hooks/useThemeColors';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { findUsers } = useSupabase();
  const [userList, setUserList] = useState<User[]>([]);

  const onSearchUser = async (search: string) => {
    if (!search) {
      setUserList([]);
      return;
    }
    const data = await findUsers!(search);
    setUserList(data);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Foydalanuvchilarni email orqali qidirish...',
            onChangeText: (e) => onSearchUser(e.nativeEvent.text),
            autoCapitalize: 'none',
          },
        }}
      />
      
      <FlatList
        data={userList}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <UserListItem element={item} onPress={() => {}} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Doskalaringizga hamkorlarni qo'shish uchun qidiring</Text>
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: Colors.fontSecondary,
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 40,
  },
});

export default Page;
