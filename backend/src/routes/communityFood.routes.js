import express from "express";
const router = express.Router();
import * as controller from "../controllers/communityFood.controller.js";
import auth from "../middleware/auth.middleware.js";

// Routes
router.post("/", auth, controller.createFood);
router.get("/", auth, controller.getFoods);
router.get("/search", auth, controller.searchCommunityFoods);
router.post("/:id/rate", auth, controller.rateFood);
router.post("/:id/comment", auth, controller.addComment);

export default router;
