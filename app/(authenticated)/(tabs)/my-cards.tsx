import { useSupabase } from '@/context/SupabaseContext';
import { Task } from '@/types/enums';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, Platform, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { getMyCards } = useSupabase();
  const [cards, setCards] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const loadCards = async () => {
    setRefreshing(true);
    const data = await getMyCards!();
    setCards(data);
    setRefreshing(false);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const isOverdue = d < now;
    const isToday = d.toDateString() === now.toDateString();
    
    return {
      text: isToday ? 'Bugun' : `${months[d.getMonth()]} ${d.getDate()}`,
      isOverdue
    };
  };

  const renderCard = ({ item }: { item: Task }) => (
    <Pressable
      style={styles.cardItem}
      onPress={() => router.push(`/board/card/${item.id}`)}
      role="button">
      <View style={styles.accentBar} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.boardBadge}>
            <Ionicons name="apps-outline" size={12} color={Colors.fontSecondary} />
            <Text style={styles.boardTitle}>{(item as any).boards?.title}</Text>
          </View>
          
          <View style={styles.metaInfo}>
            {item.estimated_hours ? (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={Colors.fontSecondary} />
                <Text style={styles.metaText}>{item.estimated_hours}s</Text>
              </View>
            ) : null}

            {item.due_date && (
              <View style={styles.metaItem}>
                <Ionicons 
                  name="calendar-outline" 
                  size={12} 
                  color={formatDate(item.due_date).isOverdue ? Colors.danger : Colors.fontSecondary} 
                />
                <Text style={[styles.metaText, formatDate(item.due_date).isOverdue && { color: Colors.danger, fontWeight: '700' }]}>
                  {formatDate(item.due_date).text}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadCards} 
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="card-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyText}>Sizga hali hech qanday karta tayinlanmagan</Text>
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
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 12,
  },
  accentBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.fontLight,
  },
  boardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boardTitle: {
    fontSize: 12,
    color: Colors.fontSecondary,
  },
  cardFooter: {
    flexDirection: isSmall ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isSmall ? 'flex-start' : 'center',
    marginTop: 4,
    gap: isSmall ? 4 : 0,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.fontSecondary,
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
