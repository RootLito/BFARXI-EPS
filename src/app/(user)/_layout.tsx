import { useAuth } from "@/context/AuthContext";
import { Slot, usePathname, useRouter } from "expo-router";
import { Calendar, Home, LogOut, Menu, User } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Drawer } from "react-native-drawer-layout";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    setOpen(false);
    router.push(path as any);
  };

  const navItems = [
    {
      label: "Home",
      path: "/(user)/home",
      icon: Home,
    },
    {
      label: "Events",
      path: "/(user)/event",
      icon: Calendar,
    },
    {
      label: "Profile",
      path: "/(user)/profile",
      icon: User,
    },
  ];

  const renderDrawerContent = () => (
    <SafeAreaView
      className="flex-1 bg-slate-900 justify-between py-4 px-4"
      edges={["top", "bottom"]}
    >
      <View className="flex-1">
        {/* Branding Section: Logo & App Title */}
        <View className="flex flex-row items-center gap-4 mb-6 pt-2">
          <View className="w-14 h-14 rounded-full bg-sky-500/20 border border-sky-400/40 justify-center items-center mb-2">
            <Text className="text-sky-400 font-extrabold text-xs tracking-wider">
              LOGO
            </Text>
          </View>
          <Text className="text-white font-extrabold text-lg tracking-wider">
            BFARXI-EPAS
          </Text>
        </View>
        {/* User Profile Header */}
        <View className="flex-row items-center gap-3 p-3 bg-slate-800/80 rounded-2xl mb-6">
          <View className="w-12 h-12 rounded-full bg-sky-500 justify-center items-center">
            <User size={24} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {user?.fullname || "Client User"}
            </Text>
            <Text className="text-slate-400 text-xs" numberOfLines={1}>
              {user?.position || "BFAR Client"}
            </Text>
          </View>
        </View>

        {/* Dynamic Navigation Tabs */}
        <View className="gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path ||
              (item.path === "/(user)/home" && pathname === "/(user)");

            return (
              <TouchableOpacity
                key={item.path}
                onPress={() => navigateTo(item.path)}
                className={`flex-row items-center gap-3 p-3.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-sky-600 shadow-sm"
                    : "bg-slate-800/50 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} color={isActive ? "#ffffff" : "#94a3b8"} />
                <Text
                  className={`font-semibold text-sm ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        onPress={logout}
        className="flex-row items-center gap-3 p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20"
      >
        <LogOut size={20} color="#f43f5e" />
        <Text className="text-rose-400 font-semibold text-sm">Logout</Text>
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
          backgroundColor: "#0f172a",
          width: 280,
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
          overflow: "hidden",
        }}
        renderDrawerContent={renderDrawerContent}
      >
        <View className="flex-1 bg-slate-950">
          {/* App Header Bar */}
          <SafeAreaView
            edges={["top"]}
            className="bg-slate-900 border-b border-slate-800"
          >
            <View className="flex-row items-center px-4 py-3">
              <TouchableOpacity
                onPress={() => setOpen(true)}
                className="w-10 h-10 bg-slate-800 rounded-full justify-center items-center mr-3"
              >
                <Menu size={20} color="#ffffff" />
              </TouchableOpacity>
              <Text className="text-white font-bold text-lg">BFARXI-EPAS</Text>
            </View>
          </SafeAreaView>

          {/* Page Content Slot */}
          <View className="flex-1">
            <Slot />
          </View>
        </View>
      </Drawer>
    </GestureHandlerRootView>
  );
}
