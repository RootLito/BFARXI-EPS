import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

/**
 * Robustly extracts the relative file path inside the bucket.
 * Works even when folder names match bucket names (e.g. avatars/avatars/image.jpg).
 */
function extractPathFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // Public URLs follow: .../storage/v1/object/public/{bucket}/{filePath}
    const marker = "/object/public/avatars/";
    const index = url.indexOf(marker);

    if (index === -1) return null;

    // Returns everything after "/object/public/avatars/" -> "avatars/filename.jpg"
    return url.substring(index + marker.length);
}

export async function pickAndUploadAvatar(
    user: UserProfile | null
): Promise<string | null> {
    // 1. Request permissions
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
        Alert.alert(
            "Permission Required",
            "Permission to access camera roll is required to upload a profile picture."
        );
        return null;
    }

    // 2. Select image
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets[0]?.uri) {
        return null;
    }

    const imageUri = pickerResult.assets[0].uri;
    const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${user?.code || user?.id || Date.now()}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 3. Read image buffer
    const file = new File(imageUri);
    const arrayBuffer = await file.arrayBuffer();

    // 4. Upload new photo to avatars/ subfolder
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt === "png" ? "png" : "jpeg"}`,
            upsert: true,
        });

    if (uploadError) throw uploadError;

    // 5. Get Public URL for the new image
    const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 6. Delete old avatar from storage (if present)
    const oldFilePath = extractPathFromUrl(user?.avatar_url);
    if (oldFilePath) {
        await supabase.storage.from("avatars").remove([oldFilePath]);
    }

    // 7. Update user profile record in database
    const filterColumn = user?.id ? "id" : "code";
    const filterValue = user?.id || user?.code;

    if (!filterValue) throw new Error("Missing user identification");

    const { error: dbError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq(filterColumn, filterValue);

    if (dbError) throw dbError;

    return publicUrl;
}