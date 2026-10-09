import { Calendar, ChevronDown, Plus, Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { CertificateList } from "@/components/CertificateList";
import { UploadCertificateModal } from "@/components/UploadCertificateModal";
import { certificateService } from "@/services/certificateService";
import { getEvents } from "@/services/eventService";
import { openPdfViewer } from "@/services/pdfViewer"; // 👈 1. IMPORT HELPER
import { Certificate } from "@/types/certificate";
import { Event } from "@/types/event";

const CertificateScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [selectedEvent]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData || []);
      await loadCertificates();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const data = await certificateService.getCertificates(selectedEvent?.id);
      setCertificates(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load certificates");
    }
  };

  const handleSaveCertificate = async (eventId: string, fileAsset: any) => {
    await certificateService.uploadAndCreateCertificate(eventId, fileAsset);
    Alert.alert("Success", "Certificate saved!");
    loadCertificates();
  };

  const handleDelete = (item: Certificate) => {
    Alert.alert("Delete Certificate", `Delete "${item.file_name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await certificateService.deleteCertificate(item);
            loadCertificates();
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  // 👈 2. DIRECT TRIGGER (No extra component needed)
  const handleViewPdf = (url: string) => {
    openPdfViewer(url);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filteredCertificates = certificates.filter((cert) => {
    const query = searchQuery.toLowerCase();
    const eventTitle = cert.event?.title.toLowerCase() || "";
    const fileName = cert.file_name.toLowerCase();
    return eventTitle.includes(query) || fileName.includes(query);
  });

  return (
    <View className="flex-1 px-6">
      {/* Title */}
      <Text className="text-3xl font-extrabold text-brand-500 mb-4 tracking-tight">
        Certificate of Appearance
      </Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl mb-3 border border-slate-200/50">
        <Search size={20} color="#94A3B8" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by event title or PDF name..."
          placeholderTextColor="#94A3B8"
          className="flex-1 ml-3 text-base text-slate-800 font-medium p-0"
        />
      </View>

      {/* Event Dropdown Filter */}
      <View className="z-20 mb-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex-row items-center justify-between bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200/50"
        >
          <View className="flex-row items-center flex-1 pr-2">
            <Calendar size={18} color="#64748B" />
            <Text
              className="ml-2.5 text-sm font-semibold text-slate-700"
              numberOfLines={1}
            >
              {selectedEvent
                ? selectedEvent.title
                : "All Events (Latest First)"}
            </Text>
          </View>
          <ChevronDown size={18} color="#64748B" />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View className="absolute top-14 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-52 z-30 overflow-hidden">
            <ScrollView nestedScrollEnabled>
              <TouchableOpacity
                onPress={() => {
                  setSelectedEvent(null);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-3 border-b border-slate-100 ${
                  selectedEvent === null ? "bg-slate-50" : ""
                }`}
              >
                <Text className="font-bold text-slate-800">All Events</Text>
              </TouchableOpacity>

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
                  <Text
                    className="font-medium text-slate-700"
                    numberOfLines={1}
                  >
                    {ev.title}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {formatDate(ev.start_date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* List Component */}
      <CertificateList
        certificates={filteredCertificates}
        isLoading={isLoading}
        onViewPdf={handleViewPdf}
        onDelete={handleDelete}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsModalOpen(true)}
        className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-brand-500 justify-center items-center shadow-lg border border-white/20 z-50"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal Component */}
      <UploadCertificateModal
        visible={isModalOpen}
        events={events}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCertificate}
      />
    </View>
  );
};

export default CertificateScreen;
