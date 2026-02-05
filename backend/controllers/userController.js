const Destination = require('../models/Destination');
const User = require('../models/User');

exports.getGuides = async (req, res) => {
  try {
    const { city } = req.query;
    let query = { role: 'guide' };
    
    if (city) {
      // Case-insensitive partial match
      query.location = { $regex: city, $options: 'i' };
    }
    
    const guides = await User.find(query).select('-password');
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVisitedLocations = async (req, res) => {
  try {
    // Return full destination objects
    const visited = await Destination.find({ id: { $in: req.user.visitedLocations } });
    res.json(visited);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markVisited = async (req, res) => {
  const { destinationId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user.visitedLocations.includes(destinationId)) {
      user.visitedLocations.push(destinationId);
      await user.save();
    }
    res.json(user.visitedLocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.location) user.location = req.body.location;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.hourlyRate) user.hourlyRate = req.body.hourlyRate;
    if (req.body.languages) user.languages = req.body.languages;
    
    // Don't update password here for now to keep it simple
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      location: updatedUser.location,
      bio: updatedUser.bio,
      hourlyRate: updatedUser.hourlyRate,
      languages: updatedUser.languages,
      visitedLocations: updatedUser.visitedLocations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
