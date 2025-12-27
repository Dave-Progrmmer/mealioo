import User from "../models/user.model.js";

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // If password provided, update it (hashing handled by pre-save hook presumably,
      // but waiting... user.model.js had no pre-save hook visible in step 300!)
      // In auth.controller.js, hashing is done manually.
      // So if I update password here, I must hash it.
      // For now, I'll SKIP password update logic to keep it simple as user only asked for calorie goal.

      if (req.body.calorieGoal) {
        user.calorieGoal = req.body.calorieGoal;
      }

      // Update other fields if needed

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        favorites: updatedUser.favorites,
        dietaryRestrictions: updatedUser.dietaryRestrictions,
        favoriteCuisines: updatedUser.favoriteCuisines,
        calorieGoal: updatedUser.calorieGoal,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
