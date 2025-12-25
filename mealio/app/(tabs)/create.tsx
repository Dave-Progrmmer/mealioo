import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../services/api";
import { backendService } from "../../services/backend.service";
import { Category } from "../../types/meal";

export default function CreatePostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Beef");
  const [customCategory, setCustomCategory] = useState("");
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.fetchCategories();
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      // For simplicity in this demo, we'll store the URI.
      // In a real app, you might upload this to S3/Cloudinary or send as base64.
      setImage(result.assets[0].uri);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const updateIngredient = (text: string, index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addInstruction = () => setInstructions([...instructions, ""]);
  const updateInstruction = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleCreatePost = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const finalCategory = isOtherCategory ? customCategory : selectedCategory;
      await backendService.createPost({
        title,
        content,
        image: image || "",
        category: finalCategory,
        ingredients: ingredients.filter((i) => i.trim() !== ""),
        instructions: instructions.filter((i) => i.trim() !== ""),
      });
      Alert.alert("Success", "Recipe posted successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="#6b21a8" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-purple-900">
              New Recipe
            </Text>
            <TouchableOpacity onPress={handleCreatePost} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#6b21a8" />
              ) : (
                <Text className="text-purple-800 font-bold text-lg">Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="p-5">
            {/* Image Picker */}
            <TouchableOpacity
              onPress={pickImage}
              className="w-full h-48 bg-purple-50 rounded-3xl items-center justify-center border-2 border-dashed border-purple-200 overflow-hidden mb-6"
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Ionicons name="camera" size={40} color="#6b21a8" />
                  <Text className="text-purple-600 font-medium mt-2">
                    Add Photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Title */}
            <TextInput
              placeholder="Recipe Title"
              value={title}
              onChangeText={setTitle}
              className="text-2xl font-bold text-purple-900 mb-4"
              placeholderTextColor="#d1d5db"
            />

            {/* Categories */}
            <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.idCategory}
                  onPress={() => {
                    setSelectedCategory(cat.strCategory);
                    setIsOtherCategory(false);
                  }}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    !isOtherCategory && selectedCategory === cat.strCategory
                      ? "bg-purple-800 border-purple-800"
                      : "bg-white border-purple-100"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      !isOtherCategory && selectedCategory === cat.strCategory
                        ? "text-white"
                        : "text-purple-600"
                    }`}
                  >
                    {cat.strCategory}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setIsOtherCategory(true)}
                className={`px-4 py-2 rounded-full border ${
                  isOtherCategory
                    ? "bg-purple-800 border-purple-800"
                    : "bg-white border-purple-100"
                }`}
              >
                <Text
                  className={`font-semibold ${isOtherCategory ? "text-white" : "text-purple-600"}`}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {isOtherCategory && (
              <TextInput
                placeholder="Enter custom category"
                value={customCategory}
                onChangeText={setCustomCategory}
                className="bg-gray-50 p-4 rounded-2xl text-purple-900 mb-6 border border-purple-100"
                placeholderTextColor="#9ca3af"
              />
            )}

            {/* Content / Description */}
            <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3">
              Description
            </Text>
            <TextInput
              placeholder="Describe your delicious masterpiece..."
              value={content}
              onChangeText={setContent}
              className="bg-gray-50 p-4 rounded-2xl text-purple-900 mb-6 min-h-[100] border border-purple-100"
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />

            {/* Ingredients */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest">
                Ingredients
              </Text>
              <TouchableOpacity onPress={addIngredient}>
                <Ionicons name="add-circle" size={24} color="#6b21a8" />
              </TouchableOpacity>
            </View>
            {ingredients.map((item, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <TextInput
                  placeholder={`Ingredient ${index + 1}`}
                  value={item}
                  onChangeText={(text) => updateIngredient(text, index)}
                  className="flex-1 bg-gray-50 p-4 rounded-2xl text-purple-900 border border-purple-100"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => removeIngredient(index)}
                  className="ml-2"
                >
                  <Ionicons name="remove-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Instructions */}
            <View className="flex-row justify-between items-center mt-6 mb-3">
              <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest">
                Instructions
              </Text>
              <TouchableOpacity onPress={addInstruction}>
                <Ionicons name="add-circle" size={24} color="#6b21a8" />
              </TouchableOpacity>
            </View>
            {instructions.map((item, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center mt-2 mr-2">
                  <Text className="text-purple-800 font-bold">{index + 1}</Text>
                </View>
                <TextInput
                  placeholder={`Step ${index + 1}`}
                  value={item}
                  onChangeText={(text) => updateInstruction(text, index)}
                  className="flex-1 bg-gray-50 p-4 rounded-2xl text-purple-900 border border-purple-100 min-h-[80]"
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => removeInstruction(index)}
                  className="ml-2 mt-2"
                >
                  <Ionicons name="remove-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
