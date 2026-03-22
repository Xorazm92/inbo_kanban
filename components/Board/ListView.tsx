import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Task, TaskList } from '@/types/enums';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import DraggableFlatList, { DragEndParams } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '@/context/ClerkContext';
import ListItem from '@/components/Board/ListItem';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Rangli nuqta + emoji statuslari
const STATUS_STYLES: Record<number, { color: string; emoji: string }> = {
  0: { color: '#F8ECEC', emoji: '🗂️' }, // Backlog
  1: { color: '#00D2FF', emoji: '📝' }, // To Do
  2: { color: '#FFB74D', emoji: '🚧' }, // In Progress
  3: { color: '#00E676', emoji: '🥳' }, // Done
  4: { color: '#FF6B6B', emoji: '🚀' }, 
};

const getStatus = (index: number) => STATUS_STYLES[index % Object.keys(STATUS_STYLES).length];

export interface ListViewProps {
  taskList: TaskList;
  onDelete: () => void;
  listIndex?: number;
}

const ListView = ({ taskList, onDelete, listIndex = 0 }: ListViewProps) => {
  const {
    getListCards,
    addListCard,
    updateCard,
    deleteBoardList,
    updateBoardList,
    getRealtimeCardSubscription,
    uploadFile,
  } = useSupabase();
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const [listName, setListName] = useState(taskList.title);
  const { userId } = useAuth();
  const status = getStatus(listIndex);
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  useEffect(() => {
    loadListTasks();

    const subscription = getRealtimeCardSubscription!(taskList.id, handleRealtimeChanges);

    return () => {
      subscription.unsubscribe();
    };
  }, [taskList.id]);

  const handleRealtimeChanges = (update: RealtimePostgresChangesPayload<any>) => {
    const record = update.new?.id ? update.new : update.old;
    const event = update.eventType;

    if (!record) return;

    if (event === 'INSERT') {
      setTasks((prev) => [...prev, record]);
    } else if (event === 'UPDATE') {
      setTasks((prev) =>
        prev
          .map((task) => (task.id === record.id ? record : task))
          .filter((task) => !task.done)
          .sort((a, b) => a.position - b.position)
      );
    } else if (event === 'DELETE') {
      setTasks((prev) => prev.filter((task) => task.id !== record.id));
    }
  };

  const loadListTasks = async () => {
    const data = await getListCards!(taskList.id);
    setTasks(data);
  };

  const onDeleteList = async () => {
    await deleteBoardList!(taskList.id);
    bottomSheetModalRef.current?.close();
    onDelete();
  };

  const onUpdateTaskList = async () => {
    await updateBoardList!(taskList, listName);
  };

  const onAddCard = async () => {
    const { data, error } = await addListCard!(
      taskList.id,
      taskList.board_id,
      newTask,
      tasks.length
    );
    if (!error) {
      setIsAdding(false);
      setNewTask('');
    }
  };

  const onTaskDropped = async (params: DragEndParams<Task>) => {
    const newData = params.data.map((item: any, index: number) => ({
      ...item,
      position: index,
    }));
    setTasks(newData);
    newData.forEach(async (item: any) => {
      await updateCard!(item);
    });
  };

  const onSelectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
      const fileName = `${new Date().getTime()}-${userId}.${img.type === 'image' ? 'png' : 'mp4'}`;
      const filePath = `${taskList.board_id}/${fileName}`;
      const contentType = img.type === 'image' ? 'image/png' : 'video/mp4';
      const storagePath = await uploadFile!(filePath, base64, contentType);

      if (storagePath) {
        await addListCard!(taskList.id, taskList.board_id, fileName, tasks.length, storagePath);
      }
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.4}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={() => bottomSheetModalRef.current?.close()}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      <View style={styles.outerContainer}>
        {/* Column Header — Reference: • Title 📋 */}
        <Pressable 
          onLongPress={() => bottomSheetModalRef.current?.present()}
          style={styles.columnHeader}
        >
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={styles.columnTitle}>{listName}</Text>
          <View style={styles.cardCountBadge}>
            <Text style={styles.cardCountText}>{tasks.length}</Text>
          </View>
          <Text style={styles.columnEmoji}>{status.emoji}</Text>
        </Pressable>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          <DraggableFlatList
            data={tasks}
            renderItem={ListItem}
            keyExtractor={(item) => `${item.id}`}
            onDragEnd={onTaskDropped}
            onDragBegin={() => Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            onPlaceholderIndexChange={() =>
              Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }
            activationDistance={10}
            containerStyle={{ maxHeight: '85%' }}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Add card input */}
          {isAdding && (
            <TextInput
              autoFocus
              style={styles.input}
              placeholder="Vazifa nomini kiriting..."
              value={newTask}
              onChangeText={setNewTask}
              placeholderTextColor={Colors.grey}
              onSubmitEditing={onAddCard}
            />
          )}

          {/* Footer Actions */}
          <View style={styles.footer}>
            {!isAdding && (
              <>
                <Pressable
                  style={styles.addBtn}
                  onPress={() => setIsAdding(true)}
                  role="button">
                  <Ionicons name="add" size={18} color={Colors.fontSecondary} />
                  <Text style={styles.addBtnText}>Karta qo'shish</Text>
                </Pressable>
                <Pressable onPress={onSelectImage} role="button" style={styles.imageBtn}>
                  <Ionicons name="image-outline" size={18} color={Colors.fontSecondary} />
                </Pressable>
              </>
            )}
            {isAdding && (
              <View style={styles.addingActions}>
                <Pressable onPress={() => setIsAdding(false)} role="button">
                  <Text style={styles.cancelText}>Bekor qilish</Text>
                </Pressable>
                <Pressable onPress={onAddCard} role="button" style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Qo'shish</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bottom Sheet — Editing */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleStyle={{
          backgroundColor: Colors.background,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        handleIndicatorStyle={{ backgroundColor: Colors.glassBorderStrong }}
        backgroundStyle={{ backgroundColor: Colors.background }}
        backdropComponent={renderBackdrop}
        enableOverDrag={false}
        enablePanDownToClose>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Pressable
              onPress={() => bottomSheetModalRef.current?.close()}
              role="button">
              <Text style={styles.sheetCancel}>Bekor qilish</Text>
            </Pressable>
          </View>

          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Ro'yxat nomi</Text>
            <TextInput
              style={styles.editInput}
              enterKeyHint="done"
              onEndEditing={onUpdateTaskList}
              onChangeText={(e) => setListName(e)}
              value={listName}
              placeholderTextColor={Colors.grey}
            />
          </View>

          <Pressable onPress={onDeleteList} style={styles.deleteBtn} role="button">
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <Text style={styles.deleteBtnText}>Ro'yxatni o'chirish</Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  outerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    maxHeight: '99%',
  },

  // Column header — matching reference: • Title 📋
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 0,
    paddingVertical: 10,
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.fontLight,
    flex: 1,
  },
  cardCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cardCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.fontSecondary,
  },
  columnEmoji: {
    fontSize: 16,
  },

  // Cards container
  cardsContainer: {
    flex: 1,
    paddingTop: 10,
  },

  // Input
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.fontLight,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorderStrong,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
    height: 40,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.fontSecondary,
  },
  imageBtn: {
    padding: 8,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 8,
  },
  addingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    justifyContent: 'flex-end',
  },
  cancelText: {
    color: Colors.fontSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Bottom sheet
  sheetContainer: {
    flex: 1,
    gap: 16,
    padding: 16,
    backgroundColor: Colors.background,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sheetCancel: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  editSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  editLabel: {
    color: Colors.fontSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  editInput: {
    fontSize: 16,
    color: Colors.fontLight,
  },
  deleteBtn: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.15)',
  },
  deleteBtnText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListView;

