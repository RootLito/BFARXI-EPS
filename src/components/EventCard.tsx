import { Event } from "@/types";
import { Calendar, Edit3, MapPin, QrCode, Trash2 } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onImagePress?: (url: string) => void;
  onQrPress?: (event: Event) => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    upcoming: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    ongoing: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  };

export function EventCard({
  event,
  onPress,
  onEdit,
  onDelete,
  onImagePress,
  onQrPress,
}: EventCardProps) {
  const startDate = new Date(event.start_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusKey = event.status?.toLowerCase() || "upcoming";
  const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.upcoming;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(event)}
      className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200/80 shadow-sm"
    >
      {/* 1. Top Bar: Action Buttons on Left, Status Badge on Right End */}
      <View className="flex-row justify-between items-center mb-3">
        {/* Small Status Badge (Right End) */}
        <View
          className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeStyle.bg}`}
        >
          <View className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
          <Text className={`text-xs font-bold capitalize ${badgeStyle.text}`}>
            {statusKey}
          </Text>
        </View>
        {/* Buttons (Left End) */}
        <View className="flex-row items-center gap-2">
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(event)}
              className="p-1.5 rounded-lg bg-slate-200/60"
            >
              <Edit3 size={15} color="#475569" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(event)}
              className="p-1.5 rounded-lg bg-red-100"
            >
              <Trash2 size={15} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. Event Title */}
      <Text className="text-xl font-extrabold text-slate-900 mb-2">
        {event.title}
      </Text>

      {/* 3. Venue & Date/Time */}
      <View className="gap-1.5 mb-3">
        {event.venue?.address && (
          <View className="flex-row items-center gap-2">
            <MapPin size={15} color="#64748B" />
            <Text
              className="text-xs text-slate-600 font-medium flex-1"
              numberOfLines={1}
            >
              {event.venue.address}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          <Calendar size={15} color="#64748B" />
          <Text className="text-xs text-slate-600 font-medium">
            {startDate}
          </Text>
        </View>
      </View>

      {/* 4. Attachments & QR Button Row (Right Aligned) */}
      <View className="flex-row justify-end items-center gap-1.5 pt-1">
        {/* Attachment Thumbnail Images */}
        {event.attachments?.map((att) => (
          <TouchableOpacity
            key={att.id || att.file_url}
            activeOpacity={0.8}
            onPress={() => onImagePress?.(att.file_url)}
            className="rounded-lg overflow-hidden border border-slate-200 bg-white"
          >
            <Image
              source={{ uri: att.file_url }}
              className="w-12 h-12 rounded-lg"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}

        {/* QR Button at the Right End */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onQrPress?.(event)}
          className="w-12 h-12 rounded-lg bg-slate-900 justify-center items-center shadow-sm"
        >
          <QrCode size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
