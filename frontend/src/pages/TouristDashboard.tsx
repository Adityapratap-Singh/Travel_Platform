import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectEventSource } from '../lib/events';
import { getUserBookings } from '../lib/api';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Calendar, Users, Clock, Plane } from 'lucide-react';

interface Booking {
  _id: string;
  destinationId?: string;
  startDate: string;
  endDate: string;
  travelers: number;
  status?: string;
}

export function TouristDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id || !token) return;
    // setLoading(true); // Initial state is already true
    getUserBookings(token)
      .then(setBookings)
      .catch(() => showToast('Failed to load bookings', 'error'))
      .finally(() => setLoading(false));

    const es = connectEventSource([`bookings:user:${user._id}`]);
    es.addEventListener('booking_created', (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string) as Booking;
        setBookings(prev => [data, ...prev]);
        showToast('New booking confirmed!', 'success');
      } catch (e) {
        console.error('Failed to parse booking event', e);
      }
    });
    
    es.onerror = () => {
      // Quietly handle connection errors
      console.warn('Realtime connection lost');
    };
    
    return () => es.close();
  }, [user?._id, token, showToast]);

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Ready for your next adventure? Here's what you have planned.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Trips</p>
                <p className="text-3xl font-bold mt-1">{bookings.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Plane className="text-white" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {bookings.filter(b => new Date(b.startDate) > new Date()).length}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Calendar className="text-emerald-600" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Travelers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {bookings.reduce((acc, curr) => acc + (curr.travelers || 0), 0)}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <Users className="text-amber-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
            <Button variant="outline" size="sm">Download Report</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                <p className="text-gray-500 mt-2 mb-6">Start exploring amazing destinations and book your first trip!</p>
                <Button onClick={() => window.location.href = '/destinations'}>
                  Explore Destinations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((b) => (
                <Card key={b._id} hover className="group">
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    {/* Placeholder for destination image since we don't have it in booking data directly yet */}
                    <img 
                      src={`https://source.unsplash.com/random/800x600/?travel,${b.destinationId || 'nature'}`} 
                      alt="Destination"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-4 z-20">
                      <h3 className="text-white font-bold text-lg">{b.destinationId || 'Unknown Destination'}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={getStatusVariant(b.status)} className="capitalize">
                        {b.status || 'Pending'}
                      </Badge>
                      <span className="text-xs text-gray-500 font-mono">#{b._id.slice(-6)}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar size={16} className="text-blue-500" />
                        <span>
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Users size={16} className="text-blue-500" />
                        <span>{b.travelers} Traveler{b.travelers > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock size={16} className="text-blue-500" />
                        <span>{Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                    <Button variant="ghost" size="sm" className="w-full text-xs">Support</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
