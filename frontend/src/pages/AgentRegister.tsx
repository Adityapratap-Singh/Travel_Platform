import { useState } from 'react';
import { registerAgent } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { uploadImage, uploadVideo } from '../lib/api';
import { Loader2 } from 'lucide-react';

export function AgentRegister() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', phone: '', languages: '', city: '', country: '', bio: '', pricePerDay: '' });
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Please log in', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        city: form.city,
        country: form.country,
        bio: form.bio,
        pricePerDay: Number(form.pricePerDay || 0),
        image,
        video
      };
      await registerAgent(payload, token);
      showToast('Agent profile created', 'success');
    } catch {
      showToast('Failed to create agent profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const doUploadImage = async (file?: File) => {
    if (!file || !token) return;
    setUploadingImage(true);
    try {
      const result = await uploadImage(file, token);
      setImage(result.url);
      showToast('Image uploaded', 'success');
    } catch {
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const doUploadVideo = async (file?: File) => {
    if (!file || !token) return;
    setUploadingVideo(true);
    try {
      const result = await uploadVideo(file, token);
      setVideo(result.url);
      showToast('Video uploaded', 'success');
    } catch {
      showToast('Video upload failed', 'error');
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Become a Local Guide</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
          <input className="w-full border rounded-lg p-2" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border rounded-lg p-2" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input className="w-full border rounded-lg p-2" placeholder="Languages (comma separated)" value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg p-2" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input className="border rounded-lg p-2" placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
          </div>
          <textarea className="w-full border rounded-lg p-2" rows={4} placeholder="Short Bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
          <input className="w-full border rounded-lg p-2" type="number" placeholder="Price per day (USD)" value={form.pricePerDay} onChange={e => setForm({ ...form, pricePerDay: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2 items-center">
              <input className="flex-1 border rounded-lg p-2" placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} />
              <label className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-pointer">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={e => doUploadImage(e.target.files?.[0])} />
              </label>
            </div>
            <div className="flex gap-2 items-center">
              <input className="flex-1 border rounded-lg p-2" placeholder="Intro Video URL" value={video} onChange={e => setVideo(e.target.value)} />
              <label className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 cursor-pointer">
                {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                <input type="file" accept="video/*" className="hidden" onChange={e => doUploadVideo(e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Submitting...' : 'Create Profile'}</Button>
        </form>
      </div>
    </div>
  );
}
