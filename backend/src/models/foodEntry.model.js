import mongoose from "mongoose";

const foodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      default: null,
    },
    brand: {
      type: String,
      default: null,
    },
    servingSize: {
      type: Number,
      default: 1,
    },
    servingUnit: {
      type: String,
      default: "serving",
    },
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
    sodium: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by user and date
foodEntrySchema.index({ user: 1, date: 1 });

export default mongoose.model("FoodEntry", foodEntrySchema);
