import express from "express";
const router = express.Router();
import * as userController from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, userController.updateProfile);

export default router;
