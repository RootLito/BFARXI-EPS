import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Calendar,
    Clock,
    FileText,
    Layers,
    Map,
    MapPin,
    Paperclip,
    Trash2,
    X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
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

import LocationPickerModal from "@/components/LocationPickerModal";
import { supabase } from "@/lib/supabase";
import {
    deleteEvent,
    getEventById,
    updateEvent,
} from "@/services/eventService";

// Helper to format ISO String to YYYY-MM-DD
const formatDateStr = (isoString?: string): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

// Helper to format ISO String to 12-hour AM/PM Time
const formatTimeStr = (isoString?: string): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  return `${paddedHours}:${paddedMinutes} ${ampm}`;
};

// Helper to parse YYYY-MM-DD and "hh:mm AM/PM" back into ISO string
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

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endDate, setEndDate] = useState("");
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
  const [existingAttachments, setExistingAttachments] = useState<
    { file_name: string; file_url: string }[]
  >([]);

  // QR Code
  const [qrCode, setQrCode] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setFetching(true);
      const data = await getEventById(id as string);
      if (data) {
        setTitle(data.title || "");
        setDetails(data.details || "");
        setStartDate(formatDateStr(data.start_date));
        setStartTime(formatTimeStr(data.start_date) || "09:00 AM");
        setEndDate(formatDateStr(data.end_date));
        setEndTime(formatTimeStr(data.end_date) || "05:00 PM");
        setTimelineType(data.timeline_type || "in_out");

        if (data.venue) {
          setVenueAddress(data.venue.address || "");
          setLatitude(data.venue.latitude ?? null);
          setLongitude(data.venue.longitude ?? null);
        }

        if (data.attachments && data.attachments.length > 0) {
          setExistingAttachments(data.attachments);
          setNoticeImage(data.attachments[0].file_url);
        }

        setQrCode(
          data.qr_code ||
            `EVT-PREVIEW-${data.title?.replace(/\s+/g, "").toUpperCase()}`,
        );
      }
    } catch (error: any) {
      console.error("Error loading event:", error);
      Alert.alert("Error", "Failed to load event details.");
    } finally {
      setFetching(false);
    }
  };

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

  const handleUpdateEvent = async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter an event title.");
      return;
    }

    if (!venueAddress.trim()) {
      Alert.alert("Required Field", "Please enter the venue address.");
      return;
    }

    setSaving(true);

    try {
      let attachments: { file_name: string; file_url: string }[] = [];

      // 1. If noticeImage was removed/null, attachments remains empty []
      if (noticeImage) {
        if (noticeImage.startsWith("file:") || noticeImage.startsWith("ph:")) {
          // 2. If it's a newly selected local file, upload it
          const uploadedFile = await uploadNoticeAttachment(noticeImage);
          attachments = [
            {
              file_name: uploadedFile.file_name,
              file_url: uploadedFile.file_url,
            },
          ];
        } else {
          // 3. If it's the existing remote image URL that wasn't removed, keep existing
          attachments = existingAttachments;
        }
      }

      const startIso = parseDateTimeToISO(startDate, startTime);
      const endIso = parseDateTimeToISO(endDate, endTime);

      await updateEvent({
        id: id as string,
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

      setSaving(false);
      Alert.alert("Success", "Event updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      setSaving(false);
      console.error("Failed to update event:", error);
      Alert.alert("Error", error?.message || "Failed to update event.");
    }
  };

  const handleDeleteEvent = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteEvent(id as string);
              Alert.alert("Deleted", "Event deleted successfully.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              console.error("Failed to delete event:", error);
              Alert.alert("Error", error?.message || "Failed to delete event.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (fetching) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title with Delete Action */}
        <View className="flex-row items-center justify-between my-4">
          <Text className="text-3xl font-extrabold text-brand-500">
            Edit Event
          </Text>
          <TouchableOpacity
            onPress={handleDeleteEvent}
            disabled={deleting}
            className="w-10 h-10 bg-red-50 rounded-xl justify-center items-center border border-red-200"
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Trash2 size={20} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Details Section */}
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

        {/* Timeline Type Section */}
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

        {/* Schedule & Timing Section */}
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

        {/* Venue Information Section */}
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

        {/* Notice / Memo Attachment Section */}
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

        {/* Assigned QR Code Card */}
        {/* <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Event QR Code
        </Text>
        <EventQRCodeCard
          qrCode={
            qrCode ||
            (title
              ? `EVT-PREVIEW-${title.replace(/\s+/g, "").toUpperCase()}`
              : "EVT-AUTO-GENERATED")
          }
          title="Assigned Event QR Code"
          size={140}
        /> */}

        {/* Action Buttons */}
        <View className="flex-col gap-2 mt-6">
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleUpdateEvent}
            className="bg-slate-900 py-4 rounded-2xl flex-row justify-center items-center shadow-sm"
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base tracking-wide">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="bg-red-400 py-4 rounded-2xl flex-row justify-center items-center shadow-sm"
          >
            <Text className="text-white font-bold text-base tracking-wide">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
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
