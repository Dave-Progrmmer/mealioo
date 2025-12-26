import MealPlan from "../models/mealPlan.model.js";

// @desc    Create a new meal plan
// @route   POST /api/mealplans
// @access  Private
export const createMealPlan = async (req, res) => {
  try {
    const { userId, date, meals, totalCalories } = req.body;

    // Check if a meal plan already exists for this user and date
    const existingPlan = await MealPlan.findOne({
      user: userId,
      date: new Date(date),
    });

    if (existingPlan) {
      return res.status(400).json({
        message: "A meal plan already exists for this date",
      });
    }

    const mealPlan = new MealPlan({
      user: userId,
      date: new Date(date),
      meals,
      totalCalories,
    });

    await mealPlan.save();
    const populatedPlan = await MealPlan.findById(mealPlan._id)
      .populate("user", "name email")
      .populate({
        path: "meals.breakfast.post meals.lunch.post meals.dinner.post meals.snacks.post",
        select: "title content image ingredients",
      });

    res.status(201).json(populatedPlan);
  } catch (error) {
    res.status(500).json({
      message: "Error creating meal plan",
      error: error.message,
    });
  }
};

// @desc    Get all meal plans for a user
// @route   GET /api/mealplans/user/:userId
// @access  Private
export const getUserMealPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { user: userId };

    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const mealPlans = await MealPlan.find(query)
      .populate("user", "name email")
      .populate({
        path: "meals.breakfast.post meals.lunch.post meals.dinner.post meals.snacks.post",
        select: "title content image ingredients instructions category",
      })
      .sort({ date: 1 });

    res.status(200).json(mealPlans);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching meal plans",
      error: error.message,
    });
  }
};

// @desc    Get a single meal plan by ID
// @route   GET /api/mealplans/:id
// @access  Private
export const getMealPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findById(id)
      .populate("user", "name email")
      .populate({
        path: "meals.breakfast.post meals.lunch.post meals.dinner.post meals.snacks.post",
        select: "title content image ingredients instructions category",
      });

    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching meal plan",
      error: error.message,
    });
  }
};

// @desc    Update a meal plan
// @route   PUT /api/mealplans/:id
// @access  Private
export const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const mealPlan = await MealPlan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate({
        path: "meals.breakfast.post meals.lunch.post meals.dinner.post meals.snacks.post",
        select: "title content image ingredients instructions category",
      });

    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({
      message: "Error updating meal plan",
      error: error.message,
    });
  }
};

// @desc    Delete a meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
export const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findByIdAndDelete(id);

    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting meal plan",
      error: error.message,
    });
  }
};

// @desc    Mark meal plan as completed
// @route   PATCH /api/mealplans/:id/complete
// @access  Private
export const completeMealPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const mealPlan = await MealPlan.findByIdAndUpdate(
      id,
      { completed: true },
      { new: true }
    )
      .populate("user", "name email")
      .populate({
        path: "meals.breakfast.post meals.lunch.post meals.dinner.post meals.snacks.post",
        select: "title content image ingredients instructions category",
      });

    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({
      message: "Error completing meal plan",
      error: error.message,
    });
  }
};

// @desc    Get meal plan for a specific date
// @route   GET /api/mealplans/user/:userId/date/:date
// @access  Private
export const getMealPlanByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;

    const mealPlan = await MealPlan.findOne({
      user: userId,
      date: new Date(date),
    })
      .populate("user", "name email")
      .populate({
        path: "meals.breakfast.post meals.lunch.post meals.dinner.post meals.snacks.post",
        select: "title content image ingredients instructions category",
      });

    if (!mealPlan) {
      return res
        .status(404)
        .json({ message: "No meal plan found for this date" });
    }

    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching meal plan",
      error: error.message,
    });
  }
};
