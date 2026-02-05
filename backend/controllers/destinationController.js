const Destination = require('../models/Destination');
const osmService = require('../services/osmService');
const aiService = require('../services/aiService');

// Helper: Get Current Season
const getCurrentSeason = () => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'Summer';
  if (month >= 5 && month <= 8) return 'Monsoon'; // Rainy/Waterfall season
  if (month >= 9 && month <= 10) return 'Autumn';
  return 'Winter'; // Snowfall suitable
};

// Helper: Haversine Distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

exports.getRecommendations = async (req, res) => {
  const { lat, lng } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const currentSeason = getCurrentSeason();

  try {
    let destinations = await Destination.find({ verified: true });

    // Filter by Season (Only show if matches current season or 'All Year')
    destinations = destinations.filter(dest => {
       const seasons = Array.isArray(dest.season) ? dest.season : [dest.season];
       const normalizedSeasons = seasons.map(s => s?.trim());
       return normalizedSeasons.includes('All Year') || normalizedSeasons.includes(currentSeason);
    });

    // Sort by Proximity if lat/lng provided
    if (!isNaN(userLat) && !isNaN(userLng)) {
      destinations = destinations.map(dest => {
        const dist = getDistanceFromLatLonInKm(userLat, userLng, dest.lat, dest.lng);
        return { ...dest.toObject(), distance: dist };
      }).sort((a, b) => a.distance - b.distance);
    }

    res.json({
      season: currentSeason,
      destinations: destinations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ verified: true });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingDestinations = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const destinations = await Destination.find({ verified: false });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDestinationById = async (req, res) => {
  try {
    const dest = await Destination.findOne({ id: req.params.id });
    if (dest) {
      res.json(dest);
    } else {
      res.status(404).json({ message: 'Destination not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDestination = async (req, res) => {
  console.log('createDestination called with body:', req.body);
  try {
    let averageBudget = req.body.averageBudget;

    // If budget is not provided, estimate it with AI
    if (!averageBudget && req.body.name) {
      console.log(`Estimating budget for ${req.body.name}...`);
      try {
        averageBudget = await aiService.estimateBudget(req.body.name, req.body.country);
        console.log(`Estimated budget: ₹${averageBudget}`);
      } catch (aiError) {
        console.error('Error calling AI service:', aiError);
      }
    }

    const newDest = new Destination({
      ...req.body,
      averageBudget: averageBudget || 0,
      id: Date.now().toString(), // Simple unique ID
      verified: false, // Requires admin approval
      createdBy: req.user ? req.user._id : null
    });
    const savedDest = await newDest.save();
    res.status(201).json(savedDest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const dest = await Destination.findOne({ id: req.params.id });
    
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Check authorization: Admin or Creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = dest.createdBy && dest.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to update this destination' });
    }

    // Update fields
    Object.assign(dest, req.body);
    
    // If user is admin, they can verify it directly
    if (isAdmin && req.body.verified !== undefined) {
      dest.verified = req.body.verified;
    } else if (!isAdmin) {
      // If user updates, maybe require re-verification? For now let's keep it simple
      // dest.verified = false; 
    }

    const updatedDest = await dest.save();
    res.json(updatedDest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    const dest = await Destination.findOne({ id: req.params.id });
    
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    // Check authorization: Admin or Creator
    const isAdmin = req.user.role === 'admin';
    const isCreator = dest.createdBy && dest.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to delete this destination' });
    }

    await dest.deleteOne();
    res.json({ message: 'Destination removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, author } = req.body;
    const dest = await Destination.findOne({ id: req.params.id });
    
    if (!dest) {
      return res.status(404).json({ message: 'Destination not found' });
    }

    const newReview = {
      id: Date.now().toString(),
      author: author || 'Anonymous', // In real app, get from req.user
      avatar: '',
      rating: Number(rating),
      date: new Date().toLocaleDateString(),
      comment
    };

    dest.reviews.push(newReview);
    
    // Recalculate average rating
    const totalRating = dest.reviews.reduce((acc, r) => acc + r.rating, 0);
    dest.rating = parseFloat((totalRating / dest.reviews.length).toFixed(1));

    await dest.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchDestinations = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    // 1. Search Local DB (Verified AND Unverified)
    const regex = new RegExp(query, 'i');
    let dbDestinations = await Destination.find({
      $or: [
        { name: regex },
        { location: regex },
        { country: regex }
      ]
    });

    // 2. If results are few, fetch from OpenStreetMap
    if (dbDestinations.length < 5) {
      const externalDestinations = await osmService.searchPlaces(query);
      
      // Save new external destinations to DB
      for (const extDest of externalDestinations) {
        // Check if already exists (by ID or Name+Location)
        const exists = await Destination.findOne({ 
           $or: [{ id: extDest.id }, { name: extDest.name, lat: extDest.lat, lng: extDest.lng }] 
        });

        if (!exists) {
            // Create new destination
            const newDest = new Destination({
                ...extDest,
                verified: false, // Ensure it requires approval
                reviews: [],
                itineraries: [],
                nearbySpots: []
            });
            try {
                const savedDest = await newDest.save();
                dbDestinations.push(savedDest);
            } catch (err) {
                console.error('Failed to auto-save destination:', err.message);
            }
        }
      }
    }

    // Deduplicate by ID just in case
    const uniqueDestinations = Array.from(new Map(dbDestinations.map(item => [item.id, item])).values());

    res.json(uniqueDestinations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
