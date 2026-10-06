import { RegisterModal } from "@/components/RegisterModal";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Info } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();

  // 1. Permission loading state
  if (!permission) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  // 2. Permission denied state
  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-center text-gray-700 mb-4 text-base">
          Camera permission is required to scan your ID barcode.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-sky-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanning) return;
    setScanning(true);

    try {
      const existingUser = await authService.getUserByCode(data);

      if (existingUser) {
        await login(existingUser);
      } else {
        setScannedCode(data);
        setShowRegister(true);
      }
    } catch (err: any) {
      Alert.alert("Scan Error", err.message);
      setScanning(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-between items-center px-6 py-6">
      {/* TOP SECTION: Logo & Title */}
      <View className="items-center mt-4">
        <View className="w-36 h-36 rounded-full bg-sky-100 border-2 border-sky-600 justify-center items-center mb-3 shadow-sm">
          <Text className="text-sky-800 font-bold text-base">LOGO</Text>
        </View>
        <Text className="text-5xl font-extrabold text-gray-900 tracking-wider">
          BFAR - EPS
        </Text>
      </View>

      {/* MIDDLE SECTION: Instructions Box & Embedded Camera Viewport */}
      <View className="w-full items-center my-auto">
        {/* Note Box */}
        <View className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex-row items-center gap-2.5">
          <Info size={20} color="#b45309" className="shrink-0" />
          <Text className="text-amber-800 text-sm leading-5 flex-1">
            Position the barcode inside the camera box below to automatically
            log in or register.
          </Text>
        </View>

        {/* Embedded Scanner Container */}
        <View className="w-full h-48 rounded-2xl overflow-hidden border-2 border-sky-600 bg-black relative shadow-md">
          <CameraView
            facing="back"
            style={StyleSheet.absoluteFill}
            onBarcodeScanned={scanning ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "code128", "code39", "ean13"],
            }}
          />

          {/* Scanning Indicator Overlay */}
          {scanning && !showRegister && (
            <View className="absolute inset-0 bg-black/60 justify-center items-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-white text-xs font-medium mt-2">
                Processing ID...
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* BOTTOM SECTION: Footer Attribution */}
      <View className="items-center mb-2">
        <Text className="text-gray-400 text-xs font-medium">
          RFIMU | Developed 2026
        </Text>
      </View>

      {/* Registration Modal Dialog */}
      {scannedCode && (
        <RegisterModal
          visible={showRegister}
          code={scannedCode}
          onSuccess={async (newUser) => {
            setShowRegister(false);
            await login(newUser);
          }}
          onCancel={() => {
            setShowRegister(false);
            setScannedCode(null);
            setScanning(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}
