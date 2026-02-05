import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchAgents, bookAgent } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { MapPin, User, Languages, Calendar, Users } from 'lucide-react';

export function Agents() {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const countryParam = searchParams.get('country') || '';
  const destinationId = searchParams.get('destinationId') || '';
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<{ startDate: string; endDate: string; travelers: number }>({ startDate: '', endDate: '', travelers: 2 });
  const { user, token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAgents({ city: cityParam || undefined, country: countryParam || undefined, destinationId: destinationId || undefined });
        setAgents(data);
      } catch (err) {
        setError('Failed to load agents.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cityParam, countryParam, destinationId]);

  const handleBook = async (agentId: string) => {
    if (!user || !token) {
      showToast('Please log in to book a guide', 'error');
      return;
    }
    if (!booking.startDate || !booking.endDate) {
      showToast('Select start and end dates', 'error');
      return;
    }
    try {
      await bookAgent(agentId, { destinationId, startDate: booking.startDate, endDate: booking.endDate, travelers: booking.travelers }, token);
      showToast('Booking requested successfully', 'success');
    } catch {
      showToast('Failed to request booking', 'error');
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local Guides</h1>
            <p className="text-gray-600">{cityParam || countryParam ? `Showing guides for ${cityParam || countryParam}` : 'Find local guides near your destination'}</p>
          </div>
          <Link to="/agent/register">
            <Button variant="outline">Become a Guide</Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 border rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <input type="date" className="flex-1 outline-none" value={booking.startDate} onChange={e => setBooking({ ...booking, startDate: e.target.value })} />
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <input type="date" className="flex-1 outline-none" value={booking.endDate} onChange={e => setBooking({ ...booking, endDate: e.target.value })} />
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <Users className="w-5 h-5 text-gray-400 mr-3" />
              <input type="number" className="flex-1 outline-none" min={1} value={booking.travelers} onChange={e => setBooking({ ...booking, travelers: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((a) => (
              <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    {a.image ? <img src={a.image} alt={a.name} className="w-full h-full object-cover" /> : <User className="w-10 h-10 m-3 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{a.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {a.city || a.country || 'N/A'}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{a.bio}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">From</div>
                  <div className="text-xl font-bold text-gray-900">${a.pricePerDay}/day</div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <Languages className="w-4 h-4" />
                  <span>{(a.languages || []).join(', ') || 'Languages: N/A'}</span>
                </div>
                <Button className="w-full" onClick={() => handleBook(a._id)}>Request Booking</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
