import { Event } from "@/types";
import {
    Calendar,
    Clock,
    FileText,
    MapPin,
    Paperclip,
    X,
} from "lucide-react-native";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface EventWithDetails extends Event {
  details?: string;
}

interface EventDetailModalProps {
  visible: boolean;
  event: EventWithDetails | null;
  onClose: () => void;
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

export function EventDetailModal({
  visible,
  event,
  onClose,
  onImagePress,
}: EventDetailModalProps) {
  if (!event) return null;

  const startDate = new Date(event.start_date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startTime = new Date(event.start_date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endDate = event.end_date
    ? new Date(event.end_date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const endTime = event.end_date
    ? new Date(event.end_date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const statusKey = event.status?.toLowerCase() || "upcoming";
  const badgeStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.upcoming;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop overlay */}
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center p-5"
        onPress={onClose}
      >
        {/* Floating Modal Card */}
        <Pressable
          className="bg-white rounded-3xl w-full max-w-md max-h-[85%] overflow-hidden shadow-2xl border border-slate-100"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Floating Header */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-2">
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${badgeStyle.bg}`}
            >
              <View className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
              <Text
                className={`text-xs font-bold capitalize ${badgeStyle.text}`}
              >
                {statusKey}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="px-6 pb-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Title */}
            <Text className="text-2xl font-extrabold text-slate-900 mt-2 mb-4">
              {event.title}
            </Text>

            {/* Details Box */}
            {event.details && (
              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <FileText size={15} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700">
                    Details
                  </Text>
                </View>
                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <Text className="text-sm text-slate-600 leading-relaxed">
                    {event.details}
                  </Text>
                </View>
              </View>
            )}

            {/* Date & Time Box */}
            <View className="mb-4">
              <View className="flex-row items-center gap-1.5 mb-2">
                <Calendar size={15} color="#64748B" />
                <Text className="text-xs font-bold text-slate-700">
                  Date & Time
                </Text>
              </View>
              <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 gap-3">
                <View className="flex-row items-center gap-3">
                  <View className="p-2 rounded-xl bg-slate-200/60">
                    <Calendar size={16} color="#0F172A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Date
                    </Text>
                    <Text className="text-sm font-semibold text-slate-800">
                      {startDate}
                      {endDate && endDate !== startDate ? ` - ${endDate}` : ""}
                    </Text>
                  </View>
                </View>

                <View className="h-[1px] bg-slate-200/60" />

                <View className="flex-row items-center gap-3">
                  <View className="p-2 rounded-xl bg-slate-200/60">
                    <Clock size={16} color="#0F172A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Time
                    </Text>
                    <Text className="text-sm font-semibold text-slate-800">
                      {startTime} {endTime ? ` - ${endTime}` : ""}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Venue Box */}
            {event.venue?.address && (
              <View className="mb-4">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <MapPin size={15} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700">
                    Venue
                  </Text>
                </View>
                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row items-center gap-3">
                  <View className="p-2 rounded-xl bg-slate-200/60">
                    <MapPin size={16} color="#0F172A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Location
                    </Text>
                    <Text className="text-sm font-semibold text-slate-800">
                      {event.venue.address}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Attachments Box */}
            {event.attachments && event.attachments.length > 0 && (
              <View>
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Paperclip size={15} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700">
                    Attachments ({event.attachments.length})
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2.5">
                  {event.attachments.map((att) => (
                    <TouchableOpacity
                      key={att.id || att.file_url}
                      activeOpacity={0.85}
                      onPress={() => onImagePress?.(att.file_url)}
                      className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm"
                    >
                      <Image
                        source={{ uri: att.file_url }}
                        className="w-20 h-20"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
