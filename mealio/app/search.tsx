import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MealCard } from "../components/MealCard";
import { api } from "../services/api";
import { backendService } from "../services/backend.service";
import { useAuth } from "../context/AuthContext";
import { Meal } from "../types/meal";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

export default function SearchModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    date?: string;
    mealType?: string;
  }>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingMeal, setAddingMeal] = useState<string | null>(null);

  const isPlannerMode = params.mode === "planner";
  const mealType = params.mealType as "breakfast" | "lunch" | "dinner";
  const planDate = params.date;

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
      const [apiRes, backendRes] = await Promise.all([
        api.fetchMealsByName(searchQuery),
        backendService.getPosts(searchQuery),
      ]);

      const apiMeals = apiRes || [];
      const userMeals = (backendRes.data || []).map((post: any) => ({
        idMeal: post._id,
        strMeal: post.title,
        strMealThumb:
          post.image ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        strCategory: post.category,
        strArea: "Community",
        strInstructions:
          post.instructions?.join("\n") || post.description || "",
        strYoutube: "",
        strTags: null,
      }));

      setResults([...userMeals, ...apiMeals]);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlanner = async (meal: Meal) => {
    if (!user?._id || !planDate || !mealType) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    setAddingMeal(meal.idMeal);
    try {
      // First check if there's an existing plan for this date
      let existingPlan;
      try {
        const res = await backendService.getMealPlanByDate(user._id, planDate);
        existingPlan = res.data;
      } catch (e) {
        // No existing plan
      }

      if (existingPlan?._id) {
        // Update existing plan
        const updatedMeals = {
          ...existingPlan.meals,
          [mealType]: {
            mealId: meal.idMeal,
            mealData: meal,
            notes: "",
          },
        };
        await backendService.updateMealPlan(existingPlan._id, {
          meals: updatedMeals,
        });
      } else {
        // Create new plan
        const newPlan = {
          userId: user._id,
          date: planDate,
          meals: {
            breakfast:
              mealType === "breakfast"
                ? { mealId: meal.idMeal, mealData: meal, notes: "" }
                : {},
            lunch:
              mealType === "lunch"
                ? { mealId: meal.idMeal, mealData: meal, notes: "" }
                : {},
            dinner:
              mealType === "dinner"
                ? { mealId: meal.idMeal, mealData: meal, notes: "" }
                : {},
            snacks: [],
          },
          totalCalories: 0,
        };
        await backendService.createMealPlan(newPlan as any);
      }

      Alert.alert(
        "Success! 🎉",
        `${meal.strMeal} has been added to your ${mealType}!`,
        [
          {
            text: "Back to Planner",
            onPress: () => router.back(),
          },
          {
            text: "Add More",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add meal to planner");
    } finally {
      setAddingMeal(null);
    }
  };

  const renderPlannerMealCard = (meal: Meal) => {
    const isAdding = addingMeal === meal.idMeal;

    return (
      <TouchableOpacity
        key={meal.idMeal}
        onPress={() => handleAddToPlanner(meal)}
        activeOpacity={0.8}
        style={{ width: CARD_WIDTH }}
        className="mb-4"
        disabled={isAdding}
      >
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <Image
            source={{ uri: `${meal.strMealThumb}/preview` }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="p-3">
            <Text
              className="text-base font-bold text-purple-900"
              numberOfLines={1}
            >
              {meal.strMeal}
            </Text>
            <Text className="text-purple-600 text-xs mt-1" numberOfLines={1}>
              {meal.strCategory}
            </Text>
          </View>
          <View className="bg-purple-700 mx-3 mb-3 py-2 rounded-xl items-center flex-row justify-center">
            {isAdding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text className="text-white font-semibold ml-1">
                  Add to {mealType}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />

      {/* Planner Mode Header */}
      {isPlannerMode && (
        <View className="bg-purple-700 px-5 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white/80 text-sm">Adding to</Text>
              <Text className="text-white text-xl font-bold capitalize">
                {mealType} •{" "}
                {new Date(planDate || "").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="px-5 pt-2">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mt-5">
          <Ionicons name="search" size={20} color="#6b21a8" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder={
              isPlannerMode
                ? `Search for ${mealType} ideas...`
                : "Search recipes, ingredients..."
            }
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

        {!isPlannerMode && (
          <TouchableOpacity
            className="mt-4 self-end"
            onPress={() => router.back()}
          >
            <Text className="text-purple-600 font-semibold text-base">
              Cancel
            </Text>
          </TouchableOpacity>
        )}
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
              {isPlannerMode
                ? results.map((meal) => renderPlannerMealCard(meal))
                : results.map((meal) => (
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
            <Ionicons
              name={isPlannerMode ? "calendar-outline" : "restaurant-outline"}
              size={80}
              color="#E5E7EB"
            />
            <Text className="mt-4 text-purple-400 text-center text-lg">
              {isPlannerMode
                ? `Search for delicious ${mealType} ideas`
                : "Start typing to discover delicious meals"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
