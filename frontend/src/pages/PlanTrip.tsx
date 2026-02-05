import { useState, useEffect, useMemo } from 'react';
import { fetchDestinations, fetchHotels, createTrip, fetchGuides, bookHotel, bookGuide, searchDestinations } from '../lib/api';
import type { Destination, Hotel as HotelType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MapPin, Navigation, Hotel, Check, Loader2, Save, Calendar, DollarSign, Utensils, Camera, User as UserIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const hotelIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const placeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper to center map
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function PlanTrip() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [cityInput, setCityInput] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<any[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [guides, setGuides] = useState<any[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<any[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [guideFilters, setGuideFilters] = useState({
    maxPrice: 100,
    language: 'All'
  });

  // Extract unique languages from guides
  const languages = useMemo(() => {
    const langs = new Set<string>(['All']);
    guides.forEach(g => {
      if (g.languages) {
        g.languages.forEach((l: string) => langs.add(l));
      }
    });
    return Array.from(langs);
  }, [guides]);

  // Filter guides when filters or guides change
  useEffect(() => {
    let result = guides;
    
    // Filter by Price
    result = result.filter(g => (g.hourlyRate || 50) <= guideFilters.maxPrice);
    
    // Filter by Language
    if (guideFilters.language !== 'All') {
      result = result.filter(g => g.languages && g.languages.includes(guideFilters.language));
    }
    
    setFilteredGuides(result);
  }, [guides, guideFilters]);

  // Trip Details
  const [tripName, setTripName] = useState('');
  const [dates, setDates] = useState({ start: '', end: '' });
  const [budget, setBudget] = useState(1000); // Default budget

  // Load initial destinations
  useEffect(() => {
    fetchDestinations().then(setAllDestinations).catch(console.error);
    
    // Auto-search if query param exists
    if (searchParams.get('search')) {
      handleSearch(new Event('submit') as any);
    }
  }, []);

  // Step 0: Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    
    setLoading(true);
    try {
      // Use hybrid search (Local DB + External Service)
      const results = await searchDestinations(cityInput);
      setFilteredDestinations(results);
      
      if (results.length === 0) {
        showToast('No destinations found. Try another city.', 'error');
      } else {
        setStep(1);
      }
    } catch (error) {
      console.error('Search failed:', error);
      showToast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Select Locations
  const toggleDestination = (id: string) => {
    setSelectedDestIds(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Step 2: Optimize Route (Nearest Neighbor)
  const calculateRoute = () => {
    if (selectedDestIds.length === 0) return;

    const selected = allDestinations.filter(d => selectedDestIds.includes(d.id));
    
    // Simple TSP: Nearest Neighbor
    // Start with the first one (or arbitrary)
    // If hotel selected later, we might re-optimize
    let unvisited = [...selected];
    const route = [];
    
    // Start at the first selected item for now
    let current = unvisited[0]; 
    route.push(current);
    unvisited = unvisited.filter(d => d.id !== current.id);

    while (unvisited.length > 0) {
      // Find nearest to current
      let nearest = unvisited[0];
      let minDist = 999999;

      for (const dest of unvisited) {
        const dist = getDistance(current.lat, current.lng, dest.lat, dest.lng);
        if (dist < minDist) {
          minDist = dist;
          nearest = dest;
        }
      }

      route.push(nearest);
      current = nearest;
      unvisited = unvisited.filter(d => d.id !== current.id);
    }

    setOptimizedRoute(route);
    setStep(2);
  };

  // Haversine Distance
  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  // Step 3: Fetch Hotels
  const handleConfirmRoute = async () => {
    setLoading(true);
    try {
      // Fetch hotels for the city input
      const data = await fetchHotels(cityInput);
      setHotels(data);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Recalibrate with Hotel
  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    
    // Recalculate route with hotel as start/end
    const routeLocations = [...optimizedRoute];
    
    // Simple logic: Add hotel as start
    // A better logic would be TSP with fixed start
    
    // Let's just prepend hotel to the existing optimized route for visualization
    // Or run TSP again with Hotel as start
    let unvisited = [...routeLocations];
    const newRoute = [hotel]; // Start at hotel
    
    let current = hotel;
    
    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let minDist = 999999;

      for (const dest of unvisited) {
        const dist = getDistance(current.lat, current.lng, dest.lat, dest.lng);
        if (dist < minDist) {
          minDist = dist;
          nearest = dest;
        }
      }

      newRoute.push(nearest);
      current = nearest;
      unvisited = unvisited.filter(d => d.id !== current.id);
    }

    setOptimizedRoute(newRoute);
  };

  // Step 5: Fetch Guides
  const handleFetchGuides = async () => {
    setLoading(true);
    try {
      // Fetch guides filtering by the city
      const data = await fetchGuides(cityInput);
      setGuides(data);
      setStep(4);
    } catch (err) {
      console.error(err);
      setStep(4); // Continue even if fetch fails
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Save Trip
  const handleSaveTrip = async () => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    
    setSaving(true);
    try {
      // 1. Create Trip
      await createTrip({
        name: tripName || `Trip to ${cityInput}`,
        destinations: selectedDestIds,
        hotel: selectedHotel?.id,
        route: optimizedRoute.map(d => ({
          id: d.id,
          name: d.name,
          lat: d.lat,
          lng: d.lng,
          type: d.amenities ? 'hotel' : 'destination'
        })),
        startDate: dates.start,
        endDate: dates.end,
        budget: budget // Pass budget to backend
      }, token);

      // 2. Book Hotel (if selected)
      if (selectedHotel && dates.start && dates.end) {
        try {
          await bookHotel(selectedHotel.id, {
            startDate: dates.start,
            endDate: dates.end
          }, token);
        } catch (e) {
          console.error('Failed to book hotel', e);
          showToast('Trip saved, but hotel booking failed', 'info');
        }
      }

      // 3. Book Guide (if selected)
      if (selectedGuide && dates.start && dates.end) {
        try {
          await bookGuide(selectedGuide._id, {
            startDate: dates.start,
            endDate: dates.end,
            destinationId: selectedDestIds[0] // Associate with first destination
          }, token);
        } catch (e) {
          console.error('Failed to book guide', e);
          showToast('Trip saved, but guide booking failed', 'info');
        }
      }
      
      showToast('Trip saved successfully!', 'success');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      showToast('Failed to save trip', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10"></div>
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${step >= s ? 'bg-blue-600' : 'bg-gray-300'}`}>
                {s + 1}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 font-medium">
            <span>Search</span>
            <span>Select Places</span>
            <span>Route Map</span>
            <span>Hotel</span>
            <span>Guide</span>
            <span>Review</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
          
          {/* Step 0: Search */}
          {step === 0 && (
            <div className="p-10 flex flex-col items-center justify-center h-full text-center space-y-8 min-h-[500px]">
              <h1 className="text-4xl font-bold text-gray-900">Where do you want to go?</h1>
              <form onSubmit={handleSearch} className="w-full max-w-md flex gap-4">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city or region (e.g. Paris, Tokyo)"
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-200 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                <Button type="submit" size="lg" className="rounded-xl px-8">
                  Plan
                </Button>
              </form>
            </div>
          )}

          {/* Step 1: Select Locations */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Select Places to Visit in {cityInput}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                     <span className="text-sm font-medium text-gray-600">Total Budget:</span>
                     <div className="flex items-center text-blue-600 font-bold">
                       $ <input 
                           type="number" 
                           value={budget} 
                           onChange={(e) => setBudget(Number(e.target.value))}
                           className="w-20 bg-transparent outline-none ml-1"
                           min="100"
                         />
                     </div>
                  </div>
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button onClick={calculateRoute} disabled={selectedDestIds.length < 2}>
                    Plan Route ({selectedDestIds.length})
                  </Button>
                </div>
              </div>

              {filteredDestinations.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <p>No destinations found for "{cityInput}". Try a broader search.</p>
                  <Button variant="ghost" onClick={() => setStep(0)}>Try Again</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDestinations.map(dest => (
                    <div 
                      key={dest.id}
                      onClick={() => toggleDestination(dest.id)}
                      className={`cursor-pointer group relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedDestIds.includes(dest.id) ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent hover:shadow-lg'
                      }`}
                    >
                      <div className="aspect-[4/3] relative">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        {selectedDestIds.includes(dest.id) && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        <h3 className="font-bold text-gray-900">{dest.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{dest.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 & 3: Map & Hotel */}
          {(step === 2 || step === 3) && (
            <div className="flex flex-col lg:flex-row h-[800px]">
              {/* Map Panel */}
              <div className="flex-1 relative h-full">
                <MapContainer 
                  center={[optimizedRoute[0]?.lat || 0, optimizedRoute[0]?.lng || 0]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <ChangeView center={[optimizedRoute[0]?.lat || 0, optimizedRoute[0]?.lng || 0]} zoom={12} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Route Line */}
                  <Polyline 
                    positions={optimizedRoute.map(d => [d.lat, d.lng])}
                    color="#2563eb"
                    weight={4}
                    opacity={0.8}
                    dashArray="10, 10"
                  />

                  {/* Markers */}
                  {optimizedRoute.map((dest, idx) => (
                    <Marker 
                      key={dest.id} 
                      position={[dest.lat, dest.lng]}
                      icon={dest.amenities ? hotelIcon : placeIcon} // Use hotel icon if it has amenities (is a hotel)
                    >
                      <Popup>
                        <div className="font-bold">{idx + 1}. {dest.name}</div>
                        <div className="text-sm">{dest.description}</div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                {/* Map Overlay Controls */}
                <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-xl shadow-xl max-w-sm">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600" /> 
                    Optimized Route
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {optimizedRoute.map((dest, idx) => (
                      <div key={dest.id} className="flex items-center gap-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="truncate">{dest.name}</span>
                        {dest.amenities && <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Hotel</span>}
                      </div>
                    ))}
                  </div>
                  
                  {step === 2 && (
                    <Button onClick={handleConfirmRoute} className="w-full mt-4">
                      Looks Good! Find Hotels
                    </Button>
                  )}
                </div>
              </div>

              {/* Sidebar Panel (Hotels) */}
              {step === 3 && (
                <div className="w-full lg:w-96 border-l border-gray-200 bg-white overflow-y-auto p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Where to stay?</h2>
                    <p className="text-gray-500 text-sm">Select a hotel to start your journey from there.</p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : hotels.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 mb-2">No hotels found in this area.</p>
                      <p className="text-xs text-gray-400">You can contribute one!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hotels.map(hotel => (
                        <div 
                          key={hotel.id}
                          onClick={() => handleSelectHotel(hotel)}
                          className={`cursor-pointer border rounded-xl p-4 transition-all hover:shadow-md ${
                            selectedHotel?.id === hotel.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex gap-3 mb-2">
                            <img src={hotel.image} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div>
                              <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                              <p className="text-xs text-gray-500">{hotel.location}</p>
                              <div className="flex items-center gap-1 mt-1 text-sm font-medium text-blue-600">
                                ${hotel.pricePerNight} <span className="text-gray-400 font-normal">/ night</span>
                              </div>
                            </div>
                          </div>
                          {selectedHotel?.id === hotel.id && (
                            <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" /> Route recalibrated
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                    <Button className="w-full" variant="outline" onClick={() => setStep(1)}>
                      Modify Places
                    </Button>
                    <Button 
                      className="w-full" 
                      onClick={handleFetchGuides}
                      disabled={!selectedHotel}
                    >
                      Find a Guide
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Select Guide */}
          {step === 4 && (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Find a Local Guide in {cityInput}</h2>
                    <Button variant="outline" onClick={() => setStep(3)}>Back to Hotels</Button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex flex-wrap gap-6 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Hourly Rate: ${guideFilters.maxPrice}
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      step="5" 
                      value={guideFilters.maxPrice}
                      onChange={(e) => setGuideFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>$10</span>
                      <span>$200+</span>
                    </div>
                  </div>
                  
                  <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={guideFilters.language}
                      onChange={(e) => setGuideFilters(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="text-sm text-gray-500 pb-2">
                    Showing {filteredGuides.length} guides
                  </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : filteredGuides.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                        <p className="text-gray-500 mb-2">No guides found matching your criteria.</p>
                        {guides.length > 0 ? (
                          <Button variant="outline" onClick={() => setGuideFilters({ maxPrice: 200, language: 'All' })}>
                            Clear Filters
                          </Button>
                        ) : (
                          <Button onClick={() => {
                              setTripName(`Trip to ${cityInput}`);
                              setStep(5);
                          }}>Skip & Continue</Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGuides.map(guide => (
                            <div 
                                key={guide._id}
                                onClick={() => setSelectedGuide(selectedGuide?._id === guide._id ? null : guide)}
                                className={`cursor-pointer border rounded-xl p-4 transition-all hover:shadow-md ${
                                    selectedGuide?._id === guide._id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {guide.avatar ? (
                                          <img src={guide.avatar} alt={guide.name} className="w-full h-full object-cover" />
                                        ) : (
                                          guide.name?.[0] || <UserIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{guide.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" /> {guide.location || cityInput}
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {guide.bio || 'Local expert ready to show you around!'}
                        </div>
                        {guide.languages && guide.languages.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {guide.languages.map((lang: string, i: number) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                            <span className="font-bold text-blue-600">${guide.hourlyRate || 50}/hr</span>
                            {selectedGuide?._id === guide._id && (
                                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Selected
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-8 flex justify-end">
                    <Button 
                        size="lg"
                        onClick={() => {
                            setTripName(`Trip to ${cityInput}`);
                            setStep(5);
                        }}
                    >
                        {selectedGuide ? 'Continue with Guide' : 'Skip & Continue'}
                    </Button>
                </div>
            </div>
          )}

          {/* Step 5: Review & Save */}
          {step === 5 && (
            <div className="p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Review Your Trip</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Form & Summary */}
                <div className="md:col-span-1 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={dates.start}
                        onChange={(e) => setDates({ ...dates, start: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={dates.end}
                        onChange={(e) => setDates({ ...dates, end: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Budget Estimator */}
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" /> Estimated Budget
                    </h3>
                    
                    {dates.start && dates.end ? (
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-800">Accommodation ({Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))} nights)</span>
                          <span className="font-medium">${(selectedHotel?.pricePerNight || 0) * Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Activities ({selectedDestIds.length})</span>
                          <span className="font-medium">${selectedDestIds.length * 25}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Food & Dining</span>
                          <span className="font-medium">${60 * Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))}</span>
                        </div>
                        {selectedGuide && (
                          <div className="flex justify-between">
                            <span className="text-green-800">Guide (est. 8h/day)</span>
                            <span className="font-medium">${(selectedGuide.hourlyRate || 50) * 8 * Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))}</span>
                          </div>
                        )}
                        <div className="border-t border-green-200 pt-2 mt-2 flex justify-between font-bold text-lg text-green-900">
                          <span>Total</span>
                          <span>${
                            ((selectedHotel?.pricePerNight || 0) * Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))) +
                            (selectedDestIds.length * 25) +
                            (60 * Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))) +
                            (selectedGuide ? ((selectedGuide.hourlyRate || 50) * 8 * Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24))) : 0)
                          }</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-green-700 italic">Select dates to see budget estimate</p>
                    )}
                  </div>

                  {selectedHotel ? (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <Hotel className="w-5 h-5" /> Stay at {selectedHotel.name}
                      </h3>
                      <p className="text-sm text-blue-800">{selectedHotel.location}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                      No hotel selected
                    </div>
                  )}

                  {selectedGuide ? (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <UserIcon className="w-5 h-5" /> Guide: {selectedGuide.name}
                      </h3>
                      <div className="text-sm text-purple-800">
                         {selectedGuide.location || cityInput} • ${selectedGuide.hourlyRate || 50}/hr
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                      No guide selected
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>
                      Back
                    </Button>
                    <Button className="flex-1" onClick={handleSaveTrip} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Trip
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Column: Itinerary Preview */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" /> 
                        Your Day-by-Day Itinerary
                      </h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                      {dates.start && dates.end ? (
                         Array.from({ length: Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24)) }).map((_, dayIdx) => {
                           const dayDestinations = optimizedRoute
                             .filter(d => !d.amenities) // Exclude hotel
                             .filter((_, idx) => idx % Math.ceil((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / (1000 * 3600 * 24)) === dayIdx); // Simple distribution
                           
                           return (
                            <div key={dayIdx} className="p-6 hover:bg-gray-50 transition-colors">
                              <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                  D{dayIdx + 1}
                                </div>
                                <div className="flex-1 space-y-4">
                                  <h4 className="font-bold text-gray-900">
                                    Day {dayIdx + 1}: {dayDestinations.length > 0 ? 'Exploring the City' : 'Relaxation & Leisure'}
                                  </h4>
                                  
                                  {/* Morning */}
                                  <div className="flex items-start gap-3 text-sm">
                                    <div className="w-16 text-gray-500 font-medium">09:00 AM</div>
                                    <div className="flex-1 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                      {dayDestinations[0] ? (
                                        <>
                                          <div className="font-bold text-gray-900 flex items-center gap-2">
                                            <Camera className="w-4 h-4 text-blue-500" />
                                            {dayDestinations[0].name}
                                          </div>
                                          <p className="text-gray-500 mt-1">{dayDestinations[0].description}</p>
                                        </>
                                      ) : (
                                        <div className="font-medium text-gray-600 flex items-center gap-2">
                                          <Utensils className="w-4 h-4 text-orange-500" />
                                          Breakfast at Hotel
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Afternoon */}
                                  <div className="flex items-start gap-3 text-sm">
                                    <div className="w-16 text-gray-500 font-medium">01:00 PM</div>
                                    <div className="flex-1 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                      <div className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                                        <Utensils className="w-4 h-4 text-orange-500" />
                                        Lunch Break
                                      </div>
                                      {dayDestinations[1] && (
                                        <>
                                          <div className="font-bold text-gray-900 flex items-center gap-2 mt-3">
                                            <Camera className="w-4 h-4 text-blue-500" />
                                            {dayDestinations[1].name}
                                          </div>
                                          <p className="text-gray-500 mt-1">{dayDestinations[1].description}</p>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Evening */}
                                  <div className="flex items-start gap-3 text-sm">
                                    <div className="w-16 text-gray-500 font-medium">07:00 PM</div>
                                    <div className="flex-1 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                      <div className="font-medium text-gray-900 flex items-center gap-2">
                                        <Utensils className="w-4 h-4 text-orange-500" />
                                        Dinner near {selectedHotel?.name}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                           );
                         })
                      ) : (
                        <div className="p-10 text-center text-gray-500">
                          Select start and end dates to generate your itinerary.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
