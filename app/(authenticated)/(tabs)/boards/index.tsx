import DropdownPlus from '@/components/DropdownPlus';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Board } from '@/types/enums';
import { Link, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/context/ClerkContext';

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { getBoards, generateMockData } = useSupabase();
  const { user } = useUser();
  const [boards, setBoards] = useState<Board[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBoards();
    }, [])
  );

  const loadBoards = async () => {
    const data = await getBoards!();
    setBoards(data);
  };

  const handleGenerateMockData = async () => {
    setGenerating(true);
    await generateMockData!();
    await loadBoards();
    setGenerating(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || '';

  const ListHeader = () => (
    <View style={styles.headerSection}>
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()}{firstName ? `, ${firstName}` : ''} 👋</Text>
          <Text style={styles.greetingSubtext}>Loyihalaringiz bilan ishlashni boshlang</Text>
        </View>
      </View>

      {/* Stats Row */}
      {boards.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(108, 92, 231, 0.15)' }]}>
              <MaterialCommunityIcons name="view-dashboard-outline" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statNumber}>{boards.length}</Text>
              <Text style={styles.statLabel}>Doskalar</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(0, 210, 255, 0.12)' }]}>
              <Ionicons name="flash-outline" size={18} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.statNumber}>Faol</Text>
              <Text style={styles.statLabel}>Holat</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
              <Ionicons name="people-outline" size={18} color={Colors.success} />
            </View>
            <View>
              <Text style={styles.statNumber}>Jamoa</Text>
              <Text style={styles.statLabel}>Rejim</Text>
            </View>
          </View>
        </View>
      )}

      {/* Section Title */}
      {boards.length > 0 && (
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIndicator} />
          <Text style={styles.sectionTitle}>Sizning doskalaringiz</Text>
          <Text style={styles.sectionCount}>{boards.length}</Text>
        </View>
      )}
    </View>
  );

  const ListItem = ({ item, index }: { item: Board; index: number }) => (
    <Link
      href={`/board/${item.id}?bg=${encodeURIComponent(item.background)}`}
      asChild>
      <Pressable style={styles.listItem}>
        {/* Color Block with inner glow */}
        <View style={styles.colorBlockContainer}>
          <View style={[styles.colorBlock, { backgroundColor: item.background }]}>
            <View style={styles.colorBlockInnerGlow} />
            <MaterialCommunityIcons name="view-dashboard-variant" size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </View>

        {/* Board Info */}
        <View style={styles.boardInfo}>
          <Text style={styles.boardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.boardMeta}>
            <View style={styles.metaBadge}>
              <Ionicons name="person-outline" size={11} color={Colors.fontSecondary} />
              <Text style={styles.metaText}>Shaxsiy</Text>
            </View>
            <View style={[styles.metaDot]} />
            <View style={styles.metaBadge}>
              <Ionicons name="layers-outline" size={11} color={Colors.fontSecondary} />
              <Text style={styles.metaText}>Ishchi joy</Text>
            </View>
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={18} color={Colors.fontSecondary} />
        </View>
      </Pressable>
    </Link>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => <DropdownPlus />,
          headerShadowVisible: false,
        }}
      />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={boards}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item, index }) => <ListItem item={item} index={index} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {/* Layered glow icon */}
            <View style={styles.emptyGlowOuter}>
              <View style={styles.emptyGlowMiddle}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="rocket-outline" size={40} color={Colors.primary} />
                </View>
              </View>
            </View>

            <Text style={styles.emptyTitle}>Boshlashga tayyormisiz? 🚀</Text>
            <Text style={styles.emptySubtitle}>
              Birinchi doskangizni yarating va loyihalaringizni professional darajada boshqaring
            </Text>
            
            <Pressable 
              style={styles.createButton} 
              onPress={handleGenerateMockData}
              disabled={generating}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.createButtonText}>
                {generating ? 'Yaratilmoqda...' : 'Demo ma\'lumotlar qo\'shish'}
              </Text>
            </Pressable>

            <Pressable 
              style={styles.newBoardButton}
              onPress={() => {}}
            >
              <Link href="/boards/new-board" asChild>
                <Pressable style={styles.newBoardButton} role="button">
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.newBoardButtonText}>Yangi doska yaratish</Text>
                </Pressable>
              </Link>
            </Pressable>

            {/* Feature highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(108, 92, 231, 0.12)' }]}>
                  <Ionicons name="layers-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.featureText}>Ro'yxatlar va kartalar</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 210, 255, 0.12)' }]}>
                  <Ionicons name="people-outline" size={18} color={Colors.accent} />
                </View>
                <Text style={styles.featureText}>Jamoaviy ishlash</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                  <Ionicons name="sync-outline" size={18} color={Colors.success} />
                </View>
                <Text style={styles.featureText}>Real-time sinxronlash</Text>
              </View>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadBoards} 
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header Section
  headerSection: {
    marginBottom: 8,
  },
  greetingRow: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.fontLight,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: Colors.fontSecondary,
    letterSpacing: 0.2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.fontLight,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.fontSecondary,
    marginTop: 1,
  },

  // Section Title
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.fontLight,
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // List
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },

  // Board Card
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingRight: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
      },
    }),
  },
  colorBlockContainer: {
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  colorBlock: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  colorBlockInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  boardInfo: {
    flex: 1,
    gap: 5,
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.fontLight,
    letterSpacing: 0.2,
  },
  boardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.fontSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.grey,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 30,
  },
  emptyGlowOuter: {
    padding: 12,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 92, 231, 0.06)',
    marginBottom: 8,
  },
  emptyGlowMiddle: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(108, 92, 231, 0.10)',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.fontLight,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.fontSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(108, 92, 231, 0.5)' },
      default: {
        shadowColor: Colors.shadowPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  newBoardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorderStrong,
    backgroundColor: Colors.surface,
    width: '100%',
    marginBottom: 28,
  },
  newBoardButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Features
  featuresContainer: {
    width: '100%',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.fontSecondary,
  },
});

export default Page;
