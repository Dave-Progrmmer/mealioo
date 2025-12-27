import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { backendService } from "../../services/backend.service";
import { DayPlan, MealPlan, MealSlot } from "../../types/mealPlan";

const { width } = Dimensions.get("window");
const DAY_WIDTH = (width - 48) / 7;

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
type MealType = (typeof MEAL_TYPES)[number];

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "sunny",
  lunch: "restaurant",
  dinner: "moon",
};

const MEAL_BG_COLORS: Record<MealType, string> = {
  breakfast: "bg-amber-100",
  lunch: "bg-green-100",
  dinner: "bg-indigo-100",
};

const getWeekDates = (baseDate: Date): DayPlan[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const days: DayPlan[] = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      date,
      dateString: date.toISOString().split("T")[0],
      dayName: dayNames[i],
      dayNumber: date.getDate(),
      isToday: date.getTime() === today.getTime(),
    });
  }
  return days;
};

export default function PlannerScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState<DayPlan[]>(getWeekDates(new Date()));
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = getWeekDates(currentWeek);
    setWeekDays(days);
    // Select today by default or first day of week
    const today = days.find((d) => d.isToday) || days[0];
    setSelectedDay(today);
  }, [currentWeek]);

  useEffect(() => {
    if (user?._id) {
      loadMealPlans();
    } else {
      setLoading(false);
    }
  }, [currentWeek, user]);

  const loadMealPlans = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const startDate = weekDays[0]?.dateString;
      const endDate = weekDays[6]?.dateString;

      if (startDate && endDate) {
        const res = await backendService.getUserMealPlans(
          user._id,
          startDate,
          endDate
        );
        setMealPlans(res.data);
      }
    } catch (error) {
      console.error("Failed to load meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const getMealPlanForDay = (dateString: string): MealPlan | undefined => {
    return mealPlans.find((plan) => plan.date.split("T")[0] === dateString);
  };

  const handleAddMeal = (mealType: MealType) => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to create meal plans.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login" as any) },
      ]);
      return;
    }

    router.push({
      pathname: "/search",
      params: {
        mode: "planner",
        date: selectedDay?.dateString,
        mealType,
      },
    } as any);
  };

  const getMonthYear = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };
    return currentWeek.toLocaleDateString("en-US", options);
  };

  const renderMealSlot = (mealType: MealType, mealSlot?: MealSlot) => {
    const icon = MEAL_ICONS[mealType];
    const bgColor = MEAL_BG_COLORS[mealType];
    const hasMeal = mealSlot?.mealId || mealSlot?.post?._id;

    return (
      <TouchableOpacity
        key={mealType}
        onPress={() => handleAddMeal(mealType)}
        className="mb-4"
        activeOpacity={0.8}
      >
        <View
          className={`rounded-2xl p-4 flex-row items-center ${
            hasMeal ? "bg-purple-700" : bgColor
          }`}
        >
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              hasMeal ? "bg-white/20" : "bg-white/70"
            }`}
          >
            <Ionicons
              name={icon as any}
              size={24}
              color={hasMeal ? "#fff" : "#6b21a8"}
            />
          </View>
          <View className="flex-1 ml-4">
            <Text
              className={`text-lg font-bold capitalize ${
                hasMeal ? "text-white" : "text-purple-900"
              }`}
            >
              {mealType}
            </Text>
            {hasMeal && mealSlot?.mealData ? (
              <Text className="text-white/80" numberOfLines={1}>
                {mealSlot.mealData.strMeal}
              </Text>
            ) : (
              <Text
                className={hasMeal ? "text-white/60" : "text-purple-600/60"}
              >
                Tap to add a meal
              </Text>
            )}
          </View>
          <Ionicons
            name={hasMeal ? "checkmark-circle" : "add-circle"}
            size={28}
            color={hasMeal ? "#fff" : "#6b21a8"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-purple-100 w-24 h-24 rounded-full items-center justify-center mb-6">
            <Ionicons name="calendar" size={48} color="#6b21a8" />
          </View>
          <Text className="text-2xl font-bold text-purple-900 text-center mb-2">
            Meal Planning Made Easy
          </Text>
          <Text className="text-purple-600 text-center mb-8">
            Sign in to create personalized weekly meal plans and never wonder
            "what's for dinner?" again!
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login" as any)}
            className="bg-purple-700 px-8 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold text-lg">Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentDayPlan = selectedDay
    ? getMealPlanForDay(selectedDay.dateString)
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-purple-900">
            Meal Planner
          </Text>
          <Text className="text-purple-600">Plan your week, eat better!</Text>
        </View>

        {/* Week Navigation */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <TouchableOpacity
              onPress={() => navigateWeek("prev")}
              className="p-2"
            >
              <Ionicons name="chevron-back" size={24} color="#6b21a8" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-purple-900">
              {getMonthYear()}
            </Text>
            <TouchableOpacity
              onPress={() => navigateWeek("next")}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={24} color="#6b21a8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Week Days */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between">
            {weekDays.map((day) => {
              const hasPlan = getMealPlanForDay(day.dateString);
              const isSelected = selectedDay?.dateString === day.dateString;

              return (
                <TouchableOpacity
                  key={day.dateString}
                  onPress={() => setSelectedDay(day)}
                  style={{ width: DAY_WIDTH }}
                  className={`items-center py-3 rounded-2xl ${
                    isSelected
                      ? "bg-purple-700"
                      : day.isToday
                        ? "bg-purple-100"
                        : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected
                        ? "text-white/70"
                        : day.isToday
                          ? "text-purple-700"
                          : "text-gray-400"
                    }`}
                  >
                    {day.dayName}
                  </Text>
                  <Text
                    className={`text-lg font-bold ${
                      isSelected
                        ? "text-white"
                        : day.isToday
                          ? "text-purple-900"
                          : "text-gray-800"
                    }`}
                  >
                    {day.dayNumber}
                  </Text>
                  {hasPlan && (
                    <View
                      className={`w-2 h-2 rounded-full mt-1 ${
                        isSelected ? "bg-white" : "bg-purple-500"
                      }`}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Day Meals */}
        {selectedDay && (
          <View className="px-5 mb-10">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-purple-900">
                {selectedDay.isToday
                  ? "Today's Plan"
                  : new Date(selectedDay.dateString).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      }
                    )}
              </Text>
              {currentDayPlan && (
                <TouchableOpacity
                  onPress={() => {
                    // Toggle completion
                    if (currentDayPlan._id) {
                      backendService.completeMealPlan(currentDayPlan._id);
                      loadMealPlans();
                    }
                  }}
                >
                  <View
                    className={`flex-row items-center px-3 py-1 rounded-full ${
                      currentDayPlan.completed
                        ? "bg-green-100"
                        : "bg-purple-100"
                    }`}
                  >
                    <Ionicons
                      name={
                        currentDayPlan.completed
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={16}
                      color={currentDayPlan.completed ? "#22c55e" : "#6b21a8"}
                    />
                    <Text
                      className={`ml-1 text-sm font-medium ${
                        currentDayPlan.completed
                          ? "text-green-700"
                          : "text-purple-700"
                      }`}
                    >
                      {currentDayPlan.completed ? "Done" : "In Progress"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#6b21a8" />
            ) : (
              <>
                {renderMealSlot("breakfast", currentDayPlan?.meals?.breakfast)}
                {renderMealSlot("lunch", currentDayPlan?.meals?.lunch)}
                {renderMealSlot("dinner", currentDayPlan?.meals?.dinner)}
              </>
            )}

            {/* Quick Stats */}
            {currentDayPlan && currentDayPlan.totalCalories > 0 && (
              <View className="bg-white rounded-2xl p-4 mt-2 border border-purple-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="flame" size={24} color="#ef4444" />
                    <Text className="ml-2 text-gray-600">
                      Estimated Calories
                    </Text>
                  </View>
                  <Text className="text-xl font-bold text-purple-900">
                    {currentDayPlan.totalCalories}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tips Section */}
        <View className="px-5 mb-10">
          <View className="bg-purple-700 rounded-3xl p-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={24} color="#fcd34d" />
              <Text className="text-white font-bold text-lg ml-2">Pro Tip</Text>
            </View>
            <Text className="text-white/90">
              Plan your meals on Sunday evening to shop efficiently and reduce
              food waste. A little planning goes a long way!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
