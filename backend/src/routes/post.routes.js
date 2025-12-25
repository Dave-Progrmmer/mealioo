const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const auth = require("../middleware/auth.middleware");

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

module.exports = router;
