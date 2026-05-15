const User = require('../models/User');
const { generateToken, validateEmail, validatePassword } = require('../utils/helpers');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      return res.status(409).json({ error: 'Username is already taken' });
    }

    // Create new User
    // Note: Password hashing is handled by the pre-save hook in User model
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.email);

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.email);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Token invalidation is generally handled on the frontend for stateless JWTs.
    // If you add a token blacklist later, logic goes here.
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { oldToken } = req.body;

    if (!oldToken) {
      return res.status(400).json({ error: 'Old token is required' });
    }

    const jwt = require('jsonwebtoken');

    try {
      // Verify token, ignoring expiration so we can decode expired ones
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
      
      // Generate a fresh token using the same payload info
      const newToken = generateToken(decoded.userId || decoded.id, decoded.email);

      res.status(200).json({
        message: 'Token refreshed successfully',
        token: newToken,
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token provided for refresh' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'An error occurred while refreshing token' });
  }
};
