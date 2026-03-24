import { useSupabase } from '@/context/SupabaseContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { DailyLog, User } from '@/types/enums';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';

const Page = () => {
  const { getDailyLogs, saveDailyLog, getUserRole, getMyTeam } = useSupabase();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<any>(null);
  const [team, setTeam] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const userRole = await getUserRole!();
    setRole(userRole);

    if (userRole?.role === 'lead' || userRole?.role === 'admin') {
      const myTeam = await getMyTeam!();
      setTeam(myTeam);
    }

    await loadLogs(today);
    setLoading(false);
  };

  const loadLogs = async (date: string, userId?: string) => {
    const data = await getDailyLogs!(date, userId);
    setLogs(data);
    if (!userId || userId === role?.id) {
        // If viewing own logs, set current content if exists
        const ownLog = data.find((l: any) => l.user_id === role?.id || !userId);
        setContent(ownLog?.content || '');
    }
  };

  const onSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const { error } = await saveDailyLog!(content, today);
    setSaving(false);
    if (error) {
      Alert.alert('Xato', 'Saqlashda muammo boʻldi');
    } else {
      Alert.alert('Muvaffaqiyat', 'Kundalik saqlandi');
      loadLogs(today, selectedUserId);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Bugungi Kundalik</Text>
          <Text style={styles.date}>{format(new Date(), 'dd.MM.yyyy')}</Text>
        </View>

        {(!selectedUserId || selectedUserId === role?.id) && (
          <View style={styles.inputCard}>
            <TextInput
              style={[styles.input, { verticalAlign: 'top' }]}
              placeholder="Bugun nimalar qildingiz? (Ishlar, muammolar, natijalar...)"
              placeholderTextColor={Colors.grey}
              multiline
              value={content}
              onChangeText={setContent}
            />
            <Pressable
              onPress={onSave}
              style={[styles.saveBtn, !content.trim() && { opacity: 0.5 }]}
              disabled={saving || !content.trim()}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Saqlash</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {team.length > 0 && (
          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>Jamoa a'zolari Kundaligi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamScroll}>
              <Pressable
                onPress={() => {
                  setSelectedUserId(undefined);
                  loadLogs(today);
                }}
                style={[styles.teamItem, !selectedUserId && styles.activeTeamItem]}>
                <Text style={[styles.teamName, !selectedUserId && styles.activeTeamText]}>Men</Text>
              </Pressable>
              {team.map((user, index) => (
                <Pressable
                  key={`${user.id}-${index}`}
                  onPress={() => {
                    setSelectedUserId(user.id);
                    loadLogs(today, user.id);
                  }}
                  style={[styles.teamItem, selectedUserId === user.id && styles.activeTeamItem]}>
                  <Text style={[styles.teamName, selectedUserId === user.id && styles.activeTeamText]}>
                    {user.first_name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Bugungi hisobotlar</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={Colors.grey} />
              <Text style={styles.emptyText}>Hali hech qanday log yozilmagan</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={`${log.id}-${index}`} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logUser}>{log.users?.first_name || 'Xodim'}</Text>
                  <Text style={styles.logTime}>{format(new Date(log.created_at), 'HH:mm')}</Text>
                </View>
                <Text style={styles.logContent}>{log.content}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors: any) => {
  const { width } = Dimensions.get('window');
  const isSmall = width < 400;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: isSmall ? 12 : 16,
      paddingBottom: 120,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: isSmall ? 20 : 24,
      fontWeight: '800',
      color: Colors.fontLight,
    },
    date: {
      fontSize: 14,
      color: Colors.grey,
      marginTop: 4,
    },
    inputCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    input: {
      minHeight: isSmall ? 90 : 120,
      fontSize: 15,
      color: Colors.fontLight,
      marginBottom: 14,
    },
    saveBtn: {
      backgroundColor: Colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    teamSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.fontLight,
      marginBottom: 12,
    },
    teamScroll: {
      flexDirection: 'row',
    },
    teamItem: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: Colors.surface,
      marginRight: 8,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    activeTeamItem: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    teamName: {
      color: Colors.fontLight,
      fontSize: 14,
      fontWeight: '600',
    },
    activeTeamText: {
      color: '#fff',
    },
    logsSection: {
        marginTop: 8,
    },
    logCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    logUser: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.primary,
    },
    logTime: {
      fontSize: 12,
      color: Colors.grey,
    },
    logContent: {
      fontSize: 15,
      color: Colors.fontLight,
      lineHeight: 22,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      color: Colors.grey,
      marginTop: 12,
      fontSize: 14,
    },
  });
};

export default Page;
