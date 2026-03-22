import { useThemeColors } from '@/hooks/useThemeColors';
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform } from 'react-native';

export interface ListStartProps {
  onCancel: () => void;
  onSave: (title: string) => void;
}

const ListStart = ({ onCancel, onSave }: ListStartProps) => {
  const [listTitle, setListTitle] = useState('');
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Yangi ro'yxat tuzish</Text>
      <TextInput
        style={styles.input}
        value={listTitle}
        onChangeText={setListTitle}
        placeholder="Ro'yxat nomi, masalan 'Bajarilmoqda'"
        placeholderTextColor={Colors.grey}
        autoFocus
        onSubmitEditing={() => onSave(listTitle)}
      />
      <View style={styles.actions}>
        <Pressable onPress={onCancel} role="button" style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Bekor qilish</Text>
        </Pressable>
        <Pressable onPress={() => onSave(listTitle)} role="button" style={styles.saveBtn}>
          <Text style={styles.saveText}>Saqlash</Text>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (Colors: any) => StyleSheet.create({
  card: {
    backgroundColor: Colors.glassBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.fontSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorderStrong,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 15,
    color: Colors.fontLight,
    backgroundColor: Colors.surface,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: Colors.fontSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(108, 92, 231, 0.4)' },
      ios: {
        shadowColor: Colors.shadowPrimary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
export default ListStart;
