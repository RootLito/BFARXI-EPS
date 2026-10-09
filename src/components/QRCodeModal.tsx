import { QrCode, X } from "lucide-react-native";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  qrCode: string;
  qrImageUrl?: string | null;
  eventTitle?: string;
}

export function QRCodeModal({
  visible,
  onClose,
  qrCode,
  qrImageUrl,
  eventTitle,
}: QRCodeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-center items-center px-6">
        <View className="w-full max-w-xs bg-white rounded-3xl p-6 items-center shadow-xl relative">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 justify-center items-center z-10"
          >
            <X size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-5 mt-2">
            <Text className="text-xl font-bold text-slate-800 text-center">
              Event QR Code
            </Text>
            {eventTitle && (
              <Text
                className="text-sm font-medium text-slate-500 text-center mt-1"
                numberOfLines={1}
              >
                {eventTitle}
              </Text>
            )}
          </View>

          {/* QR Code Container */}
          <View className="border border-slate-200 items-center justify-center mb-4">
            {qrImageUrl ? (
              <Image
                source={{ uri: qrImageUrl }}
                className="w-56 h-56"
                resizeMode="contain"
              />
            ) : (
              <View className="w-56 h-56 bg-slate-200 rounded-xl items-center justify-center">
                <QrCode size={64} color="#94A3B8" />
                <Text className="text-xs text-slate-400 mt-2 font-medium">
                  No Image Available
                </Text>
              </View>
            )}
          </View>

          {/* Code String Value */}
          {/* <View className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200/60 mb-2">
            <Text className="text-xs font-mono font-semibold text-slate-600">
              {qrCode}
            </Text>
          </View> */}
        </View>
      </View>
    </Modal>
  );
}
