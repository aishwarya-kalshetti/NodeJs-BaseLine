const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashed });
    console.log(`✅ New user registered: ${user.name} (${user.email})`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify/${token}`;

    // Check if email is configured
    if (process.env.EMAIL_USER === 'your-email@gmail.com' || process.env.EMAIL_PASS === 'your-app-password') {
      // Email not configured, skip verification for demo
      await User.findByIdAndUpdate(user._id, { isVerified: true });
      res.status(201).json({ 
        message: 'User created successfully! Email verification skipped (not configured). You can login now.',
        warning: 'Email verification is disabled - configure EMAIL_USER and EMAIL_PASS in .env to enable'
      });
    } else {
      try {
        await sendEmail(user.email, 'Verify your email', `<h3>Click to verify:</h3><a href="${verifyLink}">${verifyLink}</a>`);
        res.status(201).json({ message: 'Verification email sent!' });
      } catch (emailError) {
        // If email fails, still create user but inform about email issue
        console.error('Email sending failed:', emailError);
        res.status(201).json({ 
          message: 'User created but verification email failed to send. Please try logging in.',
          warning: 'Email verification may not work properly'
        });
      }
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    
    // Return JSON response for better frontend integration
    res.json({ 
      success: true, 
      message: 'Email verified successfully!' 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    console.log(`✅ User logged in: ${user.name} (${user.email})`);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
