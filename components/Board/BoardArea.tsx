import ListStart from '@/components/Board/ListStart';
import ListView from '@/components/Board/ListView';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupabase } from '@/context/SupabaseContext';
import { Board, TaskList, TaskListFake } from '@/types/enums';
import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface BoardAreaProps {
  board?: Board;
  showOnlyMine?: boolean;
}

const BoardArea = ({ board, showOnlyMine = false }: BoardAreaProps) => {
  const { getBoardLists, addBoardList } = useSupabase();
  const [startListActive, setStartListActive] = useState(false);
  const [data, setData] = useState<Array<TaskList | TaskListFake>>([{ id: undefined }]);
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  useEffect(() => {
    loadBoardLists();
  }, []);

  const loadBoardLists = async () => {
    if (!board) return;
    const lists = await getBoardLists!(board.id);
    setData([...lists, { id: undefined }]);
  };

  const onSaveNewList = async (title: any) => {
    setStartListActive(false);
    const { data: newItem } = await addBoardList!(board!.id, title);
    const newData = [...data];
    newData.pop();
    setData([...newData, newItem, { id: undefined }]);
  };

  const onListDeleted = (id: string) => {
    setData(data.filter((item) => item.id !== id));
  };

  const renderLists = useMemo(() => {
    return data.map((item, index) => (
      <View key={item.id ? `list-${item.id}` : `add-list`} style={styles.columnWrapper}>
        {item.id && (
          <ListView
            taskList={item as TaskList}
            listIndex={index}
            onDelete={() => onListDeleted(item.id!)}
            showOnlyMine={showOnlyMine}
          />
        )}
        {item.id === undefined && (
          <View style={styles.addListContainer}>
            {!startListActive && (
              <Pressable onPress={() => setStartListActive(true)} style={styles.listAddBtn}>
                <Ionicons name="add" size={20} color={Colors.fontLight} />
                <Text style={styles.listAddText}>Ro'yxat qo'shish</Text>
              </Pressable>
            )}

            {startListActive && (
              <ListStart onCancel={() => setStartListActive(false)} onSave={onSaveNewList} />
            )}
          </View>
        )}
      </View>
    ));
  }, [data, startListActive, showOnlyMine, Colors]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContainer}
        keyboardShouldPersistTaps="always"
      >
        {renderLists}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  boardContainer: {
    padding: 16,
    paddingRight: 64, 
    gap: 16,
    alignItems: 'flex-start',
  },
  columnWrapper: {
    width: Platform.OS === 'web' ? 320 : 300,
  },
  addListContainer: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  listAddBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listAddText: {
    color: Colors.fontLight,
    fontSize: 15,
    fontWeight: '600',
  },
});
export default BoardArea;
