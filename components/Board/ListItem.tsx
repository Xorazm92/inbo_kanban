import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Task } from '@/types/enums';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Pressable, Image, Text, View, Platform } from 'react-native';
import { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

// Matches the exact colors and labels from the screenshot UI
const BADGE_COLORS = [
  { bg: '#3A1E1E', text: '#FF6B6B', label: 'Presentation' },
  { bg: '#3A2C1A', text: '#FFB74D', label: 'UX Design' },
  { bg: '#1A2C3A', text: '#00D2FF', label: 'UI Design' },
  { bg: '#332211', text: '#FF9800', label: 'Management' },     
  { bg: '#112233', text: '#00D2FF', label: 'Research' },
  { bg: '#1A3A1A', text: '#00E676', label: 'Testing' },
  { bg: '#3A1A3A', text: '#FF6BED', label: 'Doc' },
];

const getBadge = (id: string, index: number) => {
  // Use index to consistently distribute colors if id parsing fails, or use id
  const numId = parseInt(id, 10);
  const badgeIndex = (!isNaN(numId) ? numId : index) % BADGE_COLORS.length;
  return BADGE_COLORS[badgeIndex];
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

const ListItem = ({ item, drag, isActive, getIndex }: RenderItemParams<Task>) => {
  const { getFileFromPath } = useSupabase();
  const router = useRouter();
  const index = getIndex() || 0;
  const [imagePath, setImagePath] = useState<string>('');
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  if (item.image_url) {
    getFileFromPath!(item.image_url).then((path) => {
      if (path && path !== imagePath) {
        setImagePath(path);
      }
    });
  }

  const openLink = () => {
    router.push(`/board/card/${item.id}`);
  };

  const badge = getBadge(item.id, index);

  return (
    <ScaleDecorator>
      <Pressable
        onPress={openLink}
        onLongPress={drag}
        disabled={isActive}
        role="button"
        style={[
          styles.card,
          { opacity: isActive ? 0.7 : 1, transform: [{ scale: isActive ? 1.02 : 1 }] },
        ]}>

        {/* Header: Badge + Drag Icon */}
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
          <Pressable style={styles.menuBtn} onPressIn={drag} accessible={false}>
            <MaterialCommunityIcons name="menu" size={20} color={'#666'} />
          </Pressable>
        </View>

        {/* Image */}
        {item.image_url && imagePath ? (
          <Image
            source={{ uri: imagePath }}
            style={styles.cardImage}
          />
        ) : null}

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

        {/* Subtitle / Description */}
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>
        ) : null}

        {/* Footer: User + Date */}
        <View style={styles.cardFooter}>
          <View style={styles.userSection}>
            {item.assigned_to && item.users ? (
              <>
                {item.users.avatar_url ? (
                  <Image source={{ uri: item.users.avatar_url }} style={styles.userAvatar} />
                ) : (
                  <View style={styles.userAvatarPlaceholder}>
                    <Ionicons name="person" size={10} color={Colors.fontSecondary} />
                  </View>
                )}
                <Text style={styles.userName} numberOfLines={1}>
                  {item.users.first_name || item.users.email?.split('@')[0]}
                </Text>
              </>
            ) : (
              <Text style={styles.unassigned}>Unassigned</Text>
            )}
          </View>
          <View style={styles.dateSection}>
            <Ionicons name="calendar-outline" size={12} color={'#888'} />
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </Pressable>
    </ScaleDecorator>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuBtn: {
    padding: 2,
  },

  // Image
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
  },

  // Title - Serif styling
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.fontLight,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Description
  cardDescription: {
    fontSize: 13,
    color: Colors.fontSecondary,
    lineHeight: 18,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
  },
  userAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 12,
    color: Colors.fontLight,
    fontWeight: '500',
    maxWidth: 100,
  },
  unassigned: {
    fontSize: 12,
    color: Colors.fontSecondary,
    fontStyle: 'italic',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: Colors.fontSecondary,
    fontWeight: '500',
  },
});

export default ListItem;
