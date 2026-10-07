import React, { useRef, useState } from "react";
import { PanResponder, Text, TouchableOpacity, View } from "react-native";

interface CustomCalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  onSelectDate?: (dateString: string) => void;
  highlightedDates?: string[]; // Dates with events
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onSelectDate,
  highlightedDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Setup PanResponder for left/right swipe navigation
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          handleNextMonth();
        } else if (gestureState.dx > 50) {
          handlePrevMonth();
        }
      },
    }),
  ).current;

  // Calendar matrix calculation (Monday start)
  const firstDay = new Date(year, month, 1).getDay();
  const paddingDays = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; monthOffset: number }[] =
    [];

  // Previous month padding days
  for (let i = paddingDays - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthDays - i,
      currentMonth: false,
      monthOffset: -1,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, monthOffset: 0 });
  }

  // Next month padding days to complete grid rows
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    cells.push({ day: i, currentMonth: false, monthOffset: 1 });
  }

  const handleDayPress = (cell: (typeof cells)[0]) => {
    const targetDate = new Date(year, month + cell.monthOffset, cell.day);
    const formattedMonth = String(targetDate.getMonth() + 1).padStart(2, "0");
    const formattedDay = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${targetDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

    if (cell.monthOffset !== 0) {
      setCurrentMonth(targetDate);
    }
    if (onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  return (
    <View className="w-full" {...panResponder.panHandlers}>
      {/* Header: Month Year */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-slate-900">
          {MONTH_NAMES[month]} {year}
        </Text>
      </View>

      {/* Weekdays Header */}
      <View className="flex-row justify-between mb-2">
        {WEEKDAYS.map((day, idx) => (
          <Text
            key={idx}
            className="w-[14.28%] text-center text-sm font-semibold text-slate-400"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Underline Divider */}
      <View className="h-[1px] bg-slate-200 mb-4" />

      {/* Days Grid - Perfectly Square Day Cells */}
      <View className="flex-row flex-wrap">
        {cells.map((cell, idx) => {
          const targetDate = new Date(year, month + cell.monthOffset, cell.day);
          const formattedMonth = String(targetDate.getMonth() + 1).padStart(
            2,
            "0",
          );
          const formattedDay = String(targetDate.getDate()).padStart(2, "0");
          const dateStr = `${targetDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

          const isSelected = selectedDate === dateStr;
          const isEventDay = highlightedDates.includes(dateStr);

          // Dynamic class selection for circle indicator vs selection
          let circleStyle = "";
          if (isSelected) {
            circleStyle = "bg-slate-900"; // Active selected date
          } else if (isEventDay && cell.currentMonth) {
            circleStyle = "bg-brand-100"; // Event day circle
          }

          return (
            <View key={idx} className="w-[14.28%] aspect-square p-1">
              <TouchableOpacity
                onPress={() => handleDayPress(cell)}
                className={`w-full h-full justify-center items-center rounded-full ${circleStyle}`}
              >
                <Text
                  className={`text-base font-semibold ${
                    isSelected
                      ? "text-white font-bold"
                      : isEventDay && cell.currentMonth
                        ? "text-slate-900 font-bold"
                        : cell.currentMonth
                          ? "text-slate-800"
                          : "text-slate-300"
                  }`}
                >
                  {cell.day}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};
