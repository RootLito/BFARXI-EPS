import { useAuth } from "@/context/AuthContext";
import { Slot, usePathname, useRouter } from "expo-router";
import {
    Award,
    Calendar,
    Home,
    LogOut,
    Menu,
    User,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", path: "/(admin)/home", icon: Home },
    { label: "Event", path: "/(admin)/event", icon: Calendar },
    { label: "Certificate of Appearance", path: "/(admin)/ca", icon: Award },
    { label: "Employees", path: "/(admin)/employee", icon: Users },
  ];

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path as any);
  };

  const renderDrawerContent = () => (
    <SafeAreaView
      className="flex-1 bg-brand-500 justify-between py-6 px-5"
      edges={["top", "bottom"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Logo Header */}
        <View className="flex-row items-center gap-3 mb-8 pt-2">
          <View className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 justify-center items-center">
            <Text className="text-white font-black text-xs tracking-widest">
              EPAS
            </Text>
          </View>
          <View>
            <Text className="text-white font-extrabold text-lg tracking-wide">
              BFARXI-EPAS
            </Text>
            <Text className="text-brand-200 text-xs font-medium">
              Admin Portal
            </Text>
          </View>
        </View>

        {/* User Profile Card */}
        <View className="flex-row items-center gap-3 p-3.5 bg-white/10 rounded-2xl mb-8 border border-white/10">
          <View className="w-11 h-11 rounded-full bg-brand-400 justify-center items-center border-2 border-white/30">
            <User size={22} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {user?.fullname || "Admin User"}
            </Text>
            <Text
              className="text-brand-200 text-xs font-medium"
              numberOfLines={1}
            >
              {user?.position || "Administrator"}
            </Text>
          </View>
        </View>

        {/* Navigation Items */}
        <View className="gap-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path === "/(admin)/home" && pathname === "/(admin)");

            return (
              <TouchableOpacity
                key={item.path}
                onPress={() => navigateTo(item.path)}
                className={`flex-row items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all ${
                  isActive
                    ? "bg-white shadow-sm"
                    : "bg-transparent active:bg-white/10"
                }`}
              >
                <Icon size={20} color={isActive ? "#395886" : "#B1C9EF"} />
                <Text
                  className={`font-semibold text-sm ${
                    isActive ? "text-brand-500 font-bold" : "text-brand-100"
                  }`}
                >
                  {item.label}
                </Text>
                {isActive && (
                  <View className="ml-auto w-2 h-2 rounded-full bg-accent-vibrant" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Logout Action */}
      <TouchableOpacity
        onPress={logout}
        className="flex-row items-center gap-3 px-4 py-3.5 bg-white/5 rounded-2xl border border-white/10 active:bg-white/10 mt-4"
      >
        <LogOut size={18} color="#FF5722" />
        <Text className="text-accent-vibrant font-semibold text-sm">
          Logout
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="front"
        drawerPosition="left"
        drawerStyle={{
          backgroundColor: "#395886",
          width: 290,
          borderTopRightRadius: 36,
          borderBottomRightRadius: 36,
          overflow: "hidden",
        }}
        renderDrawerContent={renderDrawerContent}
      >
        <View className="flex-1 bg-brand-50">
          {/* Header Bar */}
          <SafeAreaView edges={["top"]} className="bg-brand-50">
            <View className="flex-row items-center justify-between px-5 py-3">
              <TouchableOpacity
                onPress={() => setOpen(true)}
                className="w-11 h-11 bg-white rounded-2xl justify-center items-center shadow-sm border border-brand-100/60"
              >
                <Menu size={22} color="#395886" />
              </TouchableOpacity>

              <Text className="text-brand-500 font-bold text-lg tracking-tight">
                BFARXI-EPAS
              </Text>

              <TouchableOpacity className="w-11 h-11 bg-white rounded-2xl justify-center items-center shadow-sm border border-brand-100/60 relative">
                <User size={20} color="#395886" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Screen Content Slot */}
          <View className="flex-1">
            <Slot />
          </View>
        </View>
      </Drawer>
    </GestureHandlerRootView>
  );
}
