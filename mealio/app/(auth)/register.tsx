import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Keto",
  "Paleo",
  "Dairy-free",
  "Pescetarian",
];

const CUISINE_OPTIONS = [
  "Italian",
  "Mexican",
  "Japanese",
  "Chinese",
  "Indian",
  "French",
  "Thai",
  "American",
  "Mediterranean",
];

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [progress] = useState(new Animated.Value(0));

  const { register } = useAuth();
  const router = useRouter();

  const toggleOption = (
    option: string,
    list: string[],
    setList: (l: string[]) => void
  ) => {
    if (list.includes(option)) {
      setList(list.filter((i) => i !== option));
    } else {
      setList([...list, option]);
    }
  };

  const handleRegister = async () => {
    try {
      setIsPersonalizing(true);

      // Start loading bar animation
      Animated.timing(progress, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start();

      await register({
        name,
        email,
        password,
        dietaryRestrictions,
        favoriteCuisines,
      });

      // Show the "created" message briefly after animation finishes
      setTimeout(() => {
        router.replace("/" as any);
      }, 2600);
    } catch (error: any) {
      setIsPersonalizing(false);
      progress.setValue(0);
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  if (isPersonalizing) {
    const progressWidth = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <View className="flex-1 bg-white items-center justify-center px-10">
        <StatusBar style="dark" />
        <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-8">
          <Ionicons name="sparkles" size={40} color="#6b21a8" />
        </View>
        <Text className="text-2xl font-bold text-purple-900 mb-2">
          Personalizing Account
        </Text>
        <Text className="text-purple-600 text-center mb-8">
          We're tailoring your Mealio experience...
        </Text>

        <View className="w-full h-3 bg-purple-50 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-purple-700"
            style={{ width: progressWidth }}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-8"
        >
          <View className="mb-10">
            <Text className="text-4xl font-bold text-purple-900">
              Create Account
            </Text>
            <Text className="text-purple-600 mt-2">
              Join the Mealio community today.
            </Text>
          </View>

          {step === 1 ? (
            <View>
              <View className="mb-4">
                <Text className="text-sm font-bold text-purple-900 mb-2 ml-1">
                  Full Name
                </Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-purple-900"
                  placeholder="Full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-purple-900 mb-2 ml-1">
                  Email
                </Text>
                <TextInput
                  className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-purple-900"
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-8">
                <Text className="text-sm font-bold text-purple-900 mb-2 ml-1">
                  Password
                </Text>
                <View className="bg-gray-50 flex-row items-center p-4 rounded-2xl border border-gray-100">
                  <TextInput
                    className="flex-1 text-purple-900"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6b21a8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="bg-purple-800 p-5 rounded-3xl shadow-lg items-center"
                onPress={() => setStep(2)}
              >
                <Text className="text-white font-bold text-lg">Next Step</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">
                Dietary Restrictions
              </Text>
              <View className="flex-row flex-wrap mb-6">
                {DIETARY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() =>
                      toggleOption(
                        opt,
                        dietaryRestrictions,
                        setDietaryRestrictions
                      )
                    }
                    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                      dietaryRestrictions.includes(opt)
                        ? "bg-purple-800 border-purple-800"
                        : "bg-white border-purple-100"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${dietaryRestrictions.includes(opt) ? "text-white" : "text-purple-600"}`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">
                Favorite Cuisines
              </Text>
              <View className="flex-row flex-wrap mb-10">
                {CUISINE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() =>
                      toggleOption(opt, favoriteCuisines, setFavoriteCuisines)
                    }
                    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
                      favoriteCuisines.includes(opt)
                        ? "bg-purple-800 border-purple-800"
                        : "bg-white border-purple-100"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${favoriteCuisines.includes(opt) ? "text-white" : "text-purple-600"}`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 p-5 rounded-3xl items-center"
                  onPress={() => setStep(1)}
                >
                  <Text className="text-purple-900 font-bold text-lg">
                    Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-[2] bg-purple-800 p-5 rounded-3xl shadow-lg items-center"
                  onPress={handleRegister}
                >
                  <Text className="text-white font-bold text-lg">Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View className="mt-8 items-center">
            <Link href={"/login" as any} asChild>
              <TouchableOpacity>
                <Text className="text-purple-600">
                  Already have an account?{" "}
                  <Text className="font-bold">Login</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
