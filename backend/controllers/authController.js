const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, role: requestedRole } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Map requested roles to stored roles
  let role = 'user';
  if (requestedRole === 'hotel') role = 'hotel';
  if (requestedRole === 'agent') role = 'agent';
  if (requestedRole === 'guide') role = 'guide';
  if (requestedRole === 'tourist') role = 'user';

  const user = await User.create({ name, email, password, role });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      visitedLocations: user.visitedLocations,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role: requestedRole } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // If a role is requested, ensure it matches the user's role
    if (requestedRole) {
      const normalizedRequested = requestedRole === 'tourist' ? 'user' : requestedRole;
      if (user.role !== normalizedRequested) {
        res.status(403);
        throw new Error('Account does not have access to the selected portal');
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      visitedLocations: user.visitedLocations,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});
