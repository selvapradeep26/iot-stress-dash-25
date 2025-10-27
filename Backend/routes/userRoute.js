const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to verify token
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ GET /api/users/me (used by fetchUserProfile in api.ts)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      occupation: user.occupation || "Not specified",
      lastLogin: user.lastLogin || null,
    });
  } catch (err) {
    console.error("Fetch user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/users/updateOccupation/:id (used by updateUserOccupation)
router.put("/updateOccupation/:id", async (req, res) => {
  try {
    const { occupation } = req.body;

    if (!occupation || occupation.trim() === "") {
      return res.status(400).json({ message: "Occupation is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { occupation: occupation.trim() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Occupation updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        occupation: user.occupation,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("Update occupation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
