const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const defaults = require("../config/defaults");

// CHANGE THIS to your actual User model path
const User = require("../models/User");

router.post("/login", async (req, res) => {
  console.log("LOGIN REQUEST RECEIVED");

  try {
    const { email, password } = req.body;

    console.log("Email:", email);

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // SIMPLE PASSWORD CHECK
    // Replace with bcrypt.compare() if using hashed passwords
    if (user.password !== password) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || "user",
      },
      defaults.jwtSecret,
      {
        expiresIn: defaults.tokenTtl || "12h",
      }
    );

    console.log("LOGIN SUCCESS");

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

module.exports = router;
