import { useSupabase } from '@/context/SupabaseContext';
import { Task, User } from '@/types/enums';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import UserListItem from '@/components/UserListItem';
import { client } from '@/utils/supabaseClient';
import { useAuth } from '@/context/ClerkContext';
import DatePicker from '@/components/DatePicker';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const listBottomSheetRef = useRef<BottomSheetModal>(null);
  const listSnapPoints = useMemo(() => ['40%', '60%'], []);

  const { getCardInfo, getBoardMember, getFileFromPath, updateCard, assignCard, getBoardLists, moveCardToList, getUserRole } = useSupabase();

  const router = useRouter();
  const [card, setCard] = useState<Task>();
  const [member, setMember] = useState<User[]>();
  const [imagePath, setImagePath] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<any>(null);

  const [checklists, setChecklists] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newChecklist, setNewChecklist] = useState('');
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [allLists, setAllLists] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!id) return;
    setChecklists([]);
    setComments([]);
    setImagePath('');
    loadInfo();
    loadFeatures();
    
    // Load current user's role for permissions
    getUserRole!().then(setCurrentUserRole);
  }, [id]);

  const canEdit = useMemo(() => {
    if (!card || !userId || !currentUserRole) return false;
    
    // Admin can edit everything
    if (currentUserRole.role === 'admin') return true;
    
    // Creator can edit
    if (card.user_id === userId) return true;
    
    // Assignee can edit
    if (card.assigned_to === userId) return true;
    
    // Lead can edit if it's their team member's card (assigned to them)
    if (currentUserRole.role === 'lead' && card.users?.manager_id === userId) return true;
    
    return false;
  }, [card, userId, currentUserRole]);

  const loadFeatures = async () => {
    // Load Checklists
    const clRes = await client.from('checklists').select('*, checklist_items(*)').eq('card_id', id);
    setChecklists(clRes.data || []);

    // Load Comments
    const cmRes = await client.from('comments').select('*, users(*)').eq('card_id', id).order('created_at', { ascending: false });
    setComments(cmRes.data || []);
  };

  const onAddComment = async () => {
    if (!newComment.trim() || !userId) return;
    await client.from('comments').insert({ card_id: id, user_id: userId, text: newComment });
    setNewComment('');
    loadFeatures();
  };

  const onAddChecklist = async () => {
    if (!newChecklist.trim()) return;
    await client.from('checklists').insert({ card_id: id, title: newChecklist });
    setNewChecklist('');
    setIsAddingChecklist(false);
    loadFeatures();
  };

  const onToggleChecklistItem = async (itemId: number, done: boolean) => {
    await client.from('checklist_items').update({ done }).match({ id: itemId });
    loadFeatures();
  };

  const loadInfo = async () => {
    if (!id) return;

    const data = await getCardInfo!(id);
    setCard(data);

    if (data?.image_url) {
      getFileFromPath!(data.image_url).then((path) => {
        if (path) setImagePath(path);
      });
    }

    const member = await getBoardMember!(data.board_id);
    setMember(member);

    const lists = await getBoardLists!(data.board_id);
    setAllLists(lists || []);
  };

  const saveAndClose = () => {
    if (card && canEdit) {
      updateCard!(card);
    }
    router.back();
  };

  const onArchiveCard = () => {
    if (card) {
      updateCard!({ ...card, done: true });
    }
    router.back();
  };

  const onAssignUser = async (user: User) => {
    const { data, error } = await assignCard!(card!.id, user.id);

    setCard(data);
    bottomSheetModalRef.current?.close();
  };

  const onMoveToList = async (listId: string) => {
    const { data, error } = await moveCardToList!(card!.id, listId);
    if (!error) {
      setCard({ ...card!, list_id: listId });
      listBottomSheetRef.current?.close();
      Alert.alert('Muvaffaqiyatli', 'Karta muvaffaqiyatli ko\'chirildi!');
    }
  };
  
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && card) {
      setCard({ ...card, due_date: selectedDate.toISOString() });
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.6}
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
      <View style={styles.page}>
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable onPress={saveAndClose} role="button" style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.fontSecondary} />
              </Pressable>
            ),
          }}
        />
        {card && (
          <ScrollView style={styles.contentContainer} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.label}>Karta nomi</Text>
              {!card.image_url ? (
                <TextInput
                  style={styles.titleInput}
                  value={card.title || ''}
                  multiline
                  placeholderTextColor={Colors.grey}
                  onChangeText={(text: string) => setCard({ ...card, title: text })}
                  editable={canEdit}
                />
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Tavsif</Text>
              <TextInput
                style={[styles.input, { minHeight: 120, verticalAlign: 'top' }]}
                value={card.description || ''}
                multiline
                placeholder="Tavsif va eslatmalar qo'shing..."
                placeholderTextColor={Colors.grey}
                onChangeText={(text: string) => setCard({ ...card, description: text })}
                editable={canEdit}
              />
            </View>

            {imagePath ? (
              <View style={BiriktirmaContainer}>
                <Text style={styles.label}>Biriktirma</Text>
                {card.image_url ? (
                  <Image
                    source={{ uri: imagePath }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            ) : null}

            {!canEdit && (
              <View style={styles.readOnlyNotice}>
                <Ionicons name="eye-outline" size={16} color={Colors.warning} />
                <Text style={styles.readOnlyText}>Ko'rish tartibi (Tahrirlash taqiqlangan)</Text>
              </View>
            )}

            <View style={styles.rowSection}>
              <View style={styles.memberOuter}>
                <Text style={styles.label}>Mas'ul xodim</Text>
                <Pressable 
                  style={[styles.memberContainer, !canEdit && { opacity: 0.7 }]}
                  onPress={() => canEdit && bottomSheetModalRef.current?.present()}
                  role="button">
                  <View style={styles.memberIconBox}>
                    <Ionicons name="person" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    {!card.assigned_to ? (
                      <Text style={styles.memberLabelEmpty}>Tayinlanmagan</Text>
                    ) : (
                      <Text style={styles.memberLabel}>
                        {card.users?.first_name || card.users?.email?.split('@')[0]}
                      </Text>
                    )}
                  </View>
                  {canEdit && <Ionicons name="chevron-forward" size={16} color={Colors.grey} />}
                </Pressable>
              </View>

              <View style={styles.archiveOuter}>
                <Text style={styles.label}>Harakatlar</Text>
                <Pressable 
                  onPress={() => canEdit && onArchiveCard()} 
                  style={[styles.archiveBtn, !canEdit && { opacity: 0.5 }]} 
                  role="button">
                  <Ionicons name="archive-outline" size={18} color={Colors.warning} />
                  <Text style={styles.archiveBtnText}>Arxivlash</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.rowSection}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.label}>Muddat (Deadline)</Text>
                <Pressable 
                  style={[styles.memberContainer, !canEdit && { opacity: 0.7 }]} 
                  onPress={() => canEdit && setShowDatePicker(true)}
                  role="button"
                >
                  <View style={[styles.memberIconBox, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                    <Ionicons name="calendar-outline" size={18} color="#FF6B6B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={card.due_date ? styles.memberLabel : styles.memberLabelEmpty}>
                      {card.due_date ? new Date(card.due_date).toLocaleDateString() : 'Belgilanmagan'}
                    </Text>
                  </View>
                  {canEdit && <Ionicons name="chevron-forward" size={16} color={Colors.grey} />}
                </Pressable>
                {showDatePicker && (
                  <DatePicker
                    value={card.due_date ? new Date(card.due_date) : new Date()}
                    onChange={onDateChange}
                  />
                )}
              </View>

              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.label}>Vaqt (Soat)</Text>
                <View style={styles.memberContainer}>
                  <View style={[styles.memberIconBox, { backgroundColor: 'rgba(78, 205, 196, 0.15)' }]}>
                    <Ionicons name="time-outline" size={18} color="#4ECDC4" />
                  </View>
                  <TextInput
                    style={[styles.memberLabel, { flex: 1 }]}
                    placeholder="Soat..."
                    keyboardType="numeric"
                    value={card.estimated_hours?.toString() || ''}
                    onChangeText={(text) => setCard({ ...card, estimated_hours: text ? parseInt(text) : null })}
                    placeholderTextColor={Colors.grey}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Ro'yxat (Column)</Text>
              <Pressable
                style={styles.memberContainer}
                onPress={() => listBottomSheetRef.current?.present()}
                role="button">
                <View style={[styles.memberIconBox, { backgroundColor: 'rgba(0, 210, 255, 0.15)' }]}>
                  <Ionicons name="layers-outline" size={18} color={Colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberLabel}>
                    {allLists.find((l) => l.id === card.list_id)?.title || 'Ro\'yxatni tanlang'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
              </Pressable>
            </View>

            {/* Sub-tasks / Checklists */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkbox-outline" size={20} color={Colors.fontSecondary} />
                <Text style={styles.sectionTitle}>Vazifalar ro'yxati</Text>
              </View>

              {checklists.map((cl) => {
                const total = cl.checklist_items?.length || 0;
                const done = cl.checklist_items?.filter((i: any) => i.done).length || 0;
                const percent = total === 0 ? 0 : Math.round((done / total) * 100);

                return (
                  <View key={cl.id} style={{ marginBottom: 12 }}>
                    <Text style={{ color: Colors.fontLight, fontWeight: '600', marginBottom: 6 }}>{cl.title}</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                    </View>
                    {cl.checklist_items?.map((item: any) => (
                      <Pressable 
                        key={item.id} 
                        style={styles.checklistItem}
                        onPress={() => canEdit && onToggleChecklistItem(item.id, !item.done)}
                      >
                        <Ionicons 
                          name={item.done ? "checkbox" : "square-outline"} 
                          size={20} 
                          color={item.done ? Colors.primary : Colors.fontSecondary} 
                        />
                        <Text style={[styles.checklistText, item.done && styles.checklistDone]}>{item.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                );
              })}

              {isAddingChecklist ? (
                <View style={{ gap: 8 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ro'yxat nomi..."
                    value={newChecklist}
                    onChangeText={setNewChecklist}
                    placeholderTextColor={Colors.grey}
                    autoFocus
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable style={styles.saveBtn} onPress={onAddChecklist} role="button">
                      <Text style={styles.saveBtnText}>Saqlash</Text>
                    </Pressable>
                    <Pressable style={styles.cancelBtn} onPress={() => setIsAddingChecklist(false)} role="button">
                      <Text style={styles.cancelBtnText}>Bekor qilish</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.addChecklistBtn} onPress={() => setIsAddingChecklist(true)} role="button">
                  <Text style={styles.addChecklistText}>+ Yangi ro'yxat</Text>
                </Pressable>
              )}
            </View>

            {/* Comments */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="chatbubble-outline" size={20} color={Colors.fontSecondary} />
                <Text style={styles.sectionTitle}>Izohlar</Text>
              </View>
              <View style={styles.commentInputBox}>
                <View style={styles.memberIconBoxSmall}>
                  <Ionicons name="person" size={14} color={Colors.primary} />
                </View>
                <TextInput 
                  style={styles.commentInput} 
                  placeholder="Izoh yozing..." 
                  value={newComment}
                  onChangeText={setNewComment}
                  onSubmitEditing={onAddComment}
                  placeholderTextColor={Colors.grey} 
                />
              </View>

              <View style={{ gap: 16, marginTop: 12 }}>
                {comments.map(c => (
                  <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
                    {c.users?.avatar_url ? (
                      <Image source={{ uri: c.users.avatar_url }} style={styles.commentAvatar} />
                    ) : (
                      <View style={styles.memberIconBoxSmall}>
                        <Ionicons name="person" size={14} color={Colors.primary} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Text style={{ fontWeight: '600', color: Colors.fontLight }}>{c.users?.first_name || 'Foydalanuvchi'}</Text>
                        <Text style={{ fontSize: 11, color: Colors.fontSecondary }}>Bugun</Text>
                      </View>
                      <View style={styles.commentBubble}>
                        <Text style={{ color: Colors.fontLight, lineHeight: 20 }}>{c.text}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

          </ScrollView>
        )}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          handleStyle={{ backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          handleIndicatorStyle={{ backgroundColor: Colors.glassBorderStrong, width: 40 }}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: Colors.background }}
          enableOverDrag={false}
          enablePanDownToClose>
          <View style={styles.bottomContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Xodimni tanlang</Text>
              <Pressable onPress={() => bottomSheetModalRef.current?.close()} role="button" style={styles.sheetClose}>
                <Ionicons name="close" size={20} color={Colors.fontSecondary} />
              </Pressable>
            </View>
            <View style={styles.sheetContent}>
              <FlatList
                data={member}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => <UserListItem onPress={onAssignUser} user={item} />}
                contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
              />
            </View>
          </View>
        </BottomSheetModal>

        <BottomSheetModal
          ref={listBottomSheetRef}
          index={0}
          snapPoints={listSnapPoints}
          handleStyle={{ backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          handleIndicatorStyle={{ backgroundColor: Colors.glassBorderStrong, width: 40 }}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: Colors.background }}
          enableOverDrag={false}
          enablePanDownToClose>
          <View style={styles.bottomContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Ro'yxatni tanlang</Text>
              <Pressable onPress={() => listBottomSheetRef.current?.close()} role="button" style={styles.sheetClose}>
                <Ionicons name="close" size={20} color={Colors.fontSecondary} />
              </Pressable>
            </View>
            <View style={styles.sheetContent}>
              <FlatList
                data={allLists}
                keyExtractor={(item) => `${item.id}`}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.listItemSelect}
                    onPress={() => onMoveToList(item.id)}
                    role="button">
                    <Ionicons 
                      name={item.id === card?.list_id ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={item.id === card?.list_id ? Colors.primary : Colors.grey} 
                    />
                    <Text style={[styles.listItemText, item.id === card?.list_id && { color: Colors.primary, fontWeight: '700' }]}>
                      {item.title}
                    </Text>
                  </Pressable>
                )}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
              />
            </View>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginLeft: 8,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.fontLight,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 16,
  },
  memberOuter: {
    flex: 1,
    gap: 8,
  },
  archiveOuter: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.fontSecondary,
    marginLeft: 4,
  },
  titleInput: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.fontLight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  input: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    fontSize: 15,
    color: Colors.fontLight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cardImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  memberContainer: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    height: 56,
  },
  memberIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberIconBoxSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberLabel: {
    fontSize: 14,
    color: Colors.fontLight,
    fontWeight: '500',
  },
  memberLabelEmpty: {
    fontSize: 14,
    color: Colors.grey,
    fontStyle: 'italic',
  },
  archiveBtn: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 183, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 77, 0.25)',
    height: 56,
  },
  archiveBtnText: {
    fontSize: 15,
    color: Colors.warning,
    fontWeight: '600',
  },
  bottomContainer: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  sheetTitle: {
    color: Colors.fontLight,
    fontSize: 18,
    fontWeight: '700',
  },
  sheetClose: {
    padding: 6,
    backgroundColor: Colors.surface,
    borderRadius: 20,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checklistText: {
    color: Colors.fontLight,
    fontSize: 15,
    flex: 1,
  },
  checklistDone: {
    textDecorationLine: 'line-through',
    color: Colors.fontSecondary,
  },
  addChecklistBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addChecklistText: {
    color: Colors.fontSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  commentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    color: Colors.fontLight,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: Colors.fontSecondary,
    fontWeight: '600',
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  readOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 171, 0, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 171, 0, 0.2)',
    marginBottom: 8,
  },
  readOnlyText: {
    color: '#FFAB00',
    fontSize: 13,
    fontWeight: '600',
  },
  commentBubble: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  listItemSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  listItemText: {
    fontSize: 16,
    color: Colors.fontLight,
  },
});
const BiriktirmaContainer = { gap: 8 };

export default Page;
