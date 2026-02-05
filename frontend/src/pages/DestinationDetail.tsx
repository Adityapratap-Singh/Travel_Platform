import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchDestinationById, markVisited, addReview, deleteDestination, fetchHotels } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Destination, Hotel as HotelType } from '../types';
import { 
  Loader2, MapPin, Star, Calendar, Check, ArrowLeft, 
  Clock, Shield, Sun, User, CheckCircle, X,
  Edit, Trash2, Hotel
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InteractiveMap } from '../components/features/InteractiveMap';
import { WeatherWidget } from '../components/features/WeatherWidget';

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const { showToast } = useToast();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [marking, setMarking] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  const isVisited = user?.visitedLocations?.includes(destination?.id || '');
  const isCreator = user && destination && user._id === destination.createdBy;
  const isAdmin = user?.role === 'admin';
  const canEdit = isCreator || isAdmin;

  useEffect(() => {
    async function loadDestination() {
      if (!id) return;
      try {
        const data = await fetchDestinationById(id);
        setDestination(data);
      } catch {
        setError('Failed to load destination details.');
      } finally {
        setLoading(false);
      }
    }
    loadDestination();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'hotels' && destination?.location && hotels.length === 0) {
      const loadHotels = async () => {
        setLoadingHotels(true);
        try {
          // Extract city from "City, Country" or just use the whole string
          // The backend search logic handles string matching
          const searchLocation = destination.location.split(',')[0].trim();
          const data = await fetchHotels(searchLocation);
          setHotels(data);
        } catch (err) {
          console.error('Failed to fetch hotels', err);
        } finally {
          setLoadingHotels(false);
        }
      };
      loadHotels();
    }
  }, [activeTab, destination, hotels.length]);

  const handleMarkVisited = async () => {
    if (!user || !token || !destination) return;
    try {
      setMarking(true);
      const newVisitedList = await markVisited(destination.id, token);
      updateUser({ ...user, visitedLocations: newVisitedList });
      showToast('Marked as visited!', 'success');
    } catch (err) {
      console.error('Failed to mark visited', err);
      showToast('Failed to mark as visited', 'error');
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async () => {
    if (!destination || !token) return;
    if (!window.confirm('Are you sure you want to delete this destination?')) return;
    try {
      await deleteDestination(destination.id, token);
      showToast('Destination deleted successfully', 'success');
      navigate('/destinations');
    } catch {
      showToast('Failed to delete destination', 'error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !destination) return;
    
    setSubmittingReview(true);
    try {
      const newReview = await addReview(destination.id, {
        rating: reviewRating,
        comment: reviewComment,
        author: user.name
      }, token);
      
      // Optimistically update UI
      setDestination(prev => prev ? {
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
        rating: Number(((prev.rating * (prev.reviews?.length || 0) + reviewRating) / ((prev.reviews?.length || 0) + 1)).toFixed(1))
      } : null);
      
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      showToast('Review submitted successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const mapDestinations = useMemo(() => {
    if (!destination) return [];
    const mainDest = { ...destination };
    const spots = destination.nearbySpots?.map(spot => ({
      id: spot.id,
      name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
      description: spot.type,
      image: spot.image || destination.image, // Fallback image
      price: 0,
      rating: 0,
      location: '',
      fullDescription: '',
      highlights: [],
      duration: '',
      season: '',
      interests: [],
      country: ''
    })) || [];

    const hotelSpots = hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      lat: hotel.lat,
      lng: hotel.lng,
      description: 'Hotel',
      image: hotel.image || destination.image,
      price: hotel.pricePerNight || 0,
      rating: hotel.rating || 0,
      location: hotel.location || '',
      fullDescription: '',
      highlights: hotel.amenities || [],
      duration: '',
      season: 'All Year',
      interests: ['Hotel'],
      country: ''
    }));

    return [mainDest, ...spots, ...hotelSpots] as Destination[];
  }, [destination, hotels]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || 'Destination not found'}</p>
        <Link to="/destinations">
          <Button variant="outline">Back to Destinations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] w-full">
        <img 
          src={destination.image} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="container mx-auto px-4">
            <Link to="/destinations" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Destinations
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{destination.name}</h1>
            <p className="text-xl text-white/90 max-w-2xl mb-8">{destination.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-white/90 mb-8">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {destination.location}
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
                {destination.rating} ({destination.reviews?.length || 120}+ reviews)
              </div>
              <div className="flex items-center">
                <Sun className="w-5 h-5 mr-2" />
                Best time: {destination.bestTime || destination.season}
              </div>
            </div>

            <Link to={`/plan-trip?search=${encodeURIComponent(destination.name)}`}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 border-none font-bold">
                Plan a Trip Here
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6 overflow-x-auto no-scrollbar">
            {['Overview', 'Itinerary', 'Map', 'Hotels', 'Reviews', 'Safety'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab.toLowerCase());
                  document.getElementById(tab.toLowerCase())?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.toLowerCase()
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {canEdit && (
            <div className="flex gap-2 ml-4">
              <Link to={`/destinations/${destination.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Overview */}
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">About this Trip</h2>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {destination.fullDescription}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {destination.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center p-4 bg-blue-50 rounded-xl text-blue-900">
                      <Check className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Itinerary */}
            {destination.itineraries && destination.itineraries.length > 0 && (
              <section id="itinerary" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6">Sample Itinerary</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900">{destination.itineraries[0].name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{destination.duration} • Fully Customizable</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {destination.itineraries[0].days.map((day) => (
                      <div key={day.day} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            D{day.day}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">{day.title}</h4>
                            <div className="space-y-3">
                              {day.activities.map((activity, idx) => (
                                <div key={idx} className="flex gap-3 text-gray-600">
                                  <Clock className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm"><span className="font-medium text-gray-900">{activity.time}</span> - {activity.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Map */}
            <section id="map" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">Location & Nearby Spots</h2>
              <div className="h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <InteractiveMap destinations={mapDestinations} />
              </div>

              {/* Nearby Attractions List */}
              {destination.nearbySpots && destination.nearbySpots.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Top Sights Nearby</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {destination.nearbySpots.map((spot) => (
                      <div key={spot.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img 
                            src={spot.image || destination.image} 
                            alt={spot.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{spot.name}</h4>
                          <p className="text-sm text-gray-500 mb-1">{spot.type}</p>
                          <div className="flex items-center text-sm text-blue-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>View on Map</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Hotels */}
            <section id="hotels" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6">Where to Stay</h2>
              {loadingHotels ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotels.map(hotel => (
                    <div key={hotel.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-200 relative">
                          <img src={hotel.image || destination.image} alt={hotel.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-sm font-bold flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                            {hotel.rating}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                          <p className="text-gray-500 text-sm flex items-center mb-3">
                            <MapPin className="w-3 h-3 mr-1" /> {hotel.location}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hotel.amenities?.slice(0, 3).map((amenity: string, i: number) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{amenity}</span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-lg">${hotel.pricePerNight}<span className="text-sm text-gray-500 font-normal">/night</span></span>
                            <Button size="sm" onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}`, '_blank')}>
                              View Deal
                            </Button>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                  <Hotel className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-bold text-blue-900 mb-1">Searching for Hotels...</h3>
                  <p className="text-blue-700 max-w-md mx-auto">
                    We are currently searching for the best hotels in this area. 
                    New options are being added to our database and will appear here after admin verification.
                    Please check back soon!
                  </p>
                </div>
              )}
            </section>

            {/* Reviews */}
            {destination.reviews && (
              <section id="reviews" className="scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Traveler Reviews</h2>
                    <div className="flex items-center gap-2 text-yellow-500 mt-1">
                      <Star className="fill-current w-5 h-5" />
                      <span className="font-bold text-xl text-gray-900">{destination.rating}</span>
                      <span className="text-gray-500 text-sm">({destination.reviews.length} reviews)</span>
                    </div>
                  </div>
                  {!showReviewForm && (
                    <Button variant="outline" onClick={() => {
                      if (!user) {
                        showToast('Please log in to write a review', 'error');
                        return;
                      }
                      setShowReviewForm(true);
                    }}>
                      Write a Review
                    </Button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Write a Review</h3>
                      <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                        <textarea
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
                          placeholder="Share your experience..."
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={submittingReview}>
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid gap-6">
                  {destination.reviews.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  ) : (
                    destination.reviews.slice().reverse().map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {review.avatar ? (
                              <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{review.author}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          <div className="ml-auto flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 italic">"{review.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Safety */}
            {destination.safety && (
              <section id="safety" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6">Safety & Wellness</h2>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-green-900 text-lg mb-2">
                        Safety Score: {destination.safety.score}/100 ({destination.safety.status})
                      </h3>
                      <p className="text-green-800">
                        {destination.safety.description}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Weather Widget */}
              <WeatherWidget lat={destination.lat} lng={destination.lng} />

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Starting from</span>
                    <div className="text-3xl font-bold text-gray-900">${destination.price}</div>
                  </div>
                  <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    Available Now
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center p-3 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">Travel Dates</label>
                      <span className="text-sm font-medium">Select dates</span>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500">Travelers</label>
                      <span className="text-sm font-medium">2 Adults</span>
                    </div>
                  </div>
                </div>

                <Link to={`/plan-trip?destination=${encodeURIComponent(destination.name)}&id=${destination.id}`} className="block w-full mb-3">
                  <Button className="w-full h-12 text-lg" size="lg">
                    Plan this Trip
                  </Button>
                </Link>
                <Link to={`/agents?country=${encodeURIComponent(destination.country || '')}&destinationId=${destination.id}`} className="block w-full mb-3">
                  <Button variant="outline" className="w-full h-12 text-lg" size="lg">
                    Find Local Guides
                  </Button>
                </Link>
                <Button variant="outline" className="w-full mb-4">
                  Enquire Now
                </Button>

                {user && (
                  <Button 
                    variant={isVisited ? "secondary" : "outline"} 
                    className={`w-full ${isVisited ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : ''}`}
                    onClick={handleMarkVisited}
                    disabled={isVisited || marking}
                  >
                    {isVisited ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Visited
                      </>
                    ) : (
                      marking ? 'Marking...' : 'Mark as Visited'
                    )}
                  </Button>
                )}
                
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500">
                    Free cancellation up to 48 hours before the trip.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Shield className="w-3 h-3" /> Secure Payment
                  </div>
                </div>
              </div>

              {/* Assistance Card */}
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2">Need help planning?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Our travel experts can help you customize this itinerary to your needs.
                </p>
                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Talk to an Expert
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
