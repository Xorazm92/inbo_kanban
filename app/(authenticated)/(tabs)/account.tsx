import { useAuth, useUser } from '@/context/ClerkContext';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
        </View>
        <Text style={styles.name}>{user?.fullName || 'Foydalanuvchi'}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <View style={styles.menuSection}>
        <Pressable style={styles.menuItem} role="button">
          <View style={styles.menuIconBox}>
            <Ionicons name="settings-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Sozlamalar</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
        </Pressable>
        <Pressable style={styles.menuItem} role="button">
          <View style={styles.menuIconBox}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.accent} />
          </View>
          <Text style={styles.menuText}>Yordam va qo'llab-quvvatlash</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
        </Pressable>
        <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => signOut()} role="button">
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          </View>
          <Text style={[styles.menuText, { color: Colors.danger }]}>Chiqish</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
        </Pressable>
      </View>
      
      <Text style={styles.version}>Versiya 1.0.0</Text>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 40,
    gap: 8,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.fontLight,
  },
  email: {
    fontSize: 14,
    color: Colors.fontSecondary,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 16,
    color: Colors.fontLight,
    flex: 1,
  },
  version: {
    textAlign: 'center',
    color: Colors.grey,
    fontSize: 12,
    marginTop: 'auto',
  },
});

export default Page;
