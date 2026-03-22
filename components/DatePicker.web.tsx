import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface DatePickerProps {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

const DatePicker = ({ value, onChange }: DatePickerProps) => {
  const dateString = value.toISOString().split('T')[0];

  const onWebChange = (e: any) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onChange({}, newDate);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        {...({ type: 'date' } as any)}
        value={dateString}
        onChange={onWebChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  input: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default DatePicker;
