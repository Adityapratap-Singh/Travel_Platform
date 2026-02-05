import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchDestinations, searchDestinations, chatWithAi } from '../lib/api';
import type { Destination } from '../types';
import { MapPin, Star, Filter, LayoutGrid, Map as MapIcon, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { InteractiveMap } from '../components/features/InteractiveMap';
import { cn } from '../lib/utils';

export function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [budgetRange, setBudgetRange] = useState<number>(3000);
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const data = await fetchDestinations();
        setDestinations(data);
      } catch {
        setError('Failed to load destinations. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setAiLoading(true);
    setAiError(null);
    setAiSummary(null);
    try {
      const [results, ai] = await Promise.all([
        searchDestinations(searchQuery.trim()),
        chatWithAi(`Find travel insights for ${searchQuery.trim()}. Include highlights, best time, safety, and budget.`, { intent: 'location_info', query: searchQuery.trim() })
      ]);
      setDestinations(results);
      setAiSummary(ai.reply);
    } catch {
      setAiError('AI summary unavailable right now.');
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  // Derived unique values for filters
  const countries = useMemo(() => {
    const unique = new Set(destinations.map(d => d.country).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [destinations]);

  const seasons = useMemo(() => {
    const unique = new Set(destinations.map(d => d.season).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [destinations]);

  const allInterests = useMemo(() => {
    const interests = new Set<string>();
    destinations.forEach(d => d.interests?.forEach(i => interests.add(i)));
    return Array.from(interests);
  }, [destinations]);

  // Filtering Logic
  const filteredDestinations = useMemo(() => {
    return destinations.filter(dest => {
      const matchesCountry = selectedCountry === 'All' || dest.country === selectedCountry;
      const matchesBudget = dest.price <= budgetRange;
      const matchesSeason = selectedSeason === 'All' || dest.season === selectedSeason || dest.season === 'All Year';
      const matchesInterests = selectedInterests.length === 0 || 
        selectedInterests.every(i => dest.interests?.includes(i));
      
      return matchesCountry && matchesBudget && matchesSeason && matchesInterests;
    });
  }, [destinations, selectedCountry, budgetRange, selectedSeason, selectedInterests]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
           <Skeleton className="h-8 w-48 mb-8" />
           <div className="flex flex-col md:flex-row gap-8">
             <div className="w-full md:w-64 space-y-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden relative bg-white border border-gray-100 shadow-sm">
                   <Skeleton className="h-full w-full" />
                   <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 bg-gradient-to-t from-black/60 to-transparent pt-12">
                     <Skeleton className="h-8 w-3/4 bg-white/20" />
                     <div className="flex gap-4">
                       <Skeleton className="h-4 w-12 bg-white/20" />
                       <Skeleton className="h-4 w-16 bg-white/20" />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">Destinations</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-lg text-gray-900">Filters</h2>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search a city or place"
                    className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <Button type="submit" className="mt-3 w-full">Search</Button>
              </form>

              {/* View Toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                    viewMode === 'grid' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                    viewMode === 'map' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  Map
                </button>
              </div>

              {/* Country Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Budget Filter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Max Budget</label>
                  <span className="text-sm font-bold text-blue-600">${budgetRange}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="100" 
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$500</span>
                  <span>$5000+</span>
                </div>
              </div>

              {/* Season Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                <div className="grid grid-cols-2 gap-2">
                  {seasons.map(season => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-lg border transition-colors",
                        selectedSeason === season 
                          ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" 
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {allInterests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full border transition-all",
                        selectedInterests.includes(interest)
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <Button 
                variant="ghost" 
                className="w-full mt-6 text-gray-500 hover:text-gray-900"
                onClick={() => {
                  setSelectedCountry('All');
                  setBudgetRange(3000);
                  setSelectedSeason('All');
                  setSelectedInterests([]);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Results Grid/Map */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Explore Destinations <span className="text-gray-400 font-normal text-xl ml-2">({filteredDestinations.length})</span>
              </h1>
            </div>

            {(aiLoading || aiSummary || aiError) && (
              <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {aiLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : aiSummary ? (
                  <div className="prose max-w-none">
                    <div className="text-gray-800 text-sm whitespace-pre-line">{aiSummary}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">{aiError}</div>
                )}
              </div>
            )}

            {viewMode === 'map' ? (
              <div className="h-[600px] rounded-2xl overflow-hidden shadow-sm border border-gray-200 sticky top-24">
                <InteractiveMap destinations={filteredDestinations} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((destination) => (
                  <Link key={destination.id} to={`/destinations/${destination.id}`} className="group">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full border border-gray-100">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <img 
                          src={destination.image} 
                          alt={destination.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold text-gray-900 shadow-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {destination.rating}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
                          <h3 className="text-xl font-bold text-white mb-1">{destination.name}</h3>
                          <div className="flex items-center text-gray-200 text-sm mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            {destination.country}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-white font-bold">${destination.price}</span>
                            <span className="text-xs text-gray-300 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                              {destination.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {filteredDestinations.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No destinations found</h3>
                <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedCountry('All');
                    setBudgetRange(5000);
                    setSelectedSeason('All');
                    setSelectedInterests([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
