const Experience = require('../models/Experience');

exports.getAllExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({});
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
