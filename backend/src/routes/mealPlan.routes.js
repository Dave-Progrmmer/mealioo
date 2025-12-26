import express from "express";
const router = express.Router();
import * as mealPlanController from "../controllers/mealPlan.controller.js";

// @route   POST /api/mealplans
// @desc    Create a new meal plan
// @access  Private
router.post("/", mealPlanController.createMealPlan);

// @route   GET /api/mealplans/user/:userId
// @desc    Get all meal plans for a user
// @access  Private
router.get("/user/:userId", mealPlanController.getUserMealPlans);

// @route   GET /api/mealplans/user/:userId/date/:date
// @desc    Get meal plan for a specific date
// @access  Private
router.get("/user/:userId/date/:date", mealPlanController.getMealPlanByDate);

// @route   GET /api/mealplans/:id
// @desc    Get a single meal plan by ID
// @access  Private
router.get("/:id", mealPlanController.getMealPlanById);

// @route   PUT /api/mealplans/:id
// @desc    Update a meal plan
// @access  Private
router.put("/:id", mealPlanController.updateMealPlan);

// @route   DELETE /api/mealplans/:id
// @desc    Delete a meal plan
// @access  Private
router.delete("/:id", mealPlanController.deleteMealPlan);

// @route   PATCH /api/mealplans/:id/complete
// @desc    Mark meal plan as completed
// @access  Private
router.patch("/:id/complete", mealPlanController.completeMealPlan);

export default router;
