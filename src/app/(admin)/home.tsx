import { CustomCalendar } from "@/components/CustomCalendar";
import { EventCard } from "@/components/EventCard";
import { EventDetailModal } from "@/components/EventDetailModal";
import { getCalendarEvents } from "@/services/calendarService";
import { Event } from "@/types";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const Home = () => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  // Modal State strictly for lower EventCards (if needed)
  const [selectedCardEvent, setSelectedCardEvent] = useState<Event | null>(
    null,
  );
  const [cardModalVisible, setCardModalVisible] = useState<boolean>(false);

  const fetchEvents = useCallback(async () => {
    try {
      const { rawEvents, highlightedDates: dates } = await getCalendarEvents();
      setEvents(rawEvents);
      setHighlightedDates(dates);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleOpenCardModal = (event: Event) => {
    setSelectedCardEvent(event);
    setCardModalVisible(true);
  };

  const upcomingEvents = events.filter(
    (event) => event.status?.toLowerCase() === "upcoming",
  );

  return (
    <View className="flex-1 bg-white relative">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pb-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0F172A"
            />
          }
        >
          {/* CustomCalendar self-manages both EventPickerModal and EventDetailModal */}
          <CustomCalendar
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            highlightedDates={highlightedDates}
            events={events}
          />

          <View className="mt-8 mb-4">
            <Text className="text-3xl font-bold text-brand-500">
              Upcoming Events
            </Text>
          </View>

          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                activeOpacity={0.85}
                onPress={() => handleOpenCardModal(event)}
              >
                <EventCard event={event} />
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-sm font-medium text-slate-400 mt-2">
              No upcoming events found.
            </Text>
          )}
        </ScrollView>
      )}

      {/* Modal only for tapping the bottom Upcoming EventCards */}
      <EventDetailModal
        visible={cardModalVisible}
        event={selectedCardEvent}
        onClose={() => setCardModalVisible(false)}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(admin)/event/create" as any)}
        className="absolute bottom-8 right-6 w-20 h-20 rounded-full bg-brand-500 justify-center items-center shadow-lg border border-white/20 z-50"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        }}
      >
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default Home;
