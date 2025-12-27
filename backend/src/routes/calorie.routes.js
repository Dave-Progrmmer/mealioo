import express from "express";
const router = express.Router();
import * as calorieController from "../controllers/calorie.controller.js";

// @route   POST /api/calories
// @desc    Add a new food entry
// @access  Private
router.post("/", calorieController.addFoodEntry);

// @route   GET /api/calories/user/:userId/date/:date
// @desc    Get food entries for a specific date
// @access  Private
router.get("/user/:userId/date/:date", calorieController.getFoodEntriesByDate);

// @route   GET /api/calories/user/:userId/summary
// @desc    Get food entries summary for date range
// @access  Private
router.get("/user/:userId/summary", calorieController.getFoodEntriesSummary);

// @route   GET /api/calories/barcode/:barcode
// @desc    Search for food by barcode (Open Food Facts)
// @access  Private
router.get("/barcode/:barcode", calorieController.searchByBarcode);

// @route   PUT /api/calories/:id
// @desc    Update a food entry
// @access  Private
router.put("/:id", calorieController.updateFoodEntry);

// @route   DELETE /api/calories/:id
// @desc    Delete a food entry
// @access  Private
router.delete("/:id", calorieController.deleteFoodEntry);

export default router;
