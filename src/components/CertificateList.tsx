import { Certificate } from "@/types/certificate";
import { Eye, FileText, Trash2 } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CertificateListProps {
  certificates: Certificate[];
  isLoading: boolean;
  onViewPdf: (url: string) => void;
  onDelete: (item: Certificate) => void;
}

export const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  isLoading,
  onViewPdf,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <FlatList
      data={certificates}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View className="flex-row items-center justify-between bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-200/60 shadow-sm">
          <View className="flex-row items-center flex-1 pr-3">
            <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center mr-3">
              <FileText size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text
                className="font-semibold text-slate-800 text-base"
                numberOfLines={1}
              >
                {item.file_name}
              </Text>
              <Text
                className="text-xs text-slate-500 font-medium mt-0.5"
                numberOfLines={1}
              >
                {item.event?.title || "No Linked Event"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => onViewPdf(item.file_url)}
              className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 mr-2"
            >
              <Eye size={18} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item)}
              className="p-2.5 rounded-xl bg-red-50 border border-red-100"
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text className="text-center text-slate-400 mt-10 text-base font-medium">
          No certificates of appearance found.
        </Text>
      }
    />
  );
};
