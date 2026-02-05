import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ArrowRight, Map, Star, Search, Palmtree, Mountain, Building2, Tent, CheckCircle2 } from 'lucide-react';
import type { Experience, Destination } from '../types';
import { fetchExperiences, fetchRecommendations, fetchDestinations } from '../lib/api';
import { InteractiveMap } from '../components/features/InteractiveMap';
interface RecommendedDestination extends Destination {
  distance?: number;
}

export function Home() {
  const navigate = useNavigate();
  const [featuredExperiences, setFeaturedExperiences] = useState<Experience[]>([]);
  const [recommendedDestinations, setRecommendedDestinations] = useState<RecommendedDestination[]>([]);
  const [trendingDestinations, setTrendingDestinations] = useState<Destination[]>([]);
  const [currentSeason, setCurrentSeason] = useState<string>('');
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/plan-trip?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: 'Beaches', icon: Palmtree, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Mountains', icon: Mountain, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Cities', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'Camping', icon: Tent, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  useEffect(() => {
    fetchExperiences().then(data => {
      setFeaturedExperiences(data.slice(0, 3));
    }).catch(err => console.error('Failed to fetch experiences', err));

    fetchDestinations().then(data => {
      // Just take the first 3 for trending, or maybe random, or specific ones
      // For now, first 3 is fine as they are likely the seeded ones (Santorini, Kyoto, etc)
      setTrendingDestinations(data.slice(0, 3));
    }).catch(err => console.error('Failed to fetch destinations', err));

    // Get User Location & Recommendations
    const getRecommendations = async (lat?: number, lng?: number) => {
      try {
        const data = await fetchRecommendations(lat, lng);
        setRecommendedDestinations(data.destinations.slice(0, 3));
        setCurrentSeason(data.season);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          getRecommendations(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Permission denied or error, fetch without location (just seasonal)
          getRecommendations();
        }
      );
    } else {
      getRecommendations();
    }
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
            alt="Travel Hero" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium">New Adventures Added Weekly</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in slide-in-from-bottom-5 duration-700">
            Don't Just See the World.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Experience It.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 animate-in slide-in-from-bottom-5 duration-700 delay-100">
            Curated journeys that go beyond the guidebook. Local experts, hidden gems, and unforgettable memories await.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-5 duration-700 delay-200">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-md relative flex items-center">
              <input
                type="text"
                placeholder="Where do you want to go?"
                className="w-full h-14 pl-6 pr-14 rounded-full text-gray-900 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8 animate-in fade-in duration-1000 delay-300">
             {categories.map((cat) => (
               <button 
                 key={cat.name}
                 onClick={() => navigate(`/destinations?category=${cat.name}`)}
                 className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-all text-sm font-medium"
               >
                 <cat.icon className="w-4 h-4" />
                 {cat.name}
               </button>
             ))}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-300 text-sm font-medium animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Verified Guides</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Best Price Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Explore the World</h2>
              <p className="text-gray-600">Discover destinations near you and around the globe.</p>
            </div>
            <Link to="/destinations">
              <Button variant="outline">View All Destinations</Button>
            </Link>
          </div>
          
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
             <InteractiveMap destinations={recommendedDestinations.length > 0 ? recommendedDestinations : trendingDestinations} />
          </div>
        </div>
      </section>

      {/* Partner/Dashboard Access Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join Our Network</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Whether you're a traveler, agent, hotel owner, or local guide, we have a dedicated platform for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'For Tourists', 
                desc: 'Plan trips, book hotels, and find guides.', 
                icon: Palmtree, 
                color: 'text-blue-600', 
                bg: 'bg-blue-50',
                link: '/dashboard/tourist'
              },
              { 
                title: 'For Agents', 
                desc: 'Manage bookings and earn commissions.', 
                icon: Building2, 
                color: 'text-purple-600', 
                bg: 'bg-purple-50',
                link: '/dashboard/agent'
              },
              { 
                title: 'For Hotels', 
                desc: 'List properties and manage reservations.', 
                icon: Building2, 
                color: 'text-emerald-600', 
                bg: 'bg-emerald-50',
                link: '/dashboard/hotel'
              },
              { 
                title: 'For Guides', 
                desc: 'Connect with travelers and share your expertise.', 
                icon: Map, 
                color: 'text-orange-600', 
                bg: 'bg-orange-50',
                link: '/dashboard/guide'
              },
            ].map((item) => (
              <Link to={item.link} key={item.title} className="group">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 mb-6 flex-grow">{item.desc}</p>
                  <div className="flex items-center text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Access Dashboard <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trending Destinations</h2>
              <p className="text-gray-600 text-lg">
                Hand-picked locations that are capturing travelers' hearts this season.
              </p>
            </div>
            <Link to="/destinations">
              <Button variant="ghost" className="group text-blue-600 hover:text-blue-700 p-0 hover:bg-transparent">
                View all destinations
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingDestinations.length > 0 ? trendingDestinations.map((dest) => (
              <Link to={`/destinations/${dest.id}`} key={dest.id} className="group cursor-pointer block">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/5] shadow-lg">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Hover Action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      View Details
                    </Button>
                  </div>

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-lg z-10">
                    From ${dest.price}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">{dest.name}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-200">
                       <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{dest.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-4 h-4" />
                        <span>{dest.duration || '7 Days'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              // Skeleton Loading
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden mb-4 aspect-[4/5] relative">
                  <Skeleton className="h-full w-full absolute inset-0" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 z-10">
                    <Skeleton className="h-8 w-3/4 bg-white/20" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-12 bg-white/20" />
                      <Skeleton className="h-4 w-16 bg-white/20" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Experiences */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Unforgettable Experiences</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Don't just visit—immerse yourself. Curated activities led by local experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredExperiences.length > 0 ? featuredExperiences.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={exp.image} 
                    alt={exp.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {exp.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4" />
                      <span>{exp.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Map className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{exp.title}</h3>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-gray-900">${exp.price}</span>
                    <Link to="/experiences">
                      <Button size="sm" variant="outline" className="group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              // Skeleton Loading for Experiences
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[400px]">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/experiences">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
                View All Experiences
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Seasonal & Proximity Recommendations */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 text-orange-500">☀️</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {currentSeason ? `${currentSeason} Recommendations` : 'Seasonal Recommendations'} 
              {loadingRecs && <span className="text-lg font-normal text-gray-500 ml-4">(Finding best spots near you...)</span>}
            </h2>
          </div>

          {!loadingRecs && recommendedDestinations.length === 0 && (
             <p className="text-gray-500">No specific recommendations found for your location this season. Explore our trending destinations!</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedDestinations.map((dest) => (
              <Link to={`/destinations/${dest.id}`} key={dest.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/5]">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Distance Badge if available */}
                  {dest.distance && (
                    <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                      {Math.round(dest.distance)} km away
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{dest.rating}</span>
                    </div>
                    <p className="text-sm font-medium">{dest.location}</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{dest.name}</h3>
                <p className="text-gray-500 line-clamp-2">{dest.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Portals & Dashboards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Portals & Dashboards</h2>
            <p className="text-gray-600 text-lg">Choose your portal to access a tailored dashboard.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Link to="/login?role=tourist" className="group">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tourist</h3>
                <p className="text-gray-600 mb-4">Plan trips, manage bookings.</p>
                <Button variant="outline" className="w-full">Open Tourist Portal</Button>
              </div>
            </Link>
            <Link to="/login?role=agent" className="group">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Guide</h3>
                <p className="text-gray-600 mb-4">Receive requests, manage schedule.</p>
                <Button variant="outline" className="w-full">Open Guide Portal</Button>
              </div>
            </Link>
            <Link to="/login?role=hotel" className="group">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hotel</h3>
                <p className="text-gray-600 mb-4">Manage listings and availability.</p>
                <Button variant="outline" className="w-full">Open Hotel Portal</Button>
              </div>
            </Link>
            <Link to="/agents" className="group">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Find Guides</h3>
                <p className="text-gray-600 mb-4">Discover local guides near destinations.</p>
                <Button variant="outline" className="w-full">Browse Guides</Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Map Teaser */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-blue-600 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-20 flex flex-col justify-center text-white">
                <Map className="w-12 h-12 mb-6 text-blue-200" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Explore via Interactive Map</h2>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Not sure where to go? Use our interactive map to filter destinations by climate, activity, and budget. Find your perfect spot in seconds.
                </p>
                <Link to="/destinations">
                  <Button variant="secondary" size="lg" className="w-fit">
                    Open Map View
                  </Button>
                </Link>
              </div>
              <div className="h-96 lg:h-auto bg-gray-200 relative">
                 <InteractiveMap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Adventurers</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="font-medium text-gray-700">4.9/5 from 2,000+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Adventure Enthusiast",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
                quote: "The best travel experience of my life. The local guides were incredible and the itinerary was perfect."
              },
              {
                name: "Michael Chen",
                role: "Photography Lover",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                quote: "I found hidden gems I never would have discovered on my own. Truly authentic experiences."
              },
              {
                name: "Emma Wilson",
                role: "Solo Traveler",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
                quote: "Felt safe and supported the entire time. The community features helped me meet amazing people."
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Partner Logos (Static) */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">Featured In</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
              {/* Simple Text Logos as Placeholders */}
              <span className="text-xl font-bold font-serif">Travel&Leisure</span>
              <span className="text-xl font-bold font-sans">NatGeo</span>
              <span className="text-xl font-bold font-mono">LonelyPlanet</span>
              <span className="text-xl font-bold italic">Condé Nast</span>
              <span className="text-xl font-bold">VOGUE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=2068&auto=format&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of travelers who have found their perfect adventure with us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/destinations">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 h-14 text-lg">
                Explore All Destinations
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white px-8 h-14 text-lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
