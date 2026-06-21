import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { getCalendarLunarInfo } from '../utils/lunarCalendar';

interface Props {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (date: string) => void;
  allowClear?: boolean;
  minDate?: string;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

type ViewMode = 'date' | 'yearMonth';

export default function CalendarDatePicker({
  label,
  required,
  value,
  placeholder = '请选择日期',
  error,
  onChange,
  allowClear,
  minDate,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('date');
  const [viewDate, setViewDate] = useState(() => {
    const date = value ? new Date(value) : new Date();
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const selectedDate = value;

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysCount = lastDay.getDate();
    const startingDay = (firstDay.getDay() + 6) % 7;
    return { daysCount, startingDay };
  };

  const isDisabled = (dateStr: string) => {
    if (minDate && dateStr < minDate) {
      return true;
    }
    return false;
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const handleSelectDate = (day: number) => {
    const monthStr = String(viewDate.month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${viewDate.year}-${monthStr}-${dayStr}`;
    onChange(dateStr);
    setModalVisible(false);
  };

  const handleClear = () => {
    onChange('');
    setModalVisible(false);
  };

  const handlePrevYear = () => {
    setViewDate((prev) => ({ ...prev, year: prev.year - 1 }));
  };

  const handleNextYear = () => {
    setViewDate((prev) => ({ ...prev, year: prev.year + 1 }));
  };

  const handleSelectYear = (year: number) => {
    setViewDate((prev) => ({ ...prev, year }));
  };

  const handleSelectMonth = (month: number) => {
    setViewDate((prev) => ({ ...prev, month }));
    setViewMode('date');
  };

  const openModal = () => {
    const date = value ? new Date(value) : new Date();
    setViewDate({ year: date.getFullYear(), month: date.getMonth() + 1 });
    setViewMode('date');
    setModalVisible(true);
  };

  const { daysCount, startingDay } = getDaysInMonth(viewDate.year, viewDate.month);
  const days: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysCount; i++) {
    days.push(i);
  }

  const monthName = `${viewDate.year}年${viewDate.month}月`;

  // 年份列表：当前年份前后5年
  const currentYear = new Date().getFullYear();
  const yearRangeStart = currentYear - 5;
  const yearRangeEnd = currentYear + 5;
  const yearOptions = Array.from({ length: yearRangeEnd - yearRangeStart + 1 }, (_, i) => yearRangeStart + i);

  const renderDateView = () => (
    <>
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
          <Text style={styles.navBtnText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('yearMonth')}>
          <Text style={styles.monthText}>{monthName}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
          <Text style={styles.navBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          const monthStr = String(viewDate.month).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const dateStr = `${viewDate.year}-${monthStr}-${dayStr}`;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const disabled = isDisabled(dateStr);

          // 获取农历信息
          const lunarInfo = getCalendarLunarInfo(dateStr);

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isToday && !isSelected && styles.dayCellToday,
                disabled && styles.dayCellDisabled,
              ]}
              onPress={() => !disabled && handleSelectDate(day)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayTextToday,
                  disabled && styles.dayTextDisabled,
                ]}
              >
                {day}
              </Text>
              <Text
                style={[
                  styles.lunarText,
                  lunarInfo.type === 'solarTerm' && styles.solarTermText,
                  isSelected && styles.lunarTextSelected,
                  disabled && styles.dayTextDisabled,
                ]}
              >
                {lunarInfo.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  const renderYearMonthView = () => (
    <>
      {/* 年份选择 */}
      <View style={styles.yearNav}>
        <TouchableOpacity style={styles.yearNavBtn} onPress={handlePrevYear}>
          <Text style={styles.yearNavBtnText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{viewDate.year}年</Text>
        <TouchableOpacity style={styles.yearNavBtn} onPress={handleNextYear}>
          <Text style={styles.yearNavBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.yearGrid}>
        {yearOptions.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearCell,
              year === viewDate.year && styles.yearCellSelected,
            ]}
            onPress={() => handleSelectYear(year)}
          >
            <Text
              style={[
                styles.yearCellText,
                year === viewDate.year && styles.yearCellTextSelected,
              ]}
            >
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 月份选择 */}
      <Text style={styles.monthSelectTitle}>选择月份</Text>
      <View style={styles.monthGrid}>
        {MONTHS.map((monthNameText, index) => {
          const month = index + 1;
          const isSelected = month === viewDate.month;
          return (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthCell,
                isSelected && styles.monthCellSelected,
              ]}
              onPress={() => handleSelectMonth(month)}
            >
              <Text
                style={[
                  styles.monthCellText,
                  isSelected && styles.monthCellTextSelected,
                ]}
              >
                {monthNameText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => setViewMode('date')}
      >
        <Text style={styles.backBtnText}>返回日期选择</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TouchableOpacity style={styles.input} onPress={openModal}>
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {value || placeholder}
          </Text>
          <Text style={styles.icon}>📅</Text>
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.calendarContent} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>选择日期</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'date' ? renderDateView() : renderYearMonthView()}

            <View style={styles.footer}>
              {allowClear && viewMode === 'date' && (
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                  <Text style={styles.clearBtnText}>清空</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.cancelBtn, !allowClear && styles.cancelBtnFull]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#D32F2F',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  icon: {
    fontSize: 18,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
    padding: 4,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
  },
  navBtnText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: '#999',
  },
  lunarText: {
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  solarTermText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  lunarTextSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    color: '#666',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelBtnFull: {
    flex: 2,
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#666',
  },
  // 年月选择面板样式
  yearNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  yearNavBtn: {
    padding: 8,
  },
  yearNavBtnText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  yearCell: {
    width: '25%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearCellSelected: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  yearCellText: {
    fontSize: 14,
    color: '#333',
  },
  yearCellTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  monthSelectTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCell: {
    width: '33.33%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthCellSelected: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  monthCellText: {
    fontSize: 14,
    color: '#333',
  },
  monthCellTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});