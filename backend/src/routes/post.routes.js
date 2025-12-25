import express from "express";
const router = express.Router();
import * as postController from "../controllers/post.controller.js";
import auth from "../middleware/auth.middleware.js";

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post("/", auth, postController.createPost);

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get("/", postController.getPosts);

// @route   POST /api/posts/favorite/:id
// @desc    Toggle favorite
// @access  Private
router.post("/favorite/:id", auth, postController.toggleFavorite);

export default router;
