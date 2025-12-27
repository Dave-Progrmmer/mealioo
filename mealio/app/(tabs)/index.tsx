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
import { backendService } from "../../services/backend.service";
import { useAuth } from "../../context/AuthContext";
import { Category, Meal } from "../../types/meal";
import { MealPlan } from "../../types/mealPlan";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("Beef");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [featuredMeal, setFeaturedMeal] = useState<Meal | null>(null);
  const [todaysPlan, setTodaysPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMealsByCategory(activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (user?._id) {
      loadTodaysPlan();
    }
  }, [user]);

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

  const loadTodaysPlan = async () => {
    if (!user?._id) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await backendService.getMealPlanByDate(user._id, today);
      setTodaysPlan(res.data);
    } catch (error) {
      // No plan for today, that's ok
      setTodaysPlan(null);
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

  const getMealCount = () => {
    if (!todaysPlan?.meals) return 0;
    let count = 0;
    if (
      todaysPlan.meals.breakfast?.mealId ||
      todaysPlan.meals.breakfast?.post?._id
    )
      count++;
    if (todaysPlan.meals.lunch?.mealId || todaysPlan.meals.lunch?.post?._id)
      count++;
    if (todaysPlan.meals.dinner?.mealId || todaysPlan.meals.dinner?.post?._id)
      count++;
    return count;
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

        {/* Today's Plan Quick Access Card */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/planner" as any)}
            activeOpacity={0.9}
          >
            <View className="bg-purple-700 rounded-3xl p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar" size={20} color="#fcd34d" />
                    <Text className="text-white/80 font-medium ml-2">
                      Today's Plan
                    </Text>
                  </View>
                  {todaysPlan ? (
                    <>
                      <Text className="text-white text-xl font-bold">
                        {getMealCount()} of 3 meals planned
                      </Text>
                      <Text className="text-white/70 mt-1">
                        {todaysPlan.completed
                          ? "✓ All done for today!"
                          : "Tap to view your plan"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="text-white text-xl font-bold">
                        No meals planned yet
                      </Text>
                      <Text className="text-white/70 mt-1">
                        Tap to start planning your day
                      </Text>
                    </>
                  )}
                </View>
                <View className="bg-white/20 w-14 h-14 rounded-full items-center justify-center">
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </View>

              {/* Mini meal indicators */}
              {todaysPlan && (
                <View className="flex-row mt-4 pt-4 border-t border-white/20">
                  {["breakfast", "lunch", "dinner"].map((meal, index) => {
                    const mealData =
                      todaysPlan.meals?.[meal as keyof typeof todaysPlan.meals];
                    const hasMeal =
                      mealData &&
                      ((mealData as any)?.mealId ||
                        (mealData as any)?.post?._id);
                    return (
                      <View
                        key={meal}
                        className="flex-1 items-center"
                        style={{
                          borderRightWidth: index < 2 ? 1 : 0,
                          borderRightColor: "rgba(255,255,255,0.2)",
                        }}
                      >
                        <Ionicons
                          name={
                            meal === "breakfast"
                              ? "sunny"
                              : meal === "lunch"
                                ? "restaurant"
                                : "moon"
                          }
                          size={18}
                          color={hasMeal ? "#fcd34d" : "rgba(255,255,255,0.4)"}
                        />
                        <Text
                          className={`text-xs mt-1 capitalize ${
                            hasMeal ? "text-white" : "text-white/40"
                          }`}
                        >
                          {meal}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </TouchableOpacity>
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
