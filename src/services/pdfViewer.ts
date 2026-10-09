import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const openPdfViewer = async (url: string) => {
  try {
    const fileName = `certificate_${Date.now()}.pdf`;
    
    // Support legacy FileSystem.cacheDirectory and Expo SDK 52+ FileSystem.Paths
    const cacheDir =
      (FileSystem as any).Paths?.cache?.uri ||
      (FileSystem as any).cacheDirectory;

    const fileUri = `${cacheDir}${fileName}`;

    // 1. Fetch file directly as binary blob/arrayBuffer
    const response = await fetch(url);
    const blob = await response.blob();

    // 2. Convert blob to Base64 string
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];

        // 3. Write directly to disk as a PDF file
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // 4. Open in native system PDF viewer (Android Drive PDF / iOS QuickLook)
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Open Certificate PDF",
            UTI: "com.adobe.pdf",
          });
        } else {
          Alert.alert("Error", "PDF viewing is not supported on this device.");
        }
      } catch (err: any) {
        Alert.alert("Error", err?.message || "Failed to save PDF to device.");
      }
    };
  } catch (error: any) {
    Alert.alert("Error", error?.message || "Unable to fetch PDF file.");
  }
};