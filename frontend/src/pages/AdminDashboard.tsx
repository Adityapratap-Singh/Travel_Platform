import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Hotel } from 'lucide-react';
import { fetchPendingDestinations, updateDestination, deleteDestination, fetchPendingHotels, updateHotel, deleteHotel } from '../lib/api';
import type { Destination, Hotel as HotelType } from '../types';

export function AdminDashboard() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [pendingDestinations, setPendingDestinations] = useState<Destination[]>([]);
  const [pendingHotels, setPendingHotels] = useState<HotelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingItems = useCallback(async () => {
    try {
      setLoading(true);
      const [dests, hotels] = await Promise.all([
        fetchPendingDestinations(token!),
        fetchPendingHotels(token!)
      ]);
      setPendingDestinations(dests);
      setPendingHotels(hotels);
    } catch (error) {
      console.error(error);
      showToast('Failed to load pending verifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    if (token) {
      loadPendingItems();
    }
  }, [token, loadPendingItems]);

  const handleVerify = async (id: string, approve: boolean, type: 'destination' | 'hotel') => {
    if (!token) return;
    setProcessingId(id);
    try {
      if (type === 'destination') {
        if (approve) {
          await updateDestination(id, { verified: true }, token);
          showToast('Destination approved successfully', 'success');
        } else {
          await deleteDestination(id, token);
          showToast('Destination rejected and removed', 'info');
        }
        setPendingDestinations(prev => prev.filter(d => d.id !== id));
      } else {
        if (approve) {
          await updateHotel(id, { verified: true }, token);
          showToast('Hotel approved successfully', 'success');
        } else {
          await deleteHotel(id, token);
          showToast('Hotel rejected and removed', 'info');
        }
        setPendingHotels(prev => prev.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error(error);
      showToast('Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}. Manage your platform here.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-none">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">System Status</p>
                <p className="text-3xl font-bold mt-1">Active</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Shield className="text-white" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Verifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingDestinations.length + pendingHotels.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">--</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <MapPin className="text-blue-600" size={24} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications List */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Verifications</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : pendingDestinations.length === 0 && pendingHotels.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">All caught up!</p>
              <p className="text-gray-500">No pending items to review.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingDestinations.map(dest => (
                <div key={dest.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {dest.image ? (
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MapPin size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Destination</span>
                        <h3 className="font-bold text-gray-900">{dest.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {dest.location || 'Unknown location'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Source: {dest.createdBy ? 'User Submission' : 'Web Search (Auto)'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleVerify(dest.id, false, 'destination')}
                      disabled={processingId === dest.id}
                    >
                      {processingId === dest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Reject
                    </Button>
                    <Button 
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white border-none"
                      onClick={() => handleVerify(dest.id, true, 'destination')}
                      disabled={processingId === dest.id}
                    >
                      {processingId === dest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingHotels.map(hotel => (
                <div key={hotel.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {hotel.image ? (
                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Hotel size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Hotel</span>
                        <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {hotel.location || hotel.city || 'Unknown location'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Source: {hotel.createdBy ? 'User Submission' : 'Web Search (Auto)'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 md:flex-none text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleVerify(hotel.id, false, 'hotel')}
                      disabled={processingId === hotel.id}
                    >
                      {processingId === hotel.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Reject
                    </Button>
                    <Button 
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white border-none"
                      onClick={() => handleVerify(hotel.id, true, 'hotel')}
                      disabled={processingId === hotel.id}
                    >
                      {processingId === hotel.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Manage Destinations</h3>
                <p className="text-sm text-gray-500">Review and approve new destination submissions.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                    <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Platform Settings</h3>
                <p className="text-sm text-gray-500">Configure global settings and permissions.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
