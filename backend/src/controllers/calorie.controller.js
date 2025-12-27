import FoodEntry from "../models/foodEntry.model.js";

// @desc    Add a food entry
// @route   POST /api/calories
// @access  Private
export const addFoodEntry = async (req, res) => {
  try {
    const foodEntry = new FoodEntry(req.body);
    await foodEntry.save();
    res.status(201).json(foodEntry);
  } catch (error) {
    res.status(500).json({
      message: "Error adding food entry",
      error: error.message,
    });
  }
};

// @desc    Get food entries for a user on a specific date
// @route   GET /api/calories/user/:userId/date/:date
// @access  Private
export const getFoodEntriesByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;

    // Create date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const entries = await FoodEntry.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 });

    // Calculate totals
    const totals = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
        fiber: acc.fiber + entry.fiber,
        sugar: acc.sugar + entry.sugar,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
    );

    res.status(200).json({
      entries,
      totals,
      date: date,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching food entries",
      error: error.message,
    });
  }
};

// @desc    Get food entries summary for a date range
// @route   GET /api/calories/user/:userId/summary
// @access  Private
export const getFoodEntriesSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const entries = await FoodEntry.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalCalories: { $sum: "$calories" },
          totalProtein: { $sum: "$protein" },
          totalCarbs: { $sum: "$carbs" },
          totalFat: { $sum: "$fat" },
          entryCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching summary",
      error: error.message,
    });
  }
};

// @desc    Update a food entry
// @route   PUT /api/calories/:id
// @access  Private
export const updateFoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const foodEntry = await FoodEntry.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!foodEntry) {
      return res.status(404).json({ message: "Food entry not found" });
    }

    res.status(200).json(foodEntry);
  } catch (error) {
    res.status(500).json({
      message: "Error updating food entry",
      error: error.message,
    });
  }
};

// @desc    Delete a food entry
// @route   DELETE /api/calories/:id
// @access  Private
export const deleteFoodEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const foodEntry = await FoodEntry.findByIdAndDelete(id);

    if (!foodEntry) {
      return res.status(404).json({ message: "Food entry not found" });
    }

    res.status(200).json({ message: "Food entry deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting food entry",
      error: error.message,
    });
  }
};

// @desc    Search for a food by barcode (uses Open Food Facts API)
// @route   GET /api/calories/barcode/:barcode
// @access  Private
export const searchByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    // Using Open Food Facts API (free, no key required)
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    res.status(200).json({
      barcode: barcode,
      foodName: product.product_name || "Unknown Product",
      brand: product.brands || null,
      imageUrl: product.image_url || null,
      servingSize: product.serving_quantity || 100,
      servingUnit: product.serving_size || "g",
      calories: Math.round(
        nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0
      ),
      protein: Math.round(nutriments.proteins_100g || 0),
      carbs: Math.round(nutriments.carbohydrates_100g || 0),
      fat: Math.round(nutriments.fat_100g || 0),
      fiber: Math.round(nutriments.fiber_100g || 0),
      sugar: Math.round(nutriments.sugars_100g || 0),
      sodium: Math.round(nutriments.sodium_100g || 0),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching for product",
      error: error.message,
    });
  }
};
