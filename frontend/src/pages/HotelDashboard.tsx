import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectEventSource } from '../lib/events';
import { getMyHotels, getProviderBookings } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Building, MapPin, DollarSign, Star, Plus, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HotelDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    setLoading(true);
    
    Promise.all([
      getMyHotels(token),
      getProviderBookings(token)
    ])
    .then(([hotelsData, bookingsData]) => {
      setHotels(hotelsData);
      setBookings(bookingsData);
    })
    .catch(() => showToast('Failed to load dashboard data', 'error'))
    .finally(() => setLoading(false));

    // Listen for new hotels and bookings
    const es = connectEventSource([
        `hotels:user:${user?._id}`,
        `bookings:hotel:${user?._id}`
    ]); 
    
    es.addEventListener('hotel_created', (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string);
        setHotels(prev => [data, ...prev]);
        showToast('New hotel listed successfully!', 'success');
      } catch {}
    });

    es.addEventListener('booking_created', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data as string);
          setBookings(prev => [data, ...prev]);
          showToast('New booking received!', 'success');
        } catch {}
    });
    
    es.onerror = () => {
      console.warn('Realtime connection lost');
    };
    
    return () => es.close();
  }, [token, user?._id, showToast]);

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your property listings and view reservations.</p>
          </div>
          <Link to="/contribute">
            <Button className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              List New Property
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">Total Listings</p>
                <p className="text-3xl font-bold mt-1">{hotels.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Building className="text-white" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{bookings.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Properties</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        ) : hotels.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Listed</h3>
            <p className="text-gray-500 mb-6">Start earning by listing your hotel or rental property.</p>
            <Link to="/contribute">
              <Button>List Your First Property</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((h) => (
              <Card key={h._id} hover className="group flex flex-col h-full">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={h.image || `https://source.unsplash.com/random/800x600/?hotel,${h.city || 'room'}`} 
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm shadow-sm">
                      ${h.pricePerNight}/night
                    </Badge>
                  </div>
                  {h.verified ? (
                    <div className="absolute top-4 left-4">
                      <Badge variant="success" className="shadow-sm">Verified</Badge>
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4">
                      <Badge variant="warning" className="shadow-sm">Pending</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 flex-grow">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{h.name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    <MapPin size={16} />
                    <span>{h.city || h.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    <Star size={16} fill="currentColor" />
                    <span className="font-medium">{h.rating || 0}</span>
                    <span className="text-gray-400 text-sm ml-1">(0 reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(h.amenities || []).slice(0, 3).map((amenity: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <div className="p-5 border-t border-gray-100 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                  <Button variant="outline" size="sm" className="flex-1">Bookings</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Bookings Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
          
          {bookings.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50 border-dashed">
              <div className="flex flex-col items-center justify-center">
                <Calendar className="w-10 h-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                <p className="text-gray-500 mt-1">Bookings for your properties will appear here.</p>
              </div>
            </Card>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Guest</th>
                      <th className="px-6 py-4">Property</th>
                      <th className="px-6 py-4">Dates</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {booking.user?.name?.[0] || 'G'}
                            </div>
                            <span className="font-medium text-gray-900">{booking.user?.name || 'Guest'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {booking.hotel?.name || booking.destinationId || 'Unknown Property'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={
                            booking.status === 'confirmed' ? 'success' : 
                            booking.status === 'pending' ? 'warning' : 'error'
                          }>
                            {booking.status || 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ${booking.totalPrice?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
