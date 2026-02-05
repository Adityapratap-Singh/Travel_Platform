const Hotel = require('../models/Hotel');
const { broadcast } = require('../services/events');
const osmService = require('../services/osmService');

// Get hotels by city/location
exports.getHotelsByLocation = async (req, res) => {
  const { city } = req.query;
  try {
    const query = city ? { city: { $regex: city, $options: 'i' }, verified: true } : { verified: true };
    let hotels = await Hotel.find(query);

    // If no hotels found and city is provided, try to fetch from OSM
    if (hotels.length === 0 && city) {
      const externalHotels = await osmService.searchHotels(city);
      
      // Auto-save these hotels
      for (const extHotel of externalHotels) {
         const exists = await Hotel.findOne({ 
             $or: [{ id: extHotel.id }, { name: extHotel.name, location: extHotel.location }] 
         });
         
         if (!exists) {
            const newHotel = new Hotel({
                ...extHotel,
                verified: false, // Pending Admin Approval
                amenities: ['WiFi', 'Breakfast', 'Pool'], // Default amenities
                images: [extHotel.image]
            });
            try {
               await newHotel.save();
               // We won't return them immediately if verified=true is required, 
               // but for user experience we might want to return them as "unverified" or just notify?
               // The prompt implies "add it to database... then present to users", but "adding... should require admin approval".
               // So we add them, but do NOT return them yet until approved.
            } catch (err) {
               console.error('Failed to auto-save hotel:', err.message);
            }
         }
      }
      
      // Re-fetch only verified hotels (which will still be 0, but process is complete)
      // Or if we want to show them immediately as "Unverified", we could.
      // But based on previous requirement "require admin approval", we should NOT show them yet.
    }

    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new hotel (Proposal)
exports.createHotel = async (req, res) => {
  try {
    const newHotel = new Hotel({
      ...req.body,
      id: Date.now().toString(),
      verified: false,
      createdBy: req.user ? req.user._id : undefined
    });
    const savedHotel = await newHotel.save();
    broadcast('hotels:created', 'hotel_created', savedHotel);
    res.status(201).json(savedHotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get my hotels
exports.getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ createdBy: req.user._id });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single hotel
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: req.params.id });
    if (hotel) {
      res.json(hotel);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingHotels = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const hotels = await Hotel.find({ verified: false });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: req.params.id });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    // Check auth
    if (req.user.role !== 'admin' && hotel.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(hotel, req.body);
    const updated = await hotel.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: req.params.id });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    if (req.user.role !== 'admin' && hotel.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await hotel.deleteOne();
    res.json({ message: 'Hotel removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
