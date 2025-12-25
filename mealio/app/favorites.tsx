import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MealCard } from "../components/MealCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Meal } from "../types/meal";

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user?.favorites]);

  const loadFavorites = async () => {
    if (!user?.favorites || user.favorites.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const favoriteIds = user.favorites;
      const mealPromises = favoriteIds.map((id: string) =>
        api.fetchMealById(id)
      );
      const results = await Promise.all(mealPromises);
      setFavorites(results.filter((meal): meal is Meal => meal !== null));
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="px-5 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white p-2 rounded-full shadow-sm border border-purple-100 mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#6b21a8" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-purple-900">My Favorites</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6b21a8" />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="bg-purple-50 p-6 rounded-full mb-6">
            <Ionicons name="heart-dislike-outline" size={60} color="#6b21a8" />
          </View>
          <Text className="text-xl font-bold text-purple-900 text-center mb-2">
            No favorites yet
          </Text>
          <Text className="text-purple-600 text-center mb-8">
            Start exploring recipes and tap the heart icon to save them here!
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="bg-purple-800 px-8 py-4 rounded-3xl shadow-lg"
          >
            <Text className="text-white font-bold text-lg">
              Explore Recipes
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
          renderItem={({ item }) => <MealCard meal={item} />}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
