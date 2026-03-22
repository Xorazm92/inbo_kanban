import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { useRouter } from 'expo-router';
import { View, Text, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const TEMPLATES = [
  {
    id: '1',
    title: 'Loyiha boshqaruvi',
    description: "Backlog, Bajarilmoqda va Bajarildi ro'yxatlari bilan klassik Kanban",
    icon: 'git-branch-outline' as const,
    color: '#6C5CE7',
    lists: ["📦 Backlog", "📝 Bajarilishi kerak", "🚧 Jarayonda", "✅ Bajarildi"],
  },
  {
    id: '2',
    title: 'Sprint rejalashtirish',
    description: "Agile sprint boshqaruvi uchun tuzilgan doska",
    icon: 'flash-outline' as const,
    color: '#0079bf',
    lists: ["🗂️ Sprint Backlog", "⏳ Jarayonda", "🔍 Tekshiruvda", "🥳 Yakunlandi"],
  },
  {
    id: '3',
    title: 'Mahsulot yo\'l xaritasi',
    description: "Mahsulot rejalarini vizual tarzda kuzatib boring",
    icon: 'map-outline' as const,
    color: '#519839',
    lists: ["💡 G'oyalar", "📋 Rejalangan", "🔨 Qurilmoqda", "🚀 Chiqarildi"],
  },
  {
    id: '4',
    title: 'Kontent taqvimi',
    description: "Blog postlari, ijtimoiy tarmoqlar va kontent boshqaruvi",
    icon: 'calendar-outline' as const,
    color: '#cd5a91',
    lists: ["✏️ G'oyalar", "📝 Yozilmoqda", "👀 Ko'rib chiqilmoqda", "📢 E'lon qilindi"],
  },
  {
    id: '5',
    title: 'Ish joyi tashkiloti',
    description: "Yig'ilishlar, harakatlar va guruh ishini kuzatib boring",
    icon: 'people-outline' as const,
    color: '#b04632',
    lists: ["📌 Harakatlar", "⏰ Bu hafta", "🔄 Jarayonda", "✅ Yakunlangan"],
  },
  {
    id: '6',
    title: 'Shaxsiy maqsadlar',
    description: "Shaxsiy vazifalar va maqsadlarni kuzatib boring",
    icon: 'person-outline' as const,
    color: '#00aecc',
    lists: ["🎯 Maqsadlar", "📅 Bu oy", "🔄 Jarayonda", "🏆 Erishildi"],
  },
];

const Page = () => {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const { createBoard, addBoardList } = useSupabase();
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);

  const onUseTemplate = async (template: typeof TEMPLATES[0]) => {
    setCreating(template.id);
    try {
      const board = await createBoard!(template.title, template.color);
      if (board?.id) {
        for (let i = 0; i < template.lists.length; i++) {
          await addBoardList!(board.id, template.lists[i], i);
        }
        router.dismiss();
      }
    } catch (err) {
      console.error('Template error:', err);
    } finally {
      setCreating(null);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={TEMPLATES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tayyor andozalar</Text>
            <Text style={styles.headerSubtitle}>
              Tezkor boshlash uchun tayyor andozalardan birini tanlang
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.templateTitle}>{item.title}</Text>
              <Text style={styles.templateDescription} numberOfLines={2}>{item.description}</Text>
              <View style={styles.listsPreview}>
                {item.lists.slice(0, 3).map((list, i) => (
                  <View key={i} style={[styles.listTag, { borderColor: item.color + '44' }]}>
                    <Text style={[styles.listTagText, { color: item.color }]}>{list}</Text>
                  </View>
                ))}
                {item.lists.length > 3 && (
                  <Text style={styles.moreText}>+{item.lists.length - 3}</Text>
                )}
              </View>
            </View>
            <Pressable
              style={[styles.useBtn, { backgroundColor: item.color }]}
              onPress={() => onUseTemplate(item)}
              disabled={creating === item.id}
              role="button">
              {creating === item.id ? (
                <Ionicons name="hourglass-outline" size={18} color="#fff" />
              ) : (
                <Ionicons name="add" size={22} color="#fff" />
              )}
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.fontLight,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.fontSecondary,
    lineHeight: 20,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Platform.select({
      web: { transition: 'all 0.2s ease' },
    }),
  },
  cardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 5,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.fontLight,
  },
  templateDescription: {
    fontSize: 12,
    color: Colors.fontSecondary,
    lineHeight: 16,
  },
  listsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  listTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  listTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 11,
    color: Colors.fontSecondary,
    alignSelf: 'center',
    fontWeight: '600',
  },
  useBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
});

export default Page;
