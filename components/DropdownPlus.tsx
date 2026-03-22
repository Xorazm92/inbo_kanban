import { useThemeColors } from '@/hooks/useThemeColors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

const DropdownPlus = () => {
  const router = useRouter();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable role="button" style={styles.triggerBtn}>
          <View style={styles.iconContainer}>
            <Ionicons name="add" size={20} color={Colors.fontLight} />
          </View>
        </Pressable>
      </DropdownMenu.Trigger>

      {/* @ts-expect-error type missing */}
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Item
            key="board"
            onSelect={() => router.push('/boards/new-board')}>
            <DropdownMenu.ItemTitle style={{ color: Colors.fontLight }}>Yangi doska yaratish</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: 'square.split.2x1',
                pointSize: 24,
              }}></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>

          <DropdownMenu.Item key="card">
            <DropdownMenu.ItemTitle style={{ color: Colors.fontLight }}>Karta yaratish</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon
              ios={{
                name: 'square.topthird.inset.filled',
                pointSize: 24,
              }}></DropdownMenu.ItemIcon>
          </DropdownMenu.Item>
        </DropdownMenu.Group>

        <DropdownMenu.Item
          key="templates"
          onSelect={() => router.push('/boards/templates')}>
          <DropdownMenu.ItemTitle style={{ color: Colors.fontLight }}>Andozalarni ko'rish</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon
            ios={{
              name: 'square.on.square.dashed',
              pointSize: 24,
            }}></DropdownMenu.ItemIcon>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  triggerBtn: {
    padding: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: `0 4px 8px ${Colors.shadowPrimary || 'rgba(0,0,0,0.4)'}`,
      },
      ios: {
        shadowColor: Colors.shadowPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});

export default DropdownPlus;
