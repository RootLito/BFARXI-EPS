import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Layers,
    Map,
    MapPin,
    Paperclip,
    X,
} from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { supabase } from "@/lib/supabase";
import { createEvent } from "@/services/eventService";
import LocationPickerModal from "../../../components/LocationPickerModal";

// Helper to safely parse "YYYY-MM-DD" and "hh:mm AM/PM" into an ISO string
const parseDateTimeToISO = (dateStr: string, timeStr: string): string => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const d = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(d.getTime()))
      throw new Error(`Invalid date/time format: ${dateStr} ${timeStr}`);
    return d.toISOString();
  }

  let [, hoursStr, minutesStr, period] = match;
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (period.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  } else if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  const isoDate = new Date(`${dateStr}T${paddedHours}:${paddedMinutes}:00`);
  if (isNaN(isoDate.getTime())) {
    throw new Error(`Invalid date values: ${dateStr} ${timeStr}`);
  }

  return isoDate.toISOString();
};

export default function CreateEventScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("2026-10-15");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endDate, setEndDate] = useState("2026-10-15");
  const [endTime, setEndTime] = useState("05:00 PM");

  const [timelineType, setTimelineType] = useState<
    "in_out" | "in_breakout_breakin_out"
  >("in_out");

  // Venue & Coordinates
  const [venueAddress, setVenueAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Notice / Memo Attachment
  const [noticeImage, setNoticeImage] = useState<string | null>(null);

  const handlePickNoticeImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to allow access to your photos to attach a notice or memo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setNoticeImage(result.assets[0].uri);
    }
  };

  // Helper to upload notice image using SDK 54 File API
  const uploadNoticeAttachment = async (uri: string) => {
    const fileExt = uri.split(".").pop()?.toLowerCase() || "jpeg";
    const fileName = `notice_${Date.now()}.${fileExt}`;
    const filePath = `notices/${fileName}`;

    const file = new File(uri);
    const base64 = await file.base64();

    const { error: uploadError } = await supabase.storage
      .from("event-attachments")
      .upload(filePath, decode(base64), {
        contentType: `image/${fileExt === "png" ? "png" : "jpeg"}`,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("event-attachments")
      .getPublicUrl(filePath);

    return {
      file_name: fileName,
      file_url: publicUrlData.publicUrl,
    };
  };

  const handleSaveEvent = async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter an event title.");
      return;
    }

    if (!venueAddress.trim()) {
      Alert.alert("Required Field", "Please enter the venue address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload notice attachment if selected
      let attachments: { file_name: string; file_url: string }[] = [];
      if (noticeImage) {
        const uploadedFile = await uploadNoticeAttachment(noticeImage);
        attachments.push({
          file_name: uploadedFile.file_name,
          file_url: uploadedFile.file_url,
        });
      }

      // 2. Parse ISO timestamps safely
      const startIso = parseDateTimeToISO(startDate, startTime);
      const endIso = parseDateTimeToISO(endDate, endTime);

      // 3. Call eventService.createEvent with null -> undefined conversion
      await createEvent({
        title,
        details,
        start_date: startIso,
        end_date: endIso,
        timeline_type: timelineType,
        venue: {
          address: venueAddress,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
        },
        attachments,
      });

      setLoading(false);
      Alert.alert("Success", "Event created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      setLoading(false);
      console.error("Failed to create event:", error);
      Alert.alert("Error", error?.message || "Failed to create event.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Create Event</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Details */}
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Basic Details
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-slate-700 mb-1.5">
            Event Title *
          </Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
            <FileText size={18} color="#64748B" />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Regional Leadership Summit"
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2.5 text-slate-900 font-medium text-base p-0"
            />
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-semibold text-slate-700 mb-1.5">
            Details / Description
          </Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Write a brief overview of the event..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 font-medium text-base min-h-[90px]"
          />
        </View>

        {/* Timeline Type */}
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Timeline Type
        </Text>
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => setTimelineType("in_out")}
            className={`flex-1 p-3.5 rounded-xl border flex-row items-center justify-center gap-2 ${
              timelineType === "in_out"
                ? "bg-slate-900 border-slate-900"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <Layers
              size={18}
              color={timelineType === "in_out" ? "#FFFFFF" : "#64748B"}
            />
            <Text
              className={`font-semibold text-sm ${
                timelineType === "in_out" ? "text-white" : "text-slate-700"
              }`}
            >
              Standard (In/Out)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTimelineType("in_breakout_breakin_out")}
            className={`flex-1 p-3.5 rounded-xl border flex-row items-center justify-center gap-2 ${
              timelineType === "in_breakout_breakin_out"
                ? "bg-slate-900 border-slate-900"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <Layers
              size={18}
              color={
                timelineType === "in_breakout_breakin_out"
                  ? "#FFFFFF"
                  : "#64748B"
              }
            />
            <Text
              className={`font-semibold text-sm ${
                timelineType === "in_breakout_breakin_out"
                  ? "text-white"
                  : "text-slate-700"
              }`}
            >
              With Breakouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Schedule & Timing */}
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Schedule & Timing
        </Text>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-1.5">
              Start Date
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
              <Calendar size={18} color="#64748B" />
              <TextInput
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-slate-900 font-medium text-sm p-0"
              />
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-1.5">
              Start Time
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
              <Clock size={18} color="#64748B" />
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00 AM"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-slate-900 font-medium text-sm p-0"
              />
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-1.5">
              End Date
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
              <Calendar size={18} color="#64748B" />
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-slate-900 font-medium text-sm p-0"
              />
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-1.5">
              End Time
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
              <Clock size={18} color="#64748B" />
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="05:00 PM"
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-slate-900 font-medium text-sm p-0"
              />
            </View>
          </View>
        </View>

        {/* Venue Information */}
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Venue Information
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-700 mb-1.5">
            Venue Address *
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
              <MapPin size={18} color="#64748B" />
              <TextInput
                value={venueAddress}
                onChangeText={setVenueAddress}
                placeholder="Enter address or select on map..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2.5 text-slate-900 font-medium text-base p-0"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowLocationPicker(true)}
              className="w-12 h-12 bg-slate-900 rounded-xl justify-center items-center"
            >
              <Map size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notice / Memo Image Attachment */}
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Notice / Memo Attachment
        </Text>
        {noticeImage ? (
          <View className="relative mb-8 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
            <Image
              source={{ uri: noticeImage }}
              className="w-full h-48 rounded-xl"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => setNoticeImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 justify-center items-center"
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePickNoticeImage}
            className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 justify-center items-center mb-8 flex-row gap-3"
          >
            <View className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center">
              <Paperclip size={20} color="#64748B" />
            </View>
            <View>
              <Text className="text-sm font-semibold text-slate-700">
                Attach Official Notice / Memo
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                Upload image scan or document screenshot
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Create Event Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleSaveEvent}
          className="bg-slate-900 py-4 rounded-2xl flex-row justify-center items-center shadow-sm"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base tracking-wide">
              Create Event
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Location Drawer Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={({ address, lat, lng }) => {
          setVenueAddress(address);
          setLatitude(lat);
          setLongitude(lng);
        }}
        initialLat={latitude || undefined}
        initialLng={longitude || undefined}
      />
    </View>
  );
}
