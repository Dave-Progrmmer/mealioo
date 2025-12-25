import express from "express";
const router = express.Router();
import * as authController from "../controllers/auth.controller.js";

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authController.login);

export default router;
