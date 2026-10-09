import { EmployeeCard } from "@/components/EmployeeCard";
import { fetchClients } from "@/services/userService";
import { UserProfile } from "@/types/user";
import { Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TextInput,
    View,
} from "react-native";

const EmployeeScreen = () => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEmployees = async () => {
    try {
      const data = await fetchClients();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter clients based on search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.fullname?.toLowerCase().includes(query) ||
          emp.position?.toLowerCase().includes(query) ||
          emp.office?.toLowerCase().includes(query) ||
          emp.code?.toLowerCase().includes(query),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  return (
    <View className="flex-1">
      <FlatList
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EmployeeCard item={item} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerClassName="px-6 pb-6"
        contentContainerStyle={
          filteredEmployees.length === 0 ? { flexGrow: 1 } : undefined
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Title */}
            <Text className="text-3xl font-extrabold text-brand-500 mb-4 tracking-tight">
              Employees
            </Text>

            {/* Search Bar */}
            <View className="flex-row items-center bg-slate-100 px-4 py-3 rounded-2xl mb-4 border border-slate-200/50">
              <Search size={20} color="#94A3B8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Employee..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-3 text-base text-slate-800 font-medium p-0"
              />
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="large" color="#0F172A" />
            </View>
          ) : (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-center text-slate-400 font-medium">
                No employees found
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default EmployeeScreen;
