import { AttendanceSummaryRow } from "@/types/attendance";
import React from "react";
import { Text, View } from "react-native";

interface AttendanceRowProps {
  item: AttendanceSummaryRow;
}

export const AttendanceRow: React.FC<AttendanceRowProps> = ({ item }) => {
  return (
    <View className="flex-row items-center border-b border-slate-100 py-3.5 px-2 bg-white">
      {/* Fullname & Date */}
      <View className="w-52 pr-2">
        <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>
          {item.fullname}
        </Text>
        <Text className="text-xs text-slate-400 font-medium mt-0.5">
          {item.scanned_date}
        </Text>
      </View>

      {/* Time In */}
      <View className="w-24 items-center">
        <Text
          className={`font-semibold text-sm ${
            item.time_in ? "text-emerald-600" : "text-slate-300"
          }`}
        >
          {item.time_in || "--:--"}
        </Text>
      </View>

      {/* Break Out */}
      <View className="w-24 items-center">
        <Text
          className={`font-semibold text-sm ${
            item.break_out ? "text-amber-600" : "text-slate-300"
          }`}
        >
          {item.break_out || "--:--"}
        </Text>
      </View>

      {/* Break In */}
      <View className="w-24 items-center">
        <Text
          className={`font-semibold text-sm ${
            item.break_in ? "text-blue-600" : "text-slate-300"
          }`}
        >
          {item.break_in || "--:--"}
        </Text>
      </View>

      {/* Time Out */}
      <View className="w-24 items-center">
        <Text
          className={`font-semibold text-sm ${
            item.time_out ? "text-rose-600" : "text-slate-300"
          }`}
        >
          {item.time_out || "--:--"}
        </Text>
      </View>
    </View>
  );
};
