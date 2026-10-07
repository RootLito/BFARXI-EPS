import { getEventById, updateEvent } from "@/services/eventService";
import { Event, TimelineType } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TIMELINE_OPTIONS: { label: string; value: TimelineType }[] = [
  { label: "In / Out", value: "in_out" },
  { label: "In / Breakout / Breakin / Out", value: "in_breakout_breakin_out" },
];

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [eventData, setEventData] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timelineType, setTimelineType] = useState<TimelineType>("in_out");
  const [venueAddress, setVenueAddress] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadEvent() {
      try {
        setLoading(true);
        const data = await getEventById(id as string);
        if (data) {
          setEventData(data);
          setTitle(data.title || "");
          setDetails(data.details || "");
          setStartDate(data.start_date ? data.start_date.split("T")[0] : "");
          setEndDate(data.end_date ? data.end_date.split("T")[0] : "");
          setTimelineType(data.timeline_type || "in_out");
          setVenueAddress(data.venue?.address || "");
        } else {
          Alert.alert("Error", "Event not found.");
          router.back();
        }
      } catch (error: any) {
        console.error("Error loading event:", error);
        Alert.alert("Error", "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter an event title.");
      return;
    }

    if (!startDate) {
      Alert.alert("Validation Error", "Please select a start date.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateEvent({
        id: id as string,
        title,
        details,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate
          ? new Date(endDate).toISOString()
          : new Date(startDate).toISOString(),
        timeline_type: timelineType,
        venue_id: eventData?.venue_id || eventData?.venue?.id,
        venue: {
          address: venueAddress,
        },
      });

      Alert.alert("Success", "Event updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error updating event:", error);
      Alert.alert("Error", error?.message || "Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-12 pb-4 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full"
        >
          <ArrowLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900 ml-2">
          Edit Event
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-slate-700 mb-2">
            Event Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Regional Fisheries Summit"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium"
          />
        </View>

        {/* Details */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-slate-700 mb-2">
            Details
          </Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Event description..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 font-medium min-h-[100px]"
          />
        </View>

        {/* Start & End Dates */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Start Date *
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
              <Calendar size={18} color="#64748B" />
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                className="flex-1 ml-2 text-slate-900 font-medium p-0"
              />
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              End Date
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
              <Calendar size={18} color="#64748B" />
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                className="flex-1 ml-2 text-slate-900 font-medium p-0"
              />
            </View>
          </View>
        </View>

        {/* Timeline Type */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-slate-700 mb-2">
            Timeline Type
          </Text>
          <View className="gap-2">
            {TIMELINE_OPTIONS.map((opt) => {
              const isSelected = timelineType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setTimelineType(opt.value)}
                  className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                    isSelected
                      ? "bg-slate-900 border-slate-900"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      isSelected ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Venue Address */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-slate-700 mb-2">
            Venue Address
          </Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
            <MapPin size={18} color="#64748B" />
            <TextInput
              value={venueAddress}
              onChangeText={setVenueAddress}
              placeholder="e.g. Grand Regal Hotel, Davao City"
              className="flex-1 ml-2 text-slate-900 font-medium p-0"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={saving}
          className="bg-slate-900 rounded-2xl py-4 justify-center items-center shadow-sm"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
