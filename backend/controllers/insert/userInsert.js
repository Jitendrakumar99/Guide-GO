const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Reusable function for user creation
exports.createUserDirect = async ({ firstName, lastName, email, phone, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = new User({
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    phone,
    password: hashedPassword,
    location: null
  });

  const savedUser = await user.save();
  return savedUser;
};

// The original endpoint for direct signup
exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const savedUser = await exports.createUserDirect({ email, password, firstName, lastName, phone });

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
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 