import { CustomCalendar } from "@/components/CustomCalendar";
import { EventCard } from "@/components/EventCard";
import { Event } from "@/types";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Dummy events based on Supabase tables structure
const DUMMY_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Regional Fisheries Leadership Summit 2026",
    details: "Annual conference discussing coastal resource management.",
    start_date: "2026-10-07T09:00:00Z",
    end_date: "2026-10-07T17:00:00Z",
    timeline_type: "in_out",
    qr_code: "EVT-1001",
    status: "upcoming",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    venue: {
      id: "v-1",
      address: "Grand Regal Hotel, Davao City",
      latitude: 7.0736,
      longitude: 125.611,
      created_at: new Date().toISOString(),
    },
    attachments: [
      {
        id: "att-1",
        event_id: "evt-1",
        file_name: "summit_banner.jpg",
        file_url:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "evt-2",
    title: "Aquaculture Operations & Policy Workshop",
    details: "Hands-on session with regional coordinators.",
    start_date: "2026-10-12T08:30:00Z",
    end_date: "2026-10-12T16:30:00Z",
    timeline_type: "in_breakout_breakin_out",
    qr_code: "EVT-1002",
    status: "ongoing",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    venue: {
      id: "v-2",
      address: "BFARXI Regional Office Hall, Davao City",
      latitude: 7.0812,
      longitude: 125.6201,
      created_at: new Date().toISOString(),
    },
    attachments: [
      {
        id: "att-2",
        event_id: "evt-2",
        file_name: "workshop_guide.png",
        file_url:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "evt-3",
    title: "Q3 Coastal Clean-up & Stock Assessment",
    details: "Field operations report and recognition.",
    start_date: "2026-09-28T07:00:00Z",
    end_date: "2026-09-28T12:00:00Z",
    timeline_type: "in_out",
    qr_code: "EVT-1003",
    status: "completed",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    venue: {
      id: "v-3",
      address: "Magsaysay Park Coast, Davao City",
      created_at: new Date().toISOString(),
    },
    attachments: [
      {
        id: "att-3",
        event_id: "evt-3",
        file_name: "cleanup_photo.jpg",
        file_url:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=300",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "evt-4",
    title: "Emergency Marine Sanctuary Inspection",
    details: "Cancelled due to severe weather advisory.",
    start_date: "2026-10-02T10:00:00Z",
    end_date: "2026-10-02T15:00:00Z",
    timeline_type: "in_out",
    qr_code: "EVT-1004",
    status: "cancelled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    venue: {
      id: "v-4",
      address: "Samal Island Marine Station",
      created_at: new Date().toISOString(),
    },
  },
];

const Home = () => {
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-07");
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push("/(admin)/event/create" as any);
  };

  const upcomingEvents = DUMMY_EVENTS.filter(
    (event) => event.status?.toLowerCase() === "upcoming",
  );

  return (
    <View className="flex-1 bg-white relative">
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <CustomCalendar
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
          highlightedDates={["2026-10-07", "2026-10-12"]}
        />

        <View className="mt-8 mb-4">
          <Text className="text-3xl font-bold text-slate-900">
            Upcoming Events
          </Text>
        </View>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <Text className="text-sm font-medium text-slate-400 mt-2">
            No upcoming events found.
          </Text>
        )}
      </ScrollView>

      {/* Bottom Right Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCreateEvent}
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
