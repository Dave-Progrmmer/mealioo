import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

const ProfileItem = ({
  icon,
  title,
  subtitle,
  color = "#6b21a8",
  onPress,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 px-5 border-b border-purple-50"
  >
    <View className={`p-2 rounded-2xl bg-purple-50`}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View className="flex-1 ml-4">
      <Text className="text-purple-900 font-semibold text-base">{title}</Text>
      {subtitle && <Text className="text-purple-400 text-xs">{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#c084fc" />
  </TouchableOpacity>
);

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: any;
}) => (
  <View className="flex-1 bg-white p-4 rounded-3xl items-center shadow-sm border border-purple-50">
    <View className="bg-purple-50 p-2 rounded-full mb-2">
      <Ionicons name={icon} size={20} color="#6b21a8" />
    </View>
    <Text className="text-purple-900 font-bold text-lg">{value}</Text>
    <Text className="text-purple-400 text-xs">{label}</Text>
  </View>
);

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [helpModalVisible, setHelpModalVisible] = React.useState(false);
  const [helpSubject, setHelpSubject] = React.useState("");
  const [helpMessage, setHelpMessage] = React.useState("");
  const [submittingHelp, setSubmittingHelp] = React.useState(false);

  const handleSubmitHelp = () => {
    if (!helpSubject || !helpMessage) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmittingHelp(true);
    // Simulate API call
    setTimeout(() => {
      setSubmittingHelp(false);
      setHelpModalVisible(false);
      setHelpSubject("");
      setHelpMessage("");
      Alert.alert("Success", "Your request has been sent to our support team!");
    }, 1500);
  };

  const handleLogout = async () => {
    await logout();
    // Use string literal if typed routes are being tricky
    router.replace("/(auth)/login" as any);
  };

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#6b21a8",
            marginBottom: 20,
          }}
        >
          You are not logged in
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#6b21a8",
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 12,
          }}
          onPress={() => router.push("/(auth)/login" as any)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Log In / Register
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center px-5 pt-8 pb-6">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-purple-200 overflow-hidden">
              <Image
                source={{
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6b21a8&color=fff`,
                }}
                className="w-full h-full"
              />
            </View>
            <TouchableOpacity className="absolute bottom-1 right-1 bg-purple-600 p-2 rounded-full border-2 border-white shadow-lg">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-purple-900 mt-4">
            {user.name}
          </Text>
          <View className="bg-purple-100 px-3 py-1 rounded-full mt-2">
            <Text className="text-purple-700 font-semibold text-xs uppercase tracking-wider">
              {user.email}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3 px-5 mb-8">
          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push("/favorites" as any)}
          >
            <StatCard
              icon="heart"
              value={user.favorites?.length.toString() || "0"}
              label="Favorites"
            />
          </TouchableOpacity>
          <StatCard icon="calendar" value="0" label="My Plans" />
          <StatCard icon="star" value="0" label="Activity" />
        </View>

        {/* Menu Sections */}
        <View className="px-5 mb-10">
          <View className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-purple-50">
            <View className="p-5 pb-1">
              <Text className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                Meal Preferences
              </Text>
            </View>
            <ProfileItem
              icon="leaf"
              title="Dietary Restrictions"
              subtitle={
                user.dietaryRestrictions?.length > 0
                  ? user.dietaryRestrictions.join(", ")
                  : "None set"
              }
            />
            <ProfileItem
              icon="restaurant"
              title="Favorite Cuisines"
              subtitle={
                user.favoriteCuisines?.length > 0
                  ? user.favoriteCuisines.join(", ")
                  : "None set"
              }
            />

            <View className="p-5 pb-1 mt-2">
              <Text className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                Account & Settings
              </Text>
            </View>
            <ProfileItem icon="person" title="Personal Information" />
            <ProfileItem icon="notifications" title="Notifications" />
            <ProfileItem icon="shield-checkmark" title="Privacy & Security" />

            <View className="p-5 pb-1 mt-2">
              <Text className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                Support
              </Text>
            </View>
            <ProfileItem
              icon="help-circle"
              title="Help Center"
              onPress={() => setHelpModalVisible(true)}
            />
            <ProfileItem icon="information-circle" title="About Mealio" />

            <TouchableOpacity
              className="flex-row items-center py-5 px-5 mt-2 bg-red-50"
              onPress={handleLogout}
            >
              <View className="p-2 rounded-2xl bg-red-100/50">
                <Ionicons name="log-out" size={22} color="#EF4444" />
              </View>
              <Text className="flex-1 ml-4 text-red-600 font-bold text-base">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Help Center Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[40px] p-8 h-[80%]">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold text-purple-900">
                Support Center
              </Text>
              <TouchableOpacity
                onPress={() => setHelpModalVisible(false)}
                className="bg-purple-50 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#6b21a8" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3">
              Subject
            </Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-2xl border border-purple-100 text-purple-900 mb-6"
              placeholder="How can we help?"
              value={helpSubject}
              onChangeText={setHelpSubject}
              placeholderTextColor="#9ca3af"
            />

            <Text className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3">
              Message
            </Text>
            <TextInput
              className="bg-gray-50 p-4 rounded-2xl border border-purple-100 text-purple-900 mb-8 h-40"
              placeholder="Describe your issue in detail..."
              value={helpMessage}
              onChangeText={setHelpMessage}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              className={`bg-purple-800 p-5 rounded-3xl shadow-lg items-center ${submittingHelp ? "opacity-70" : ""}`}
              onPress={handleSubmitHelp}
              disabled={submittingHelp}
            >
              {submittingHelp ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Send Feedback
                </Text>
              )}
            </TouchableOpacity>

            <Text className="text-center text-purple-300 text-xs mt-6">
              Our team typically responds within 24 hours.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
