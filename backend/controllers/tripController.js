const Trip = require('../models/Trip');

exports.createTrip = async (req, res) => {
  try {
    const { name, destinations, hotel, route, startDate, endDate } = req.body;
    
    const trip = new Trip({
      user: req.user.id,
      name,
      destinations,
      hotel,
      route,
      startDate,
      endDate
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id })
      .populate('destinations')
      .populate('hotel')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('destinations')
      .populate('hotel')
      .populate('user', 'name'); // Only get user name
      
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    if (!trip.isPublic && (!req.user || trip.user._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'This trip is private' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleTripVisibility = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    
    trip.isPublic = !trip.isPublic;
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
