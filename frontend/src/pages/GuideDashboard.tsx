import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectEventSource } from '../lib/events';
import { getProviderBookings } from '../lib/api';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DollarSign, Map, Briefcase, TrendingUp } from 'lucide-react';

interface Booking {
  _id: string;
  destinationId?: string;
  startDate: string;
  endDate: string;
  travelers: number;
  status?: string;
  totalPrice?: number;
  user?: {
    name: string;
    email: string;
  };
}

export function GuideDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user?._id || !token) return;

    getProviderBookings(token)
      .then(setBookings)
      .catch(() => showToast('Failed to fetch bookings', 'error'));

    const es = connectEventSource([`bookings:guide:${user._id}`]);
    es.addEventListener('booking_created', (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string) as Booking;
        setBookings(prev => [data, ...prev]);
        showToast('New tour request received!', 'success');
      } catch {
        // Ignore invalid JSON
      }
    });
    es.onerror = () => {
      // Quietly handle connection errors
    };
    return () => es.close();
  }, [user?._id, token, showToast]);

  const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guide Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your tours and connect with travelers.</p>
          </div>
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            Update Guide Profile
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <DollarSign className="text-white" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming Tours</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{bookings.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Map className="text-blue-600" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                  4.9 <span className="text-xs font-normal text-gray-500">/ 5.0</span>
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-bold">Tour Requests</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No new tour requests yet.</p>
                    </div>
                  ) : bookings.map((b) => (
                    <div key={b._id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                          {b.user?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{b.destinationId || 'Private Tour'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning">{b.status || 'Pending'}</Badge>
                        <p className="text-sm text-gray-500 mt-1">{b.travelers} Guest(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Guide Actions</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Update Availability</Button>
                <Button variant="outline" className="w-full justify-start">Edit Tour Details</Button>
                <Button variant="outline" className="w-full justify-start">Read Reviews</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
