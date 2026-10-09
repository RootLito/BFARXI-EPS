import { Event } from "@/types/event";
import * as DocumentPicker from "expo-document-picker";
import { ChevronDown, UploadCloud, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface UploadCertificateModalProps {
  visible: boolean;
  events: Event[];
  onClose: () => void;
  onSave: (
    eventId: string,
    file: DocumentPicker.DocumentPickerAsset,
  ) => Promise<void>;
}

export const UploadCertificateModal: React.FC<UploadCertificateModalProps> = ({
  visible,
  events,
  onClose,
  onSave,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFields = () => {
    setSelectedEvent(null);
    setSelectedFile(null);
    setIsDropdownOpen(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch {
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedEvent) {
      Alert.alert("Validation Error", "Please select an event.");
      return;
    }
    if (!selectedFile) {
      Alert.alert("Validation Error", "Please pick a PDF file.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(selectedEvent.id, selectedFile);
      handleClose();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to upload certificate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6 min-h-[480px]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-slate-800">
              Upload Certificate
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Select Event */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Event
          </Text>
          <View className="z-20 mb-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex-row items-center justify-between bg-slate-100 px-4 py-3.5 rounded-2xl border border-slate-200/50"
            >
              <Text
                className={`text-sm font-medium ${
                  selectedEvent ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {selectedEvent ? selectedEvent.title : "Choose an Event..."}
              </Text>
              <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View className="absolute top-14 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-48 z-30 overflow-hidden">
                <ScrollView nestedScrollEnabled>
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
                      <Text className="font-medium text-slate-700">
                        {ev.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Select File */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Certificate Document (PDF)
          </Text>
          <TouchableOpacity
            onPress={handlePickDocument}
            className="border-2 border-dashed border-slate-300 rounded-2xl p-6 items-center justify-center bg-slate-50 mb-6"
          >
            <UploadCloud size={32} color="#0284c7" />
            <Text className="mt-2 text-sm font-semibold text-slate-700">
              {selectedFile ? selectedFile.name : "Tap to select PDF file"}
            </Text>
            <Text className="text-xs text-slate-400 mt-1">
              {selectedFile && selectedFile.size
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                : "PDF format up to 10MB"}
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleSubmit}
            className={`py-4 rounded-2xl items-center justify-center ${
              isSubmitting ? "bg-brand-300" : "bg-brand-500"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-base">
                Save Certificate
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
