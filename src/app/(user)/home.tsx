import {
    Calendar as CalendarIcon,
    Clock,
    Grid,
    List,
    Plus,
    X,
} from "lucide-react-native";
import { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  statusBg: string;
  dotColor: string;
  description?: string;
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "UI Design for Azimo",
    date: "2026-10-06",
    time: "08:00 AM - 10:00 AM",
    status: "Done",
    statusBg: "#FF7675",
    dotColor: "#FF7675",
    description: "Design mobile app screens and export assets.",
  },
  {
    id: "2",
    title: "CG iOS App Promo",
    date: "2026-10-06",
    time: "10:00 AM - 01:00 PM",
    status: "In Progress",
    statusBg: "#6C5CE7",
    dotColor: "#6C5CE7",
    description: "Review promotional banner layouts.",
  },
  {
    id: "3",
    title: "Meeting with CEO",
    date: "2026-10-12",
    time: "02:00 PM - 03:00 PM",
    status: "Pending",
    statusBg: "#74B9FF",
    dotColor: "#74B9FF",
    description: "Quarterly progress review meeting.",
  },
];

export default function Home() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  // Handle Date Press
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const event = MOCK_EVENTS.find((e) => e.date === day.dateString);
    if (event) {
      setSelectedEvent(event);
      setIsDetailModalOpen(true);
    }
  };

  // Handle Event Card Press
  const handleEventPress = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#3D3452]"
      edges={["top", "left", "right"]}
    >
      {/* 1. TOP HEADER: Avatar, Month/Year Title, Action Buttons (from Sketch) */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">October 2026</Text>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
            <Grid color="#FFFFFF" size={18} />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 rounded-full bg-white/10 items-center justify-center">
            <List color="#FFFFFF" size={18} />
          </TouchableOpacity>
          {/* Top Right Profile Avatar */}
          <View className="w-9 h-9 rounded-full overflow-hidden border border-white/30 ml-1">
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              className="w-full h-full"
            />
          </View>
        </View>
      </View>

      {/* 2. CALENDAR GRID VIEW */}
      <View className="bg-[#3D3452] pb-2">
        <Calendar
          current={selectedDate}
          onDayPress={handleDayPress}
          renderHeader={() => null}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "transparent",
              customStyles: {
                container: {
                  borderWidth: 1.5,
                  borderColor: "#FFFFFF",
                  borderRadius: 20,
                },
                text: {
                  color: "#FFFFFF",
                  fontWeight: "bold",
                },
              },
            },
            "2026-10-06": { marked: true, dotColor: "#FF7675" },
            "2026-10-12": { marked: true, dotColor: "#74B9FF" },
          }}
          markingType="custom"
          enableSwipeMonths
          theme={{
            calendarBackground: "#3D3452",
            textSectionTitleColor: "#A8A3B5",
            dayTextColor: "#FFFFFF",
            todayTextColor: "#FF7675",
            textMonthFontWeight: "bold",
            textMonthFontSize: 16,
            arrowColor: "#FFFFFF",
          }}
        />
      </View>

      {/* 3. BOTTOM CONTAINER WITH TIMELINE CARDS */}
      <View className="flex-1 bg-white px-5 pt-5 rounded-t-[32px]">
        {/* "Upcoming Events" Section Header + "View all ->" */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-900">
            Upcoming Events
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-xs font-semibold text-gray-500">
              View all {"->"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Schedule List */}
        <FlatList
          data={MOCK_EVENTS}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleEventPress(item)}
              className="flex-row items-center mb-4"
            >
              {/* Left Timeline Dot + Line */}
              <View className="items-center mr-3 w-4">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.dotColor }}
                />
                <View className="w-0.5 h-10 bg-gray-200 my-1" />
              </View>

              {/* Event Card */}
              <View className="flex-1 bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100 shadow-sm">
                <View>
                  <Text className="text-base font-semibold text-gray-800">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {item.time}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: item.statusBg }}
                >
                  <Text className="text-xs font-bold text-white">
                    {item.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 4. FLOATING ACTION BUTTON (+) (from Sketch bottom right) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsNewEventModalOpen(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#FF7675] rounded-2xl items-center justify-center shadow-lg"
      >
        <Plus color="#FFFFFF" size={28} />
      </TouchableOpacity>

      {/* 5. MODAL: EVENT DETAILS (from Sketch Arrow 1) */}
      <Modal
        visible={isDetailModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDetailModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 min-h-[280px]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">
                Full Event Details
              </Text>
              <TouchableOpacity
                onPress={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X color="#6B7280" size={18} />
              </TouchableOpacity>
            </View>

            {selectedEvent ? (
              <View className="space-y-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {selectedEvent.title}
                </Text>
                <View className="flex-row items-center space-x-2">
                  <CalendarIcon color="#9CA3AF" size={16} />
                  <Text className="text-sm text-gray-500">
                    {selectedEvent.date}
                  </Text>
                </View>
                <View className="flex-row items-center space-x-2">
                  <Clock color="#9CA3AF" size={16} />
                  <Text className="text-sm text-gray-500">
                    {selectedEvent.time}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mt-2">
                  {selectedEvent.description || "No description provided."}
                </Text>
              </View>
            ) : (
              <Text className="text-gray-400">No event details found.</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. MODAL: NEW EVENT (from Sketch Arrow 2 on '+' button) */}
      <Modal
        visible={isNewEventModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNewEventModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 min-h-[360px]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">New Event</Text>
              <TouchableOpacity
                onPress={() => setIsNewEventModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X color="#6B7280" size={18} />
              </TouchableOpacity>
            </View>

            {/* Dummy Input Placeholders */}
            <View className="space-y-4">
              <View className="bg-gray-100 p-3.5 rounded-xl">
                <Text className="text-gray-400">
                  Title input placeholder...
                </Text>
              </View>
              <View className="bg-gray-100 p-3.5 rounded-xl">
                <Text className="text-gray-400">Select Date & Time...</Text>
              </View>
              <View className="bg-gray-100 p-3.5 rounded-xl min-h-[80px]">
                <Text className="text-gray-400">Description...</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsNewEventModalOpen(false)}
                className="bg-[#FF7675] p-4 rounded-xl items-center mt-2"
              >
                <Text className="text-white font-bold text-base">
                  Save Event
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
