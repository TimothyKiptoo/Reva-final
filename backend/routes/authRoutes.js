const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN REQUEST RECEIVED");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // SIMPLE PASSWORD CHECK
    // Replace with bcrypt.compare() if passwords are hashed
    if (user.password !== password) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "SECRET",
      {
        expiresIn: "12h",
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
