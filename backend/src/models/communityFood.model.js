import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const communityFoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // For search capability
    },
    brand: {
      type: String,
      trim: true,
      default: null,
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
    servingSize: {
      type: Number,
      default: 100,
    },
    servingUnit: {
      type: String,
      default: "g",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
    imageUrl: {
      type: String,
      default: null,
    },
    isCommunity: {
      type: Boolean,
      default: true, // Flag to identify these in mixed lists
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating before saving
communityFoodSchema.pre("save", function (next) {
  if (this.ratings.length > 0) {
    const total = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = total / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

export default mongoose.model("CommunityFood", communityFoodSchema);
