import { useThemeColors } from '@/hooks/useThemeColors';
import { User } from '@/types/enums';
import { Pressable, Image, Text, View, ListRenderItemInfo, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserListItemProps {
  user: User;
  onPress: (user: User) => void;
}

const UserListItem = ({ user, onPress }: UserListItemProps) => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  if (!user) return null;
  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress(user)}
      role="button">
      <View style={styles.avatarRing}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: Colors.fontLight, fontSize: 12, fontWeight: '700' }}>
              {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{user.first_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
    </Pressable>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surface,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fontLight,
  },
  email: {
    color: Colors.fontSecondary,
    fontSize: 13,
  },
});

export default UserListItem;

