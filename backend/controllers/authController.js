const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

exports.signup = async (req, res) => {
  const { name, email, password, role: requestedRole } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Map requested roles to stored roles
    let role = 'user';
    if (requestedRole === 'hotel') role = 'hotel';
    if (requestedRole === 'agent') role = 'agent';
    if (requestedRole === 'guide') role = 'guide';
    if (requestedRole === 'tourist') role = 'user';

    const user = await User.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      visitedLocations: user.visitedLocations,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, role: requestedRole } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // If a role is requested, ensure it matches the user's role
      if (requestedRole) {
        const normalizedRequested = requestedRole === 'tourist' ? 'user' : requestedRole;
        if (user.role !== normalizedRequested) {
          return res.status(403).json({ message: 'Account does not have access to the selected portal' });
        }
      }
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        role: user.role,
        visitedLocations: user.visitedLocations,
        token
      });
    } else {
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
