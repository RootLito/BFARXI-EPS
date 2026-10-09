import { Event } from "@/types";
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    X,
} from "lucide-react-native";
import React from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface EventPickerModalProps {
  visible: boolean;
  dateString: string;
  events: Event[];
  onClose: () => void;
  onSelectEvent: (event: Event) => void;
}

const formatDateTitle = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatEventTime = (isoString?: string): string => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  return `${paddedHours}:${paddedMinutes} ${ampm}`;
};

export const EventPickerModal: React.FC<EventPickerModalProps> = ({
  visible,
  dateString,
  events,
  onClose,
  onSelectEvent,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-3xl p-6 w-full max-h-[75%] border border-slate-100 shadow-2xl">
              {/* Header */}
              <View className="flex-row justify-between items-center pb-4 mb-4">
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <CalendarIcon size={20} color="#0F172A" />
                  <Text
                    className="text-lg font-bold text-slate-900 flex-1"
                    numberOfLines={1}
                  >
                    Select Event for {formatDateTitle(dateString)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 rounded-full justify-center items-center"
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Event Cards List */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {events.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => onSelectEvent(item)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3"
                  >
                    <Text className="text-lg font-bold text-slate-900 mb-1">
                      {item.title}
                    </Text>
                    {item.details ? (
                      <Text
                        numberOfLines={2}
                        className="text-sm text-slate-600 mb-3"
                      >
                        {item.details}
                      </Text>
                    ) : null}
                    <View className="flex-row flex-wrap items-center gap-4 border-t border-slate-200 pt-2.5">
                      <View className="flex-row items-center gap-1.5">
                        <Clock size={15} color="#64748B" />
                        <Text className="text-xs font-semibold text-slate-600">
                          {formatEventTime(item.start_date)}
                        </Text>
                      </View>
                      {item.venue?.address ? (
                        <View className="flex-row items-center gap-1.5 flex-1">
                          <MapPin size={15} color="#64748B" />
                          <Text
                            numberOfLines={1}
                            className="text-xs font-semibold text-slate-600 flex-1"
                          >
                            {item.venue.address}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
