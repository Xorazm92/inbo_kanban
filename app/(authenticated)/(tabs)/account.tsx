import { useAuth, useUser } from '@/context/ClerkContext';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '@/context/SupabaseContext';
import { useEffect, useState } from 'react';
import { User } from '@/types/enums';
import UserListItem from '@/components/UserListItem';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { signOut } = useAuth();
  const { user } = useUser();
  const { getUserRole, updateUserRole, updateUserManager, findUsers } = useSupabase();
  
  const [role, setRole] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getUserRole!();
    setRole(data);
    
    if (data?.manager_id) {
       // Ideally we should have a getUserInfo function, but for now we can find by email/ID if needed
       // or just show ID. Let's assume we want to show the manager's name.
       const results = await findUsers!(''); // This is inefficient but without getByUserId we search
       const m = results?.find((u: any) => u.id === data.manager_id);
       setManager(m);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    await updateUserRole!(newRole);
    setRole({ ...role, role: newRole });
    Alert.alert('Muvaffaqiyatli', `Rol ${newRole}ga o'zgartirildi`);
  };

  const onSearchManager = async (text: string) => {
    setSearch(text);
    if (!text) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await findUsers!(text);
    setSearchResults(results || []);
    setSearching(false);
  };

  const handleSelectManager = async (selectedManager: User) => {
    await updateUserManager!(selectedManager.id);
    setManager(selectedManager);
    setShowManagerModal(false);
    Alert.alert('Muvaffaqiyatli', `Boshliq etib ${selectedManager.first_name} tanlandi`);
  };

  const roles = [
    { id: 'admin', label: 'Admin (Boshliq)', icon: 'shield-checkmark-outline' },
    { id: 'lead', label: 'Lead (Bo\'lim boshliog\'i)', icon: 'people-outline' },
    { id: 'member', label: 'Member (Ishchi)', icon: 'person-outline' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
        </View>
        <Text style={styles.name}>{user?.fullName || 'Foydalanuvchi'}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Rolingizni tanlang</Text>
        <View style={styles.roleGrid}>
          {roles.map((r) => (
            <Pressable
              key={r.id}
              style={[styles.roleItem, role?.role === r.id && styles.activeRoleItem]}
              onPress={() => handleRoleChange(r.id)}>
              <Ionicons 
                name={r.icon as any} 
                size={24} 
                color={role?.role === r.id ? '#fff' : Colors.grey} 
              />
              <Text style={[styles.roleText, role?.role === r.id && styles.activeRoleText]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Mening Boshlig'im</Text>
        <Pressable 
          style={styles.managerCard} 
          onPress={() => setShowManagerModal(true)}>
          {manager ? (
            <View style={styles.managerInfo}>
              <Image source={{ uri: manager.avatar_url }} style={styles.managerAvatar} />
              <View>
                <Text style={styles.managerName}>{manager.first_name}</Text>
                <Text style={styles.managerEmail}>{manager.email}</Text>
              </View>
              <Ionicons name="swap-horizontal" size={20} color={Colors.grey} style={{ marginLeft: 'auto' }} />
            </View>
          ) : (
            <View style={styles.noManager}>
              <Ionicons name="person-add-outline" size={24} color={Colors.grey} />
              <Text style={styles.noManagerText}>Boshliqni tanlash...</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={[styles.menuSection, { marginTop: 20 }]}>
        <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => signOut()} role="button">
          <View style={[styles.menuIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          </View>
          <Text style={[styles.menuText, { color: Colors.danger }]}>Chiqish</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.grey} />
        </Pressable>
      </View>

      <Modal visible={showManagerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Boshliqni qidiring</Text>
              <Pressable onPress={() => setShowManagerModal(false)}>
                <Ionicons name="close" size={24} color={Colors.fontLight} />
              </Pressable>
            </View>
            
            <View style={styles.searchInputBox}>
              <Ionicons name="search" size={20} color={Colors.grey} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ism yoki email..."
                placeholderTextColor={Colors.grey}
                value={search}
                onChangeText={onSearchManager}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={{ marginTop: 10 }}>
              {searching ? (
                <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
              ) : searchResults.length === 0 && search ? (
                <Text style={styles.emptyResults}>Hech kim qidirilmadi</Text>
              ) : (
                searchResults.map((u, idx) => (
                  <UserListItem 
                     key={`${u.id}-${idx}`} 
                     user={u} 
                     onPress={() => handleSelectManager(u)} 
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      <Text style={styles.version}>Versiya 1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
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
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.grey,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  activeRoleItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.fontSecondary,
    textAlign: 'center',
  },
  activeRoleText: {
    color: '#fff',
  },
  managerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  managerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.fontLight,
  },
  managerEmail: {
    fontSize: 12,
    color: Colors.grey,
  },
  noManager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  noManagerText: {
    color: Colors.grey,
    fontSize: 15,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.fontLight,
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: Colors.fontLight,
    fontSize: 16,
  },
  emptyResults: {
    textAlign: 'center',
    color: Colors.grey,
    marginTop: 40,
  },
  version: {
    textAlign: 'center',
    color: Colors.grey,
    fontSize: 12,
    marginTop: 20,
  },
});

export default Page;
