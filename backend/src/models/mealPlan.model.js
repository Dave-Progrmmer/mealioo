import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
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
    meals: {
      breakfast: {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
        notes: {
          type: String,
          default: "",
        },
      },
      lunch: {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
        notes: {
          type: String,
          default: "",
        },
      },
      dinner: {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
        notes: {
          type: String,
          default: "",
        },
      },
      snacks: [
        {
          post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
          },
          notes: {
            type: String,
            default: "",
          },
        },
      ],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by user and date
mealPlanSchema.index({ user: 1, date: 1 });

export default mongoose.model("MealPlan", mealPlanSchema);
