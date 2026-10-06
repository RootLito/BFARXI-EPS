import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from "react-native-reanimated";
import "../global.css";

// Disable Reanimated strict-mode logger warnings during render
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAdminGroup = segments[0] === "(admin)";
    const inUserGroup = segments[0] === "(user)";

    if (!user) {
      router.replace("/login");
    } else if (user.role === "admin" && !inAdminGroup) {
      router.replace("/(admin)/home");
    } else if (user.role === "client" && !inUserGroup) {
      router.replace("/(user)/home");
    }
  }, [user, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
