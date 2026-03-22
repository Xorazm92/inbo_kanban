import { Task } from '@/types/enums';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

const DatePicker = ({ value, onChange, mode = 'date' }: DatePickerProps) => {
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="default"
      onChange={onChange}
    />
  );
};

export default DatePicker;
