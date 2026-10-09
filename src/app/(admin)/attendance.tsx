import { Calendar, ChevronDown, Search, UserCheck } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { AttendanceRow } from "@/components/AttendanceRow";
import { attendanceService } from "@/services/attendanceService";
import { Attendance, AttendanceSummaryRow } from "@/types/attendance";
import { Event } from "@/types/event";

export default function AttendanceScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rawLogs, setRawLogs] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedEvents, fetchedLogs] = await Promise.all([
        attendanceService.getEvents(),
        attendanceService.getAttendanceLogs(selectedEvent?.id),
      ]);
      setEvents(fetchedEvents);
      setRawLogs(fetchedLogs);
    } catch (err) {
      console.error("Failed to load attendance data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEvent]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return undefined;
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Group raw scan rows into structured table rows
  const attendanceRows = useMemo<AttendanceSummaryRow[]>(() => {
    const map: Record<string, AttendanceSummaryRow> = {};

    rawLogs.forEach((log) => {
      // Safely fallback to log.profile or log.users depending on Supabase type resolution
      const userProfile = log.profile || (log as any).users;
      const eventDetail = log.event || (log as any).events;

      const dateKey = log.scanned_at
        ? new Date(log.scanned_at).toISOString().split("T")[0]
        : "no-date";
      const rowKey = `${log.user_id}_${log.event_id}_${dateKey}`;

      if (!map[rowKey]) {
        map[rowKey] = {
          key: rowKey,
          user_id: log.user_id,
          event_id: log.event_id,
          event_title: eventDetail?.title || "Event",
          fullname: userProfile?.fullname || "Unknown User",
          scanned_date: log.scanned_at ? formatDate(log.scanned_at) : "N/A",
        };
      }

      const formatted = formatTime(log.scanned_at);
      if (log.scan_type === "time_in" && !map[rowKey].time_in)
        map[rowKey].time_in = formatted;
      if (log.scan_type === "break_out" && !map[rowKey].break_out)
        map[rowKey].break_out = formatted;
      if (log.scan_type === "break_in" && !map[rowKey].break_in)
        map[rowKey].break_in = formatted;
      if (log.scan_type === "time_out" && !map[rowKey].time_out)
        map[rowKey].time_out = formatted;
    });

    let records = Object.values(map);

    // Search query filters users (all user attendance) OR events (all users present in event)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      records = records.filter(
        (rec) =>
          rec.fullname.toLowerCase().includes(q) ||
          rec.event_title.toLowerCase().includes(q),
      );
    }

    return records;
  }, [rawLogs, searchQuery]);

  return (
    <View className="flex-1 px-6">
      {/* Page Header */}
      <Text className="text-3xl font-extrabold text-brand-500 mb-4 tracking-tight">
        Attendance
      </Text>

      {/* Search Input */}
      <View className="flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl mb-3 border border-slate-200/50">
        <Search size={20} color="#94A3B8" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by User or Event title..."
          placeholderTextColor="#94A3B8"
          className="flex-1 ml-3 text-base text-slate-800 font-medium p-0"
        />
      </View>

      {/* Event Filter Dropdown */}
      <View className="z-20 mb-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex-row items-center justify-between bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200/50"
        >
          <View className="flex-row items-center flex-1 pr-2">
            <Calendar size={18} color="#64748B" />
            <Text
              className="ml-2.5 text-sm font-semibold text-slate-700"
              numberOfLines={1}
            >
              {selectedEvent
                ? selectedEvent.title
                : "All Events (Latest First)"}
            </Text>
          </View>
          <ChevronDown size={18} color="#64748B" />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View className="absolute top-14 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-52 z-30 overflow-hidden">
            <ScrollView nestedScrollEnabled>
              <TouchableOpacity
                onPress={() => {
                  setSelectedEvent(null);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-3 border-b border-slate-100 ${
                  selectedEvent === null ? "bg-slate-50" : ""
                }`}
              >
                <Text className="font-bold text-slate-800">All Events</Text>
              </TouchableOpacity>

              {events.map((ev) => (
                <TouchableOpacity
                  key={ev.id}
                  onPress={() => {
                    setSelectedEvent(ev);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-4 py-3 border-b border-slate-100 ${
                    selectedEvent?.id === ev.id ? "bg-slate-50" : ""
                  }`}
                >
                  <Text
                    className="font-medium text-slate-700"
                    numberOfLines={1}
                  >
                    {ev.title}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {formatDate(ev.start_date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Attendance Table */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          className="flex-1"
        >
          <View>
            <View className="flex-row bg-slate-100 py-3 px-2 rounded-xl border border-slate-200/60 mb-2">
              <Text className="w-52 font-bold text-slate-700 text-sm">
                Fullname
              </Text>
              <Text className="w-24 font-bold text-slate-700 text-sm text-center">
                Time In
              </Text>
              <Text className="w-24 font-bold text-slate-700 text-sm text-center">
                Break Out
              </Text>
              <Text className="w-24 font-bold text-slate-700 text-sm text-center">
                Break In
              </Text>
              <Text className="w-24 font-bold text-slate-700 text-sm text-center">
                Time Out
              </Text>
            </View>

            <FlatList
              data={attendanceRows}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => <AttendanceRow item={item} />}
              contentContainerClassName="px-6"
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              ListEmptyComponent={
                <View className="py-12 items-center justify-center">
                  <UserCheck size={40} color="#CBD5E1" />
                  <Text className="text-slate-400 font-medium text-base mt-2">
                    No attendance records found.
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
