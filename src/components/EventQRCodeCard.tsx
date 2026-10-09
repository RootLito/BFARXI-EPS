import { Image, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface EventQRCodeCardProps {
  qrCode: string;
  qrImageUrl?: string;
  title?: string;
  size?: number;
}

export default function EventQRCodeCard({
  qrCode,
  qrImageUrl,
  title,
  size = 180,
}: EventQRCodeCardProps) {
  return (
    <View className="bg-slate-50 border border-slate-200 rounded-2xl p-5 items-center justify-center my-4 shadow-sm">
      {title && (
        <Text className="text-sm font-semibold text-slate-700 mb-3 text-center">
          {title}
        </Text>
      )}

      {/* Renders via SVG natively or falls back to public URL image if provided */}
      {qrImageUrl ? (
        <Image
          source={{ uri: qrImageUrl }}
          style={{ width: size, height: size }}
          className="rounded-lg"
          resizeMode="contain"
        />
      ) : (
        <View className="p-2 bg-white rounded-xl shadow-xs">
          <QRCode
            value={qrCode}
            size={size}
            color="#0F172A"
            backgroundColor="#FFFFFF"
          />
        </View>
      )}

      <Text className="mt-3 text-xs font-mono font-bold text-slate-500 tracking-wider">
        {qrCode}
      </Text>
    </View>
  );
}
