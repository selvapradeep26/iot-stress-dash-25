const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ----------------------
// Generate JWT token
// ----------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ----------------------
// Signup
// ----------------------
exports.signup = async (req, res) => {
  let { username, email, password, occupation } = req.body;

  try {
    email = email.trim().toLowerCase();
    username = username.trim();
    password = password.trim();

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // ✅ Check for duplicate username OR email
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already exists' });
    }

    // ✅ Set lastLogin when account is created
    const user = new User({
      username,
      email,
      password,
      occupation,
      lastLogin: new Date(),
    });

    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username,
        email,
        occupation: user.occupation,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);

    // ✅ Handle Mongo duplicate key error gracefully
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------
// Login
// ----------------------
exports.login = async (req, res) => {
  let { email, password } = req.body;

  try {
    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Update lastLogin each time user logs in
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email,
        occupation: user.occupation,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
