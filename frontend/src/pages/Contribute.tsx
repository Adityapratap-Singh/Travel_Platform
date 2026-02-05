import { useState, useEffect } from 'react';
import { createDestination, createHotel, updateDestination, fetchDestinationById, uploadImage, uploadVideo } from '../lib/api';
import { Button } from '../components/ui/Button';
import { MapPin, Building2, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Contribute() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'location' | 'hotel'>('location');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Location Form State
  const [locationForm, setLocationForm] = useState({
    name: '',
    country: '',
    description: '',
    price: '',
    image: '',
    interests: ''
  });

  // Hotel Form State
  const [hotelForm, setHotelForm] = useState({
    name: '',
    location: '',
    city: '',
    description: '',
    pricePerNight: '',
    image: '',
    amenities: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      // Optional: automatic redirect
      // navigate('/login');
    }
  }, [user, navigate]);

  // Fetch destination if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setFetching(true);
      fetchDestinationById(id)
        .then(data => {
          setLocationForm({
            name: data.name,
            country: data.country,
            description: data.description,
            price: data.price.toString(),
            image: data.image,
            interests: data.interests.join(', ')
          });
        })
        .catch(() => {
          setError('Failed to fetch destination details');
          showToast('Failed to load destination', 'error');
        })
        .finally(() => setFetching(false));
    }
  }, [isEditMode, id, showToast]);

  if (!user) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-8">
            You must be logged in to contribute new destinations or hotels.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="w-full">
              <Button className="w-full">Log In</Button>
            </Link>
            <Link to="/signup" className="w-full">
              <Button variant="outline" className="w-full">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleImageFile = async (file?: File) => {
    if (!file || !token) return;
    setUploadingImage(true);
    try {
      const result = await uploadImage(file, token);
      setLocationForm(prev => ({ ...prev, image: result.url }));
      showToast('Image uploaded', 'success');
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoFile = async (file?: File) => {
    if (!file || !token) return;
    setUploadingVideo(true);
    try {
      const result = await uploadVideo(file, token);
      setVideoUrl(result.url);
      showToast('Video uploaded', 'success');
    } catch {
      showToast('Video upload failed', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...locationForm,
        price: Number(locationForm.price),
        interests: locationForm.interests.split(',').map(i => i.trim()),
        ...(videoUrl ? { video: videoUrl } : {})
      };

      if (isEditMode && id) {
        await updateDestination(id, payload, token!);
        setSuccess('Destination updated successfully!');
        showToast('Destination updated successfully!', 'success');
        // Optional: navigate back to details page after delay
        setTimeout(() => navigate(`/destinations/${id}`), 1500);
      } else {
        await createDestination({
          ...payload,
          rating: 0,
          reviews: [],
          itineraries: [],
          nearbySpots: []
        }, token!);
        setSuccess('Location submitted successfully! It will be reviewed by an admin.');
        showToast('Location submitted successfully!', 'success');
      setLocationForm({ name: '', country: '', description: '', price: '', image: '', interests: '' });
    }
  } catch {
    setError(isEditMode ? 'Failed to update destination.' : 'Failed to submit location. Please try again.');
    showToast(isEditMode ? 'Failed to update' : 'Failed to submit location', 'error');
  } finally {
    setLoading(false);
  }
};

const handleHotelSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createHotel({
        ...hotelForm,
        pricePerNight: Number(hotelForm.pricePerNight),
        amenities: hotelForm.amenities.split(',').map(a => a.trim()),
        rating: 0,
        lat: 0, // In a real app, we'd geocode this
        lng: 0,
        verified: false
      }, token!);
      setSuccess('Hotel submitted successfully! It will be reviewed by an admin.');
      showToast('Hotel submitted successfully!', 'success');
      setHotelForm({ name: '', location: '', city: '', description: '', pricePerNight: '', image: '', amenities: '' });
    } catch {
      setError('Failed to submit hotel. Please try again.');
      showToast('Failed to submit hotel', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{isEditMode ? 'Edit Destination' : 'Contribute to the Journey'}</h1>
          <p className="text-gray-600 text-lg">
            {isEditMode ? 'Update the details of this destination.' : 'Share your favorite destinations or write about your travel experiences.'}
          </p>
        </div>

        {fetching ? (
           <div className="flex justify-center p-12">
             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
           </div>
        ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {!isEditMode && (
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setActiveTab('location'); setSuccess(null); setError(null); }}
              className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'location' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MapPin className="w-5 h-5" />
              Add Location
            </button>
            <button
              onClick={() => { setActiveTab('hotel'); setSuccess(null); setError(null); }}
              className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'hotel' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-5 h-5" />
              Add Hotel
            </button>
          </div>
          )}

          <div className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {success}
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {activeTab === 'location' ? (
              <form onSubmit={handleLocationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination Name</label>
                    <input
                      required
                      type="text"
                      value={locationForm.name}
                      onChange={e => setLocationForm({...locationForm, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="e.g. Kyoto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      required
                      type="text"
                      value={locationForm.country}
                      onChange={e => setLocationForm({...locationForm, country: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="e.g. Japan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={locationForm.description}
                    onChange={e => setLocationForm({...locationForm, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Brief description of the place..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost ($)</label>
                    <input
                      required
                      type="number"
                      value={locationForm.price}
                      onChange={e => setLocationForm({...locationForm, price: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interests (comma separated)</label>
                    <input
                      required
                      type="text"
                      value={locationForm.interests}
                      onChange={e => setLocationForm({...locationForm, interests: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Culture, Food, History"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <div className="flex gap-3">
                    <input
                      required
                      type="url"
                      value={locationForm.image}
                      onChange={e => setLocationForm({...locationForm, image: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="https://..."
                    />
                    <label className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-pointer">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleImageFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Video (optional)</label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={e => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="https://..."
                    />
                    <label className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-pointer">
                      {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e => handleVideoFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode ? 'Update Destination' : 'Submit Location')}
                </Button>
                {!isEditMode && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  * All submissions are reviewed by admins before appearing on the map.
                </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleHotelSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                    <input
                      required
                      type="text"
                      value={hotelForm.name}
                      onChange={e => setHotelForm({...hotelForm, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Grand Plaza Hotel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      required
                      type="text"
                      value={hotelForm.city}
                      onChange={e => setHotelForm({...hotelForm, city: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="New York"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (Full Address)</label>
                  <input
                    required
                    type="text"
                    value={hotelForm.location}
                    onChange={e => setHotelForm({...hotelForm, location: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="123 Main St, New York, NY 10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={hotelForm.description}
                    onChange={e => setHotelForm({...hotelForm, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="A brief description of the hotel..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Night ($)</label>
                    <input
                      required
                      type="number"
                      value={hotelForm.pricePerNight}
                      onChange={e => setHotelForm({...hotelForm, pricePerNight: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma separated)</label>
                    <input
                      required
                      type="text"
                      value={hotelForm.amenities}
                      onChange={e => setHotelForm({...hotelForm, amenities: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Pool, Wifi, Breakfast"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    required
                    type="url"
                    value={hotelForm.image}
                    onChange={e => setHotelForm({...hotelForm, image: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Hotel'}
                </Button>
              </form>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
