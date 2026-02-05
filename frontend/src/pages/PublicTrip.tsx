import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicTrip } from '../lib/api';
import type { Trip } from '../types';
import { MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function PublicTrip() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTrip() {
      if (!id) return;
      try {
        const data = await getPublicTrip(id);
        setTrip(data);
      } catch {
        setError('Failed to load trip. It might be private or deleted.');
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-500 mb-6">{error || "The trip you're looking for doesn't exist or is private."}</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
            <div className="flex items-center gap-4 text-blue-100">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No date'} 
                {trip.endDate ? ` - ${new Date(trip.endDate).toLocaleDateString()}` : ''}
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {trip.destinations.length} Destinations
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Itinerary</h2>
            
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-200">
              {trip.route.map((stop, index) => (
                <div key={index} className="relative pl-10">
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                    stop.type === 'hotel' ? 'bg-yellow-500' : 'bg-blue-600'
                  }`}>
                    {stop.type === 'hotel' ? (
                      <Star className="w-4 h-4 text-white" />
                    ) : (
                      <MapPin className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{stop.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase">
                        {stop.type}
                      </span>
                    </div>
                    {stop.type === 'destination' && (
                      <Link to={`/destinations/${stop.id}`} className="text-sm text-blue-600 hover:underline flex items-center mt-2">
                        View Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {trip.hotel && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Accommodation</h3>
                <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
                  <img src={trip.hotel.image} alt={trip.hotel.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900">{trip.hotel.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{trip.hotel.location}</p>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{trip.hotel.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 mb-4">Like this trip? Plan your own!</p>
          <Link to="/plan-trip">
            <Button size="lg">Start Planning</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
