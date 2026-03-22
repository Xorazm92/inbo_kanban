import { useSupabase } from '@/context/SupabaseContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, FlatList } from 'react-native';
import { useState } from 'react';
import { User } from '@/types/enums';
import { useHeaderHeight } from '@react-navigation/elements';
import UserListItem from '@/components/UserListItem';

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { findUsers, addUserToBoard } = useSupabase();
  const router = useRouter();
  const [search, setSearch] = useState('dan@gmail.com');
  const [userList, setUserList] = useState<User[]>([]);
  const headerHeight = useHeaderHeight();
  const Colors = useThemeColors();

  const onSearchUSer = async () => {
    const data = await findUsers!(search);
    setUserList(data);
  };

  const onAddUser = async (user: User) => {
    console.log('adding user', user);
    await addUserToBoard!(id!, user.id);
    await router.dismiss();
  };

  return (
    <View style={{ flex: 1, padding: 8, backgroundColor: Colors.background }}>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerSearchBarOptions: {
            inputType: 'email',
            autoCapitalize: 'none',
            autoFocus: true,
            placeholder: 'Ism, foydalanuvchi nomi yoki email orqali taklif qiling',
            cancelButtonText: 'Tayyor',
            onChangeText: (e) => setSearch(e.nativeEvent.text),
            onCancelButtonPress: onSearchUSer,
          },
        }}
      />
      <FlatList
        data={userList}
        keyExtractor={(item) => `${item.id}`}
        renderItem={(item) => <UserListItem onPress={onAddUser} element={item} />}
        style={{ marginTop: 60 + headerHeight }}
        contentContainerStyle={{ gap: 8 }}
      />
    </View>
  );
};
export default Page;
