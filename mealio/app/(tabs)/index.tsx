import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryChip } from "../../components/CategoryChip";
import { MealCard } from "../../components/MealCard";
import { api } from "../../services/api";
import { Category, Meal } from "../../types/meal";

export default function Index() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Beef");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [featuredMeal, setFeaturedMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMealsByCategory(activeCategory);
  }, [activeCategory]);

  const loadInitialData = async () => {
    try {
      const [cats, random] = await Promise.all([
        api.fetchCategories(),
        api.fetchRandomMeal(),
      ]);
      setCategories(cats.categories);
      setFeaturedMeal(random);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMealsByCategory = async (category: string) => {
    try {
      const data = await api.fetchMealsByCategory(category);
      setMeals(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6b21a8" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-4xl font-bold text-purple-800">Mealio</Text>
              <Text className="text-purple-600 font-medium">
                What's on the menu today?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/search")}
              className="bg-white p-3 rounded-full shadow-sm border border-purple-100"
            >
              <Ionicons name="search" size={24} color="#6b21a8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Meal Card - remains full width */}
        {featuredMeal && (
          <View className="px-5 mb-8">
            <Text className="text-xl font-bold text-purple-900 mb-4">
              Featured Recipe
            </Text>
            <MealCard meal={featuredMeal} isFullWidth />
          </View>
        )}

        {/* Categories */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-purple-900 px-5 mb-4">
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {categories.map((cat) => (
              <CategoryChip
                key={cat.idCategory}
                category={cat}
                isActive={activeCategory === cat.strCategory}
                onPress={() => setActiveCategory(cat.strCategory)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Meals Grid - 2 Column */}
        <View className="px-5 mb-10">
          <Text className="text-xl font-bold text-purple-900 mb-4">
            Popular {activeCategory}
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {meals.map((meal) => (
              <MealCard key={meal.idMeal} meal={meal} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
