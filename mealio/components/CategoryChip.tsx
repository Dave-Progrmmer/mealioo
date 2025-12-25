import React from "react";
import { Image, Text, TouchableOpacity } from "react-native";
import { Category } from "../types/meal";

interface CategoryChipProps {
  category: Category;
  isActive: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${
        isActive
          ? "bg-purple-600 border-purple-600"
          : "bg-white border-gray-200"
      }`}
    >
      <Image
        source={{ uri: category.strCategoryThumb }}
        className="w-6 h-6 mr-2"
        resizeMode="contain"
      />
      <Text
        className={`font-semibold ${isActive ? "text-white" : "text-gray-600"}`}
      >
        {category.strCategory}
      </Text>
    </TouchableOpacity>
  );
};
