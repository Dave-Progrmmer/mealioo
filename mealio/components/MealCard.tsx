import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Meal } from "../types/meal";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { backendService } from "../services/backend.service";

interface MealCardProps {
  meal: Meal;
  isFullWidth?: boolean;
}

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 50) / 2; // (padding-5*2 + gap)

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  isFullWidth = false,
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(
    user?.favorites?.includes(meal.idMeal) || false
  );
  const { setUser } = useAuth();
  const router = useRouter();

  const toggleFavorite = async (e: any) => {
    e.preventDefault();
    if (!user) {
      Alert.alert(
        "Join Mealio",
        "Sign up to save favorites and plan your meals!",
        [
          { text: "Continue", style: "cancel" },
          {
            text: "Register",
            onPress: () => router.push("/(auth)/register" as any),
            style: "default",
          },
        ]
      );
      return;
    }
    try {
      const res = await backendService.toggleFavorite(meal.idMeal);
      setIsFavorite(!isFavorite);
      if (user) {
        const updatedUser = { ...user, favorites: res.data };
        setUser(updatedUser);
        await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ width: isFullWidth ? "100%" : COLUMN_WIDTH }}>
      <Link href={`/meal/${meal.idMeal}`} asChild>
        <TouchableOpacity
          className="bg-white rounded-3xl overflow-hidden mb-4 shadow-sm border border-gray-100"
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: `${meal.strMealThumb}/preview` }}
            className={`w-full ${isFullWidth ? "h-48" : "h-32"}`}
            resizeMode="cover"
          />
          <View className="p-3">
            <View className="flex-row justify-between items-center">
              <Text
                className="text-clearbase font-bold text-purple-900 flex-1"
                numberOfLines={1}
              >
                {meal.strMeal}
              </Text>
              <TouchableOpacity onPress={toggleFavorite}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? "#6b21a8" : "#6b21a8"}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center mt-1">
              <Text
                className="text-purple-600 font-medium text-xs"
                numberOfLines={1}
              >
                {meal.strCategory}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
};
