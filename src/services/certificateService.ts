import { supabase } from "@/lib/supabase";
import { Certificate, CreateCertificateInput } from "@/types/certificate";
import * as DocumentPicker from "expo-document-picker";

export const certificateService = {
    // Fetch certificates with event info
    async getCertificates(eventId?: string): Promise<Certificate[]> {
        let query = supabase
            .from("certificates")
            .select("*, event:events(*)")
            .order("created_at", { ascending: false });

        if (eventId) {
            query = query.eq("event_id", eventId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    // Pick PDF file using Expo DocumentPicker
    async pickPdfFile() {
        const result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0];
        }
        return null;
    },

    // Upload file to storage and save record to DB
    async uploadAndCreateCertificate(
        eventId: string,
        fileAsset: DocumentPicker.DocumentPickerAsset
    ): Promise<Certificate> {
        const fileExt = fileAsset.name.split(".").pop() || "pdf";
        const fileName = `${eventId}_${Date.now()}.${fileExt}`;

        // Store directly inside bucket (avoiding redundant 'certificates/' subfolder)
        const filePath = fileName;

        // Use FormData for React Native uploads to preserve exact MIME headers in Supabase
        const formData = new FormData();
        formData.append("file", {
            uri: fileAsset.uri,
            name: fileAsset.name,
            type: "application/pdf",
        } as any);

        // 1. Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from("certificates")
            .upload(filePath, formData, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (storageError) throw storageError;

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from("certificates")
            .getPublicUrl(filePath);

        // 3. Create record in DB
        const input: CreateCertificateInput = {
            event_id: eventId,
            file_name: fileAsset.name,
            file_url: publicUrlData.publicUrl,
            size_bytes: fileAsset.size,
        };

        const { data, error } = await supabase
            .from("certificates")
            .insert([input])
            .select("*, event:events(*)")
            .single();

        if (error) throw error;
        return data;
    },

    // Delete certificate from storage AND database
    async deleteCertificate(certificate: Certificate): Promise<void> {
        try {
            // 1. Parse the exact path key inside the 'certificates' bucket from the public URL
            const publicUrlPrefix = "/storage/v1/object/public/certificates/";

            if (certificate.file_url.includes(publicUrlPrefix)) {
                // Extracts whatever comes after '/storage/v1/object/public/certificates/'
                const rawStoragePath = certificate.file_url.split(publicUrlPrefix)[1];
                const storagePath = decodeURIComponent(rawStoragePath);

                // Delete from Supabase Storage
                const { error: storageError } = await supabase.storage
                    .from("certificates")
                    .remove([storagePath]);

                if (storageError) {
                    console.error("Supabase Storage file deletion error:", storageError.message);
                }
            }

            // 2. Delete database record
            const { error: dbError } = await supabase
                .from("certificates")
                .delete()
                .eq("id", certificate.id);

            if (dbError) throw dbError;
        } catch (err: any) {
            console.error("Failed to execute deleteCertificate:", err);
            throw err;
        }
    },
};