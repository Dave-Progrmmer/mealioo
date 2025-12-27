import CommunityFood from "../models/communityFood.model.js";

// @desc    Create a new community food
// @route   POST /api/community-foods
// @access  Private
export const createFood = async (req, res) => {
  try {
    const {
      name,
      calories,
      protein,
      carbs,
      fat,
      brand,
      servingSize,
      servingUnit,
    } = req.body;

    const newFood = new CommunityFood({
      name,
      calories,
      protein,
      carbs,
      fat,
      brand,
      servingSize,
      servingUnit,
      createdBy: req.user.id,
    });

    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating food", error: error.message });
  }
};

// @desc    Get all community foods (can filter/sort)
// @route   GET /api/community-foods
// @access  Private
export const getFoods = async (req, res) => {
  try {
    const foods = await CommunityFood.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 }); // Newest first
    res.json(foods);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching foods", error: error.message });
  }
};

// @desc    Rate a food
// @route   POST /api/community-foods/:id/rate
// @access  Private
export const rateFood = async (req, res) => {
  try {
    const { rating } = req.body;
    const food = await CommunityFood.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Check if user already rated
    const existingRatingIndex = food.ratings.findIndex(
      (r) => r.user.toString() === req.user.id
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      food.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      food.ratings.push({ user: req.user.id, rating });
    }

    await food.save();
    res.json(food);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rating food", error: error.message });
  }
};

// @desc    Comment on a food
// @route   POST /api/community-foods/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const food = await CommunityFood.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    const newComment = {
      user: req.user.id,
      text,
    };

    food.comments.push(newComment);
    await food.save();

    // Return populated comments
    await food.populate("comments.user", "name");

    res.json(food);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

// @desc    Search community foods
// @route   GET /api/community-foods/search?query=text
// @access  Private
export const searchCommunityFoods = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    // Simple regex search
    const foods = await CommunityFood.find({
      name: { $regex: query, $options: "i" },
    }).populate("createdBy", "name");

    res.json(foods);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching foods", error: error.message });
  }
};
