const Destination = require('../models/Destination');

exports.verifyItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    let Model;
    if (type === 'destination') Model = Destination;
    else return res.status(400).json({ message: 'Invalid type' });

    const item = await Model.findOneAndUpdate({ id }, { verified: true }, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
