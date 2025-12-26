import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      router.replace("/" as any);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="px-6 py-12 justify-center"
          className=""
        >
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-purple-100 rounded-3xl items-center justify-center mb-6 shadow-sm">
              <Ionicons name="restaurant" size={40} color="#6b21a8" />
            </View>
            <Text className="text-4xl font-bold text-purple-900 text-center">
              Welcome Back
            </Text>
            <Text className="text-purple-600 mt-2 text-center text-lg">
              Sign in to continue your culinary journey.
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-bold text-purple-900 mb-2 ml-1">
                Email Address
              </Text>
              <View className="bg-gray-50 flex-row items-center p-4 rounded-2xl border border-gray-100">
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#6b21a8"
                  className="mr-3"
                />
                <TextInput
                  className="flex-1 text-purple-900 ml-2"
                  placeholder="email@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-purple-900 mb-2 ml-1">
                Password
              </Text>
              <View className="bg-gray-50 flex-row items-center p-4 rounded-2xl border border-gray-100">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6b21a8"
                  className="mr-3"
                />
                <TextInput
                  className="flex-1 text-purple-900 ml-2"
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
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

            <TouchableOpacity className="items-end mt-2">
              <Text className="text-purple-600 font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`bg-purple-800 p-5 rounded-3xl shadow-lg items-center mt-8 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <Text className="text-white font-bold text-lg mr-2">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">Login</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-8">
              <Text className="text-purple-600">Don't have an account? </Text>
              <Link href={"/register" as any} asChild>
                <TouchableOpacity>
                  <Text className="text-purple-800 font-bold">Register</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
