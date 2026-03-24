import { useSupabase } from '@/context/SupabaseContext';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, Platform, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { getNotifications } = useSupabase();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    setRefreshing(true);
    const data = await getNotifications!();
    setNotifications(data);
    setRefreshing(false);
  };

  const renderNotification = ({ item }: { item: any }) => (
    <Pressable
      style={styles.notificationItem}
      onPress={() => router.push(`/board/card/${item.card_id}`)}
      role="button">
      <View style={styles.iconContainer}>
        <Ionicons name="notifications" size={20} color={Colors.primary} />
      </View>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.cardTitle}>Karta: {item.cards?.title}</Text>
        <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadNotifications}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="notifications-off-outline" size={48} color={Colors.fontSecondary} />
            </View>
            <Text style={styles.emptyText}>Hozircha bildirishnomalar yo'q</Text>
          </View>
        }
      />
    </View>
  );
};

const getStyles = (Colors: any) => {
  const { width, height } = Dimensions.get('window');
  const isSmall = width < 400;
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: isSmall ? 12 : 16,
    gap: 10,
  },
  notificationItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: isSmall ? 12 : 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  iconContainer: {
    backgroundColor: Colors.surfaceElevated,
    padding: isSmall ? 8 : 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  notificationInfo: {
    flex: 1,
    gap: 2,
  },
  notificationBody: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.fontLight,
  },
  cardTitle: {
    fontSize: 12,
    color: Colors.fontSecondary,
  },
  timeText: {
    fontSize: 10,
    color: Colors.grey,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Math.min(height * 0.2, 150),
    gap: 16,
  },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.fontSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
});
};

export default Page;
