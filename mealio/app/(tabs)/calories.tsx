import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { backendService } from "../../services/backend.service";
import { api } from "../../services/api";
import { DailyNutrition, FoodEntry, ScannedProduct } from "../../types/calorie";
import { Meal } from "../../types/meal";

const { width } = Dimensions.get("window");

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_TYPES)[number];

const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "sunny",
  lunch: "restaurant",
  dinner: "moon",
  snack: "cafe",
};

export default function CaloriesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("breakfast");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [searching, setSearching] = useState(false);

  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(
    null
  );
  const [scanningBarcode, setScanningBarcode] = useState(false);
  const [calorieGoal] = useState(2000);
  const [addingFoodId, setAddingFoodId] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      loadDailyData();
    } else {
      setLoading(false);
    }
  }, [selectedDate, user]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFoods();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadDailyData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const res = await backendService.getFoodEntriesByDate(user._id, dateStr);
      setDailyData(res.data);
    } catch (error) {
      setDailyData({
        entries: [],
        totals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        },
        date: selectedDate.toISOString().split("T")[0],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async ({ data }: { data: string }) => {
    if (scanningBarcode) return;
    setScanningBarcode(true);
    setShowScanner(false);

    try {
      const res = await backendService.searchByBarcode(data);
      setScannedProduct(res.data);
      setShowAddModal(true);
    } catch (error) {
      Alert.alert(
        "Product Not Found",
        "This product is not in our database. Try searching manually."
      );
    } finally {
      setScanningBarcode(false);
    }
  };

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await api.fetchMealsByName(searchQuery);
      setSearchResults(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const addFoodFromMeal = async (meal: Meal) => {
    if (!user?._id) return;

    // Estimate calories based on meal type (since TheMealDB doesn't have nutrition info)
    const estimatedCalories = 400; // Default estimate

    setAddingFoodId(meal.idMeal);

    try {
      await backendService.addFoodEntry({
        user: user._id,
        date: selectedDate.toISOString(),
        mealType: selectedMealType,
        foodName: meal.strMeal,
        calories: estimatedCalories,
        protein: 20,
        carbs: 40,
        fat: 15,
        imageUrl: meal.strMealThumb,
      });

      // Success feedback
      Alert.alert(
        "Added! 🥗",
        `${meal.strMeal} has been added to ${selectedMealType}`,
        [{ text: "OK" }]
      );

      // Reset state but keep modal open if they want to add more,
      // OR close it. Let's close it for better UX flow as per usual patterns.
      setShowAddModal(false);
      setSearchQuery("");
      setSearchResults([]);
      loadDailyData();
    } catch (error: any) {
      console.error("Add food error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Failed to add food entry. Please try again."
      );
    } finally {
      setAddingFoodId(null);
    }
  };

  const addScannedProduct = async () => {
    if (!user?._id || !scannedProduct) return;

    try {
      await backendService.addFoodEntry({
        user: user._id,
        date: selectedDate.toISOString(),
        mealType: selectedMealType,
        foodName: scannedProduct.foodName,
        barcode: scannedProduct.barcode,
        brand: scannedProduct.brand,
        calories: scannedProduct.calories,
        protein: scannedProduct.protein,
        carbs: scannedProduct.carbs,
        fat: scannedProduct.fat,
        fiber: scannedProduct.fiber,
        sugar: scannedProduct.sugar,
        imageUrl: scannedProduct.imageUrl,
      });
      setShowAddModal(false);
      setScannedProduct(null);
      loadDailyData();
      Alert.alert(
        "Added!",
        `${scannedProduct.foodName} added to ${selectedMealType}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to add food entry");
    }
  };

  const deleteFoodEntry = async (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await backendService.deleteFoodEntry(id);
            loadDailyData();
          } catch (error) {
            Alert.alert("Error", "Failed to delete entry");
          }
        },
      },
    ]);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getCalorieProgress = () => {
    const consumed = dailyData?.totals.calories || 0;
    return Math.min((consumed / calorieGoal) * 100, 100);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-green-100 w-24 h-24 rounded-full items-center justify-center mb-6">
            <Ionicons name="nutrition" size={48} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-purple-900 text-center mb-2">
            Track Your Calories
          </Text>
          <Text className="text-purple-600 text-center mb-8">
            Sign in to track calories, scan barcodes, and monitor your
            nutrition!
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 py-4">
          <Text className="text-3xl font-bold text-purple-900">Calories</Text>
          <Text className="text-purple-600">Track your daily nutrition</Text>
        </View>

        {/* Date Navigation */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
            <TouchableOpacity
              onPress={() => navigateDate("prev")}
              className="p-2"
            >
              <Ionicons name="chevron-back" size={24} color="#6b21a8" />
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-lg font-bold text-purple-900">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
              </Text>
              <Text className="text-purple-600 text-sm">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigateDate("next")}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={24} color="#6b21a8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calorie Summary Card */}
        <View className="px-5 mb-6">
          <View className="bg-purple-700 rounded-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-white/70 text-sm">Consumed</Text>
                <Text className="text-white text-3xl font-bold">
                  {dailyData?.totals.calories || 0}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white/70 text-sm">Goal</Text>
                <Text className="text-white text-xl font-semibold">
                  {calorieGoal}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="bg-white/20 h-3 rounded-full overflow-hidden">
              <View
                className="bg-green-400 h-full rounded-full"
                style={{ width: `${getCalorieProgress()}%` }}
              />
            </View>
            <Text className="text-white/70 text-sm mt-2 text-center">
              {Math.max(calorieGoal - (dailyData?.totals.calories || 0), 0)}{" "}
              calories remaining
            </Text>

            {/* Macros */}
            <View className="flex-row justify-between mt-4 pt-4 border-t border-white/20">
              <View className="items-center flex-1">
                <Text className="text-white text-lg font-bold">
                  {dailyData?.totals.protein || 0}g
                </Text>
                <Text className="text-white/70 text-xs">Protein</Text>
              </View>
              <View className="items-center flex-1 border-x border-white/20">
                <Text className="text-white text-lg font-bold">
                  {dailyData?.totals.carbs || 0}g
                </Text>
                <Text className="text-white/70 text-xs">Carbs</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-white text-lg font-bold">
                  {dailyData?.totals.fat || 0}g
                </Text>
                <Text className="text-white/70 text-xs">Fat</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(true);
                setScannedProduct(null);
              }}
              className="flex-1 bg-white rounded-2xl p-4 mr-2 items-center border border-purple-100"
            >
              <Ionicons name="search" size={28} color="#6b21a8" />
              <Text className="text-purple-900 font-semibold mt-2">
                Search Food
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!permission?.granted) {
                  requestPermission();
                } else {
                  setShowScanner(true);
                }
              }}
              className="flex-1 bg-white rounded-2xl p-4 ml-2 items-center border border-purple-100"
            >
              <Ionicons name="barcode" size={28} color="#6b21a8" />
              <Text className="text-purple-900 font-semibold mt-2">
                Scan Barcode
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Food Entries by Meal Type */}
        {loading ? (
          <ActivityIndicator size="large" color="#6b21a8" className="mt-10" />
        ) : (
          <View className="px-5 mb-10">
            {MEAL_TYPES.map((mealType) => {
              const entries =
                dailyData?.entries.filter((e) => e.mealType === mealType) || [];
              const mealCalories = entries.reduce(
                (sum, e) => sum + e.calories,
                0
              );

              return (
                <View key={mealType} className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Ionicons
                        name={MEAL_ICONS[mealType] as any}
                        size={20}
                        color="#6b21a8"
                      />
                      <Text className="text-lg font-bold text-purple-900 ml-2 capitalize">
                        {mealType}
                      </Text>
                    </View>
                    <Text className="text-purple-600 font-semibold">
                      {mealCalories} cal
                    </Text>
                  </View>

                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <TouchableOpacity
                        key={entry._id}
                        onLongPress={() =>
                          entry._id && deleteFoodEntry(entry._id)
                        }
                        className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-gray-100"
                      >
                        {entry.imageUrl && (
                          <Image
                            source={{ uri: entry.imageUrl }}
                            className="w-12 h-12 rounded-lg mr-3"
                          />
                        )}
                        <View className="flex-1">
                          <Text
                            className="text-gray-900 font-medium"
                            numberOfLines={1}
                          >
                            {entry.foodName}
                          </Text>
                          {entry.brand && (
                            <Text className="text-gray-500 text-xs">
                              {entry.brand}
                            </Text>
                          )}
                        </View>
                        <Text className="text-purple-700 font-bold">
                          {entry.calories} cal
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMealType(mealType);
                        setShowAddModal(true);
                      }}
                      className="bg-gray-100 rounded-xl p-4 flex-row items-center justify-center"
                    >
                      <Ionicons name="add-circle" size={20} color="#9CA3AF" />
                      <Text className="text-gray-400 ml-2">Add {mealType}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Barcode Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <SafeAreaView className="flex-1 bg-black">
          <View className="flex-1">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "code128",
                  "code39",
                ],
              }}
              onBarcodeScanned={handleBarcodeScan}
            />
            <View className="absolute top-0 left-0 right-0 p-5">
              <TouchableOpacity
                onPress={() => setShowScanner(false)}
                className="bg-white/20 self-start p-3 rounded-full"
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View className="absolute bottom-10 left-0 right-0 items-center">
              <Text className="text-white text-lg font-semibold">
                Point at a barcode to scan
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Food Modal */}
      <Modal visible={showAddModal} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setScannedProduct(null);
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Ionicons name="close" size={28} color="#6b21a8" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-purple-900">Add Food</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Meal Type Selector */}
          <View className="px-5 py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedMealType(type)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    selectedMealType === type ? "bg-purple-700" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-semibold capitalize ${
                      selectedMealType === type ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {scannedProduct ? (
            // Show scanned product
            <View className="px-5 flex-1">
              <View className="bg-green-50 rounded-2xl p-4 mb-4 items-center">
                {scannedProduct.imageUrl && (
                  <Image
                    source={{ uri: scannedProduct.imageUrl }}
                    className="w-24 h-24 rounded-xl mb-3"
                  />
                )}
                <Text className="text-xl font-bold text-gray-900 text-center">
                  {scannedProduct.foodName}
                </Text>
                {scannedProduct.brand && (
                  <Text className="text-gray-500">{scannedProduct.brand}</Text>
                )}
              </View>

              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-lg font-bold text-purple-900 mb-3">
                  Nutrition Facts
                </Text>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Calories</Text>
                  <Text className="font-bold text-gray-900">
                    {scannedProduct.calories}
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Protein</Text>
                  <Text className="font-bold text-gray-900">
                    {scannedProduct.protein}g
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Carbs</Text>
                  <Text className="font-bold text-gray-900">
                    {scannedProduct.carbs}g
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-gray-600">Fat</Text>
                  <Text className="font-bold text-gray-900">
                    {scannedProduct.fat}g
                  </Text>
                </View>
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-600">Sugar</Text>
                  <Text className="font-bold text-gray-900">
                    {scannedProduct.sugar}g
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={addScannedProduct}
                className="bg-purple-700 rounded-2xl py-4 mt-6"
              >
                <Text className="text-white font-bold text-lg text-center">
                  Add to {selectedMealType}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Search interface
            <View className="flex-1 px-5">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-4">
                <Ionicons name="search" size={20} color="#6b21a8" />
                <TextInput
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholder="Search for food..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                  returnKeyType="search"
                  // Removed onSubmitEditing since we have debounce now (but can keep it for immediate)
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {searching ? (
                  <ActivityIndicator
                    size="large"
                    color="#6b21a8"
                    className="mt-10"
                  />
                ) : searchResults.length > 0 ? (
                  searchResults.map((meal) => (
                    <TouchableOpacity
                      key={meal.idMeal}
                      onPress={() => addFoodFromMeal(meal)}
                      className="bg-white rounded-xl p-3 mb-2 flex-row items-center border border-gray-100"
                      disabled={addingFoodId === meal.idMeal}
                    >
                      <Image
                        source={{ uri: `${meal.strMealThumb}/preview` }}
                        className="w-14 h-14 rounded-lg mr-3"
                      />
                      <View className="flex-1">
                        <Text
                          className="text-gray-900 font-medium"
                          numberOfLines={1}
                        >
                          {meal.strMeal}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {meal.strCategory}
                        </Text>
                      </View>
                      {addingFoodId === meal.idMeal ? (
                        <ActivityIndicator size="small" color="#6b21a8" />
                      ) : (
                        <Ionicons name="add-circle" size={24} color="#6b21a8" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : searchQuery.length > 0 ? (
                  <View className="items-center mt-10">
                    <Ionicons name="search-outline" size={60} color="#E5E7EB" />
                    <Text className="text-gray-400 mt-4">No results found</Text>
                  </View>
                ) : (
                  <View className="items-center mt-10">
                    <Ionicons
                      name="nutrition-outline"
                      size={60}
                      color="#E5E7EB"
                    />
                    <Text className="text-gray-400 mt-4">
                      Search for food to add
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
