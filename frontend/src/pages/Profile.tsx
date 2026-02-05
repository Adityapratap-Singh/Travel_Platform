import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getVisitedLocations, getUserTrips, deleteTrip, toggleTripVisibility, updateUser as apiUpdateUser, uploadFile } from '../lib/api';
import type { Destination, Trip } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, LogOut, User as UserIcon, Trash2, Clock, Share2, Globe, Lock, Camera, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const [visitedDestinations, setVisitedDestinations] = useState<Destination[]>([]);
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [visited, trips] = await Promise.all([
          getVisitedLocations(token),
          getUserTrips(token)
        ]);
        setVisitedDestinations(visited);
        setSavedTrips(trips);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !token || !user) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Cloudinary
      const uploadData = await uploadFile(file, 'image', token);
      
      // 2. Update User Profile
      const updatedUser = await apiUpdateUser({ avatar: uploadData.url }, token);
      
      // 3. Update Context
      updateUser(updatedUser);
      
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to update profile picture';
      showToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await deleteTrip(tripId, token);
      setSavedTrips(savedTrips.filter(t => t._id !== tripId));
      showToast('Trip deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete trip', err);
      showToast('Failed to delete trip', 'error');
    }
  };

  const handleToggleVisibility = async (tripId: string) => {
    if (!token) return;
    try {
      const updatedTrip = await toggleTripVisibility(tripId, token);
      setSavedTrips(savedTrips.map(t => t._id === tripId ? { ...t, isPublic: updatedTrip.isPublic } : t));
      showToast(`Trip is now ${updatedTrip.isPublic ? 'public' : 'private'}`, 'success');
    } catch (err) {
      console.error('Failed to update trip visibility', err);
      showToast('Failed to update trip visibility', 'error');
    }
  };

  const handleCopyLink = (tripId: string) => {
    const link = `${window.location.origin}/trips/share/${tripId}`;
    navigator.clipboard.writeText(link);
    showToast('Link copied to clipboard!', 'success');
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <p className="mb-4">Please log in to view your profile.</p>
        <Link to="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 relative group overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10" />
            )}
            
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-500 mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                {visitedDestinations.length} Places Visited
              </div>
              <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                {new Set(visitedDestinations.map(d => d.country || d.location.split(',').pop()?.trim())).size} Countries
              </div>
              <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Trips Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Trips</h2>
          <Link to="/plan-trip">
            <Button size="sm">Plan New Trip</Button>
          </Link>
        </div>

        {savedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {savedTrips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        {trip.name}
                        {trip.isPublic ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Globe className="w-3 h-3 mr-1" /> Public
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                            <Lock className="w-3 h-3 mr-1" /> Private
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No date'}
                        {trip.endDate ? ` - ${new Date(trip.endDate).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(trip._id)}
                        className={`transition-colors ${trip.isPublic ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}
                        title={trip.isPublic ? "Make Private" : "Make Public"}
                      >
                        {trip.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </button>
                      {trip.isPublic && (
                        <button
                          onClick={() => handleCopyLink(trip._id)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="Copy Share Link"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteTrip(trip._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {trip.destinations.length} destinations: {trip.destinations.map(d => d.name).join(', ')}
                      </span>
                    </div>
                    {trip.hotel && (
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                        <span className="text-sm text-gray-600">
                          Stay at {trip.hotel.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Created {new Date(trip.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs font-medium text-blue-600">
                    {trip.route.length} Stops
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300 mb-12">
             <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 mb-4">No saved trips yet</p>
             <Link to="/plan-trip">
               <Button variant="outline" size="sm">Plan a Trip</Button>
             </Link>
          </div>
        )}

        {/* Visited Locations Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Travel History</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : visitedDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visitedDestinations.map((dest) => (
              <Link to={`/destinations/${dest.id}`} key={dest.id} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Visited
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">{dest.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {dest.location}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                     <div className="flex items-center gap-1 text-yellow-500">
                       <Star className="w-4 h-4 fill-current" />
                       <span className="font-medium text-gray-900">{dest.rating}</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visited places yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and mark destinations you've visited!</p>
            <Link to="/destinations">
              <Button>Explore Destinations</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
