import { Check, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { MapPressEvent, Marker, UrlTile } from "react-native-maps";

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (data: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

const { height } = Dimensions.get("window");

export default function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
  initialLat = 7.0736, // Davao City
  initialLng = 125.611,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

  // Free OpenStreetMap search (Nominatim)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}`,
        {
          headers: {
            "User-Agent": "bfar-eps-app/1.0",
          },
        },
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const topResult = data[0];
        const newLat = parseFloat(topResult.lat);
        const newLng = parseFloat(topResult.lon);

        setMarkerCoordinate({ latitude: newLat, longitude: newLng });
        setRegion({
          latitude: newLat,
          longitude: newLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    setMarkerCoordinate(e.nativeEvent.coordinate);
  };

  const handleConfirm = () => {
    onSelectLocation({
      address:
        searchQuery ||
        `${markerCoordinate.latitude.toFixed(5)}, ${markerCoordinate.longitude.toFixed(5)}`,
      lat: markerCoordinate.latitude,
      lng: markerCoordinate.longitude,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View
          style={{ height: height * 0.85 }}
          className="bg-white rounded-t-3xl overflow-hidden flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
            <Text className="text-lg font-bold text-slate-900">
              Pin Venue Location
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Field */}
          <View className="px-4 py-3 bg-white border-b border-slate-100 z-10 flex-row gap-2 items-center">
            <View className="flex-1 flex-row items-center bg-slate-100 rounded-xl px-3 py-2">
              <Search size={18} color="#64748B" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                placeholder="Search building, street, or landmark..."
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                className="flex-1 ml-2 text-slate-900 text-sm p-0"
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#64748B" />
              )}
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              className="bg-slate-900 px-3.5 py-2 rounded-xl"
            >
              <Text className="text-white font-semibold text-xs">Search</Text>
            </TouchableOpacity>
          </View>

          {/* Native Map View without Google dependencies */}
          <View className="flex-1 relative bg-slate-100">
            <MapView
              style={{ width: "100%", height: "100%" }}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
              mapType="none"
            >
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
              <Marker
                coordinate={markerCoordinate}
                draggable
                onDragEnd={(e) => setMarkerCoordinate(e.nativeEvent.coordinate)}
                title="Venue Location"
              />
            </MapView>

            <View className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded-xl border border-slate-200">
              <Text className="text-xs text-slate-500 font-medium">
                Selected Coordinates
              </Text>
              <Text className="text-xs font-bold text-slate-800">
                Lat: {markerCoordinate.latitude.toFixed(6)} | Lng:{" "}
                {markerCoordinate.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <View className="p-4 bg-white border-t border-slate-100">
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-slate-900 py-3.5 rounded-xl flex-row justify-center items-center gap-2"
            >
              <Check size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-base">
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
