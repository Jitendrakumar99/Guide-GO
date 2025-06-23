const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      location: req.body.location
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 