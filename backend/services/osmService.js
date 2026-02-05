const axios = require('axios');

// Fallback images since OSM doesn't provide them
const TRAVEL_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Switzerland
  'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?auto=format&fit=crop&w=800&q=80', // Paris
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', // Paris 2
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80', // Travel generic
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80', // Travel generic
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80'  // Venice
];

function getRandomImage(seedString) {
  // Simple hash to get consistent image for same place
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TRAVEL_IMAGES.length;
  return TRAVEL_IMAGES[index];
}

exports.searchPlaces = async (query) => {
  try {
    // Using OpenStreetMap (Nominatim) - Free, No Key Required
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 10
      },
      headers: {
        'User-Agent': 'TravelApp-StudentProject/1.0' // Required by Nominatim usage policy
      }
    });

    const places = response.data || [];

    // Map to our Destination format
    return places.map(place => {
      // Determine a good name (Nominatim gives long display_name)
      // Usually "Name, City, County, ..."
      const nameParts = place.display_name.split(',');
      const shortName = nameParts[0];
      const country = place.address ? place.address.country : '';
      
      return {
        id: place.place_id.toString(),
        name: shortName,
        location: place.display_name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        rating: 4.5, // Placeholder rating
        description: `Discovered via OpenStreetMap. Located in ${country}.`,
        fullDescription: `This destination was found using OpenStreetMap. ${place.display_name}`,
        image: getRandomImage(place.place_id.toString()),
        price: 0,
        highlights: [place.type, place.class],
        duration: 'Flexible',
        season: 'All Year',
        interests: [place.category, place.type],
        country: country,
        verified: false,
        isExternal: true
      };
    });

  } catch (error) {
    console.error('Failed to fetch from OpenStreetMap:', error.message);
    return [];
  }
};

exports.searchHotels = async (city, lat, lng) => {
  try {
    // 1. If lat/lng provided, search nearby using Overpass API (better for finding amenities like hotels)
    // Or stick to Nominatim with specific query type
    
    // Let's use Nominatim for simplicity first: "hotels in [city]"
    const query = `hotels in ${city}`;
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 10,
        featuretype: 'settlement' // Try to avoid random streets, but 'hotels' in query helps
      },
      headers: {
        'User-Agent': 'TravelApp-StudentProject/1.0'
      }
    });

    const places = response.data || [];

    return places.map(place => {
       const nameParts = place.display_name.split(',');
       const name = nameParts[0];
       
       return {
        id: place.place_id.toString(),
        name: name,
        location: place.display_name,
        city: city, // We assume it's in the requested city
        description: `Hotel discovered via OpenStreetMap.`,
        pricePerNight: Math.floor(Math.random() * 200) + 50, // Mock price 50-250
        rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating 3.0-5.0
        image: getRandomImage(place.place_id.toString() + 'hotel'),
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        amenities: ['WiFi', 'Parking', 'Restaurant'],
        verified: false
       };
    });

  } catch (error) {
    console.error('Failed to fetch hotels from OpenStreetMap:', error.message);
    return [];
  }
};
