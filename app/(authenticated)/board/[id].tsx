import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Board } from '@/types/enums';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BoardArea from '@/components/Board/BoardArea';
import { useHeaderHeight } from '@react-navigation/elements';

const Page = () => {
  const { id, bg } = useLocalSearchParams<{ id: string; bg?: string }>();
  const { getBoardInfo } = useSupabase();
  const [board, setBoard] = useState<Board>();
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  useEffect(() => {
    if (!id) return;
    loadBoardInfo();
  }, [id]);

  const loadBoardInfo = async () => {
    if (!id) return;
    const data = await getBoardInfo!(id);
    setBoard(data);
  };

  const CustomHeader = () => (
    <View style={[styles.headerSolid, { paddingTop: Platform.OS === 'web' ? 16 : top }]}>
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => router.dismiss()}
          role="button"
          style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.fontLight} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{board?.title}</Text>
          <Text style={styles.headerSubtitle}>
            {(board as any)?.users?.first_name
              ? `${(board as any).users.first_name}ning ishchi joyi`
              : 'Ishchi joy'}
          </Text>
        </View>

        {/* Member Avatars (Mock for now) */}
        <View style={styles.avatarGroup}>
          {[1, 2, 3].map((i, index) => (
            <View key={i} style={[styles.avatarCircle, { left: index * -8, backgroundColor: Colors.surfaceHover }]}>
              <Text style={styles.avatarText}>U{i}</Text>
            </View>
          ))}
          <Pressable style={[styles.avatarCircle, { left: 3 * -8, backgroundColor: Colors.primary }]}>
            <Ionicons name="add" size={14} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={() => {}} role="button" style={styles.headerBtn}>
            <Ionicons name="filter-outline" size={20} color={Colors.fontLight} />
            {Platform.OS === 'web' && <Text style={styles.headerBtnText}>Filtrlar</Text>}
          </Pressable>
          <Pressable onPress={() => {}} role="button" style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.fontLight} />
          </Pressable>
          <Link href={`/board/settings?id=${id}`} asChild>
            <Pressable role="button" style={styles.headerIconBtn}>
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={Colors.fontLight} />
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: bg || Colors.background, paddingTop: headerHeight, flex: 1 }}>
      <Stack.Screen
        options={{
          title: board?.title,
          headerTransparent: true,
          header: () => <CustomHeader />,
        }}
      />
      {board && <BoardArea board={board} />}
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  headerSolid: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHover,
    gap: 6,
  },
  headerBtnText: {
    color: Colors.fontLight,
    fontWeight: '500',
    fontSize: 14,
  },
  headerTitle: {
    color: Colors.fontLight,
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.fontSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: Colors.fontSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHover,
    justifyContent: 'center',
  },
});
export default Page;
