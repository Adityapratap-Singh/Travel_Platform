const Booking = require('../models/Booking');
const Agent = require('../models/Agent');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { broadcast } = require('../services/events');

exports.createBooking = async (req, res) => {
  try {
    const { type, destinationId, startDate, endDate, travelers, totalPrice } = req.body;
    // req.params.id is the entity ID (Agent ID or Hotel ID or Guide ID)
    const entityId = req.params.id;
    
    // Determine type from URL or Body
    // If route contains 'agents', assume agent. If 'hotels', assume hotel.
    // Or rely on body.type.
    // Let's rely on the URL structure or passed type.
    
    let bookingType = type;
    if (!bookingType) {
        if (req.originalUrl.includes('/agents/')) bookingType = 'agent';
        else if (req.originalUrl.includes('/hotels/')) bookingType = 'hotel';
        else if (req.originalUrl.includes('/guides/')) bookingType = 'guide';
    }

    let bookingData = {
      user: req.user._id,
      type: bookingType,
      destinationId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      travelers: travelers || 1,
      totalPrice
    };

    let providerUserId;

    if (bookingType === 'agent') {
      const agent = await Agent.findById(entityId);
      if (!agent) return res.status(404).json({ message: 'Agent not found' });
      bookingData.agent = agent._id;
      providerUserId = agent.user;
    } else if (bookingType === 'hotel') {
      const hotel = await Hotel.findById(entityId);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      bookingData.hotel = hotel._id;
      providerUserId = hotel.createdBy;
    } else if (bookingType === 'guide') {
      const guide = await User.findById(entityId);
      if (!guide) return res.status(404).json({ message: 'Guide not found' });
      if (guide.role !== 'guide') return res.status(400).json({ message: 'User is not a guide' });
      bookingData.guide = guide._id;
      providerUserId = guide._id;
    } else {
       return res.status(400).json({ message: 'Invalid booking type' });
    }

    const booking = await Booking.create(bookingData);
    
    // Broadcast to user
    broadcast(`bookings:user:${req.user._id.toString()}`, 'booking_created', booking);
    
    // Broadcast to provider
    if (providerUserId) {
        if (bookingType === 'agent') {
            broadcast(`bookings:agent:${providerUserId.toString()}`, 'booking_created', booking);
        } else if (bookingType === 'hotel') {
            broadcast(`bookings:hotel:${providerUserId.toString()}`, 'booking_created', booking);
        } else if (bookingType === 'guide') {
            broadcast(`bookings:guide:${providerUserId.toString()}`, 'booking_created', booking);
        }
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('agent')
      .populate('hotel')
      .populate('guide', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProviderBookings = async (req, res) => {
  try {
    // Find my agents
    const myAgents = await Agent.find({ user: req.user._id }).select('_id');
    const myAgentIds = myAgents.map(a => a._id);
    
    // Find my hotels
    const myHotels = await Hotel.find({ createdBy: req.user._id }).select('_id');
    const myHotelIds = myHotels.map(h => h._id);
    
    const bookings = await Booking.find({
        $or: [
            { agent: { $in: myAgentIds } },
            { hotel: { $in: myHotelIds } },
            { guide: req.user._id }
        ]
    })
    .populate('user', 'name email')
    .populate('agent')
    .populate('hotel')
    .populate('guide', 'name email avatar')
    .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Alias for backward compatibility if needed, but we'll update routes to use getProviderBookings
exports.getAgentBookings = exports.getProviderBookings;
