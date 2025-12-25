import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MealCard } from "../components/MealCard";
import { api } from "../services/api";
import { Meal } from "../types/meal";

export default function SearchModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const data = await api.fetchMealsByName(searchQuery);
      setResults(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      <View className="px-5 pt-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mt-5">
          <Ionicons name="search" size={20} color="#6b21a8" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search recipes, ingredients..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          className="mt-4 self-end"
          onPress={() => router.back()}
        >
          <Text className="text-purple-600 font-semibold text-base">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#6b21a8" />
          </View>
        ) : results.length > 0 ? (
          <View className="pb-10">
            <Text className="text-purple-600 mb-4 font-medium">
              {results.length} recipes found
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {results.map((meal) => (
                <MealCard key={meal.idMeal} meal={meal} />
              ))}
            </View>
          </View>
        ) : searchQuery.length > 0 ? (
          <View className="mt-10 items-center justify-center">
            <Ionicons name="search-outline" size={80} color="#E5E7EB" />
            <Text className="mt-4 text-purple-400 text-center text-lg">
              No recipes found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          <View className="mt-10 items-center justify-center">
            <Ionicons name="restaurant-outline" size={80} color="#E5E7EB" />
            <Text className="mt-4 text-purple-400 text-center text-lg">
              Start typing to discover delicious meals
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
