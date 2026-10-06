import { authService } from "@/services/authService";
import { UserProfile } from "@/types/user";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  code: string;
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export function RegisterModal({ visible, code, onSuccess, onCancel }: Props) {
  const [fullname, setFullname] = useState("");
  const [position, setPosition] = useState("");
  const [office, setOffice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullname.trim() || !position.trim() || !office.trim()) {
      Alert.alert("Missing Fields", "Please complete all fields to register.");
      return;
    }

    try {
      setSubmitting(true);
      const newUser = await authService.registerClient({
        code,
        fullname,
        position,
        office,
      });
      onSuccess(newUser);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 justify-center px-6">
        <View className="bg-white rounded-2xl p-6 shadow-xl">
          <Text className="text-xl font-bold text-gray-900">
            New ID Detected
          </Text>
          <Text className="text-xs text-gray-500 mb-4">Code: {code}</Text>

          <View className="gap-y-3 mb-6">
            <TextInput
              placeholder="Full Name"
              value={fullname}
              onChangeText={setFullname}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
            />
            <TextInput
              placeholder="Position"
              value={position}
              onChangeText={setPosition}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
            />
            <TextInput
              placeholder="Office"
              value={office}
              onChangeText={setOffice}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
            />
          </View>

          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onCancel}
              className="px-5 py-3 rounded-xl bg-gray-100"
            >
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={submitting}
              className="px-5 py-3 rounded-xl bg-blue-600 flex-row items-center justify-center"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-semibold">Register</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
