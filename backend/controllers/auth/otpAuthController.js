const Otp = require('../../models/otpModel');
const { createUserDirect } = require('../insert/userInsert');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');

exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Upsert OTP
  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt, verified: false },
    { upsert: true, new: true }
  );

  const { sendOtpEmail } = require('../../utils/email');
  await sendOtpEmail(email, otp);
  res.json({ message: 'OTP sent to email' });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });
  if (!record) return res.status(400).json({ message: 'Invalid OTP' });
  if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

  record.verified = true;
  await record.save();
  res.json({ message: 'OTP verified' });
};

exports.completeSignup = async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  const record = await Otp.findOne({ email, verified: true });
  if (!record) return res.status(400).json({ message: 'OTP not verified' });

  try {
    await createUserDirect({ email, password, firstName, lastName, phone });
    await Otp.deleteOne({ email });
    res.status(201).json({ message: 'Signup complete, please login' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ===================== Forgot Password OTP Flow =====================

// 1. Request OTP for password reset
exports.requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'No account found with this email' });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email },
    { otp, expiresAt, verified: false },
    { upsert: true, new: true }
  );

  const { sendOtpEmail } = require('../../utils/email');
  await sendOtpEmail(email, otp);
  res.json({ message: 'OTP sent to email' });
};

// 2. Verify OTP for password reset
exports.verifyPasswordResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email, otp });
  if (!record) return res.status(400).json({ message: 'Invalid OTP' });
  if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

  record.verified = true;
  await record.save();
  res.json({ message: 'OTP verified' });
};

// 3. Reset password
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const record = await Otp.findOne({ email, verified: true });
  if (!record) return res.status(400).json({ message: 'OTP not verified' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No account found with this email' });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();

  await Otp.deleteOne({ email });

  res.json({ message: 'Password reset successful. You can now log in.' });
}; 