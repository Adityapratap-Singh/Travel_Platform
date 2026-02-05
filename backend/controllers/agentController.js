const Agent = require('../models/Agent');
const Destination = require('../models/Destination');
const User = require('../models/User');
const { broadcast } = require('../services/events');

exports.registerAgent = async (req, res) => {
  try {
    const existing = await Agent.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Agent profile already exists' });
    const agent = await Agent.create({
      user: req.user._id,
      name: req.body.name || req.user.name,
      phone: req.body.phone,
      languages: req.body.languages || [],
      city: req.body.city,
      country: req.body.country,
      bio: req.body.bio,
      pricePerDay: req.body.pricePerDay || 0,
      image: req.body.image,
      video: req.body.video
    });
    await User.updateOne({ _id: req.user._id }, { $set: { role: 'agent' } });
    broadcast('agents:created', 'agent_created', agent);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAgents = async (req, res) => {
  const { city, country, destinationId } = req.query;
  try {
    let filter = { verified: true };
    if (city) filter.city = new RegExp(city, 'i');
    if (country) filter.country = new RegExp(country, 'i');
    if (destinationId) {
      const dest = await Destination.findOne({ id: destinationId });
      if (dest?.country) filter.country = new RegExp(dest.country, 'i');
    }
    const agents = await Agent.find(filter).populate('user', 'name email');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findOne({ user: req.user._id });
    if (!agent) return res.status(404).json({ message: 'Agent profile not found' });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
