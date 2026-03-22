import { useThemeColors } from '@/hooks/useThemeColors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Platform } from 'react-native';

const Layout = () => {
  const Colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.glassBorder,
          borderTopWidth: 1,
          elevation: 0,
          paddingBottom: Platform.OS === 'web' ? 34 : 4,
          height: Platform.OS === 'web' ? 84 : 56,
        },
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
        },
        headerTitleStyle: {
          color: Colors.fontLight,
          fontWeight: '700',
        },
        headerTintColor: Colors.fontLight,
      }}>
      <Tabs.Screen
        name="boards"
        options={{
          headerShown: false,
          title: 'Doskalar',
          tabBarIcon: ({ size, color, focused }) => (
            <Ionicons 
              name={focused ? "grid" : "grid-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-cards"
        options={{
          title: 'Kartalarim',
          tabBarIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="view-dashboard-variant-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-log"
        options={{
          title: 'Kundalik',
          tabBarIcon: ({ size, color }) => <Ionicons name="journal-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Bildirishnomalar',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Hisob',
          tabBarIcon: ({ size, color }) => (
            <FontAwesome name="user-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};
export default Layout;
