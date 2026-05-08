const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, optionalAuthenticate } = require("../middleware/auth");
const controller = require("../controllers/authController");

const router = express.Router();

router.post("/register", optionalAuthenticate, asyncHandler(controller.register));
router.post("/login", asyncHandler(controller.login));
router.get("/me", authenticate, asyncHandler(controller.me));

module.exports = router;
