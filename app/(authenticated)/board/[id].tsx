import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Board } from '@/types/enums';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BoardArea from '@/components/Board/BoardArea';
import { useHeaderHeight } from '@react-navigation/elements';

const Page = () => {
  const { id, bg } = useLocalSearchParams<{ id: string; bg?: string }>();
  const { getBoardInfo, getBoardMember } = useSupabase();
  const [board, setBoard] = useState<Board>();
  const [members, setMembers] = useState<any[]>([]);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
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
    const memberData = await getBoardMember!(id);
    setMembers(memberData || []);
  };

  const CustomHeader = () => (
    <View style={StyleSheet.flatten([styles.headerSolid, { paddingTop: Platform.OS === 'web' ? 16 : top }])}>
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

        {/* Member Avatars */}
        <View style={styles.avatarGroup}>
          {members.slice(0, 3).map((member: any, index: number) => (
            <View key={member?.id || index} style={[styles.avatarCircle, { left: index * -8 }]}>
              {member?.avatar_url ? (
                <Image source={{ uri: member.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(member?.first_name || member?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          ))}
          <Link href={`/board/invite?id=${id}`} asChild>
            <View style={StyleSheet.flatten([styles.avatarCircle, { left: Math.min(members.length, 3) * -8, backgroundColor: Colors.primary }])}>
              <Ionicons name="add" size={14} color="#FFF" />
            </View>
          </Link>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowOnlyMine(!showOnlyMine)}
            role="button"
            style={[styles.headerBtn, showOnlyMine && { backgroundColor: Colors.primary }]}>
            <Ionicons
              name="filter-outline"
              size={20}
              color={showOnlyMine ? '#fff' : Colors.fontLight}
            />
            {Platform.OS === 'web' && (
              <Text style={[styles.headerBtnText, showOnlyMine && { color: '#fff' }]}>
                {showOnlyMine ? 'Mening vazifalarim' : 'Filtrlar'}
              </Text>
            )}
          </Pressable>
          <Pressable onPress={() => {}} role="button" style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.fontLight} />
          </Pressable>
          <Link href={`/board/settings?id=${id}`} asChild>
            <View style={StyleSheet.flatten(styles.headerIconBtn)}>
              <MaterialCommunityIcons name="dots-horizontal" size={20} color={Colors.fontLight} />
            </View>
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
      {board && <BoardArea board={board} showOnlyMine={showOnlyMine} />}
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  headerSolid: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.surfaceHover,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarText: {
    color: Colors.fontLight,
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
