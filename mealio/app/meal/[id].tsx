import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../services/api";
import { Meal } from "../../types/meal";

export default function MealDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMealDetails();
    }
  }, [id]);

  const loadMealDetails = async () => {
    try {
      const data = await api.fetchMealById(id);
      setMeal(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getIngredients = (meal: Meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}` as keyof Meal];
      const measure = meal[`strMeasure${i}` as keyof Meal];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure });
      }
    }
    return ingredients;
  };

  const parseInstructions = (instructions: string) => {
    return instructions
      .split("\r\n")
      .filter((step) => step.trim().length > 0 && !step.includes("STEP"))
      .map((step) => step.trim().replace(/^\d+\.\s*/, ""));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6b21a8" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-purple-600">Meal not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-purple-600 px-6 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = getIngredients(meal);
  const steps = parseInstructions(meal.strInstructions);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative">
          <Image source={{ uri: meal.strMealThumb }} className="w-full h-80" />
          <View className="absolute top-12 left-5">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/90 p-2 rounded-full shadow-sm"
            >
              <Ionicons name="chevron-back" size={24} color="#6b21a8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="px-5 py-6 -mt-8 bg-white rounded-t-[40px] shadow-lg">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-bold text-purple-900">
                {meal.strMeal}
              </Text>
              <Text className="text-purple-600 font-medium text-lg mt-1">
                {meal.strCategory} • {meal.strArea}
              </Text>
            </View>
            {meal.strYoutube && (
              <TouchableOpacity
                onPress={() => Linking.openURL(meal.strYoutube)}
                className="bg-red-50 p-3 rounded-2xl"
              >
                <Ionicons name="logo-youtube" size={28} color="#FF0000" />
              </TouchableOpacity>
            )}
          </View>

          {/* Ingredients */}
          <View className="mt-8">
            <Text className="text-xl font-bold text-purple-900 mb-4">
              Ingredients
            </Text>
            <View className="flex-row flex-wrap">
              {ingredients.map((item, index) => (
                <View
                  key={index}
                  className="bg-purple-50 px-4 py-2 rounded-full mr-2 mb-2 border border-purple-100"
                >
                  <Text className="text-purple-800 font-medium text-sm">
                    {item.measure} {item.ingredient}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View className="mt-8 mb-10">
            <Text className="text-xl font-bold text-purple-900 mb-4">
              Instructions
            </Text>
            {steps.map((step, index) => (
              <View
                key={index}
                className="flex-row mb-4 bg-white border border-purple-100 p-4 rounded-3xl shadow-sm"
              >
                <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-purple-900 leading-6 text-base">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
