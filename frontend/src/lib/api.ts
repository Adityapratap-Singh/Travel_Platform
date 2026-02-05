export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Auth API
export async function login(credentials: any) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
}

export async function signup(credentials: any) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  return response.json();
}

// User API
export async function markVisited(destinationId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/user/visited`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ destinationId }),
  });
  if (!response.ok) throw new Error('Failed to mark visited');
  return response.json();
}

export async function getVisitedLocations(token: string) {
  const response = await fetch(`${API_BASE_URL}/user/visited`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch visited locations');
  return response.json();
}

// Recommendation API
export async function fetchRecommendations(lat?: number, lng?: number) {
  let url = `${API_BASE_URL}/destinations/recommend`;
  if (lat && lng) {
    url += `?lat=${lat}&lng=${lng}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch recommendations');
  return response.json();
}

export async function fetchDestinations() {
  const response = await fetch(`${API_BASE_URL}/destinations`);
  if (!response.ok) throw new Error('Failed to fetch destinations');
  return response.json();
}

export async function fetchPendingDestinations(token: string) {
  const response = await fetch(`${API_BASE_URL}/destinations/pending`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch pending destinations');
  return response.json();
}

export async function searchDestinations(query: string) {
  const response = await fetch(`${API_BASE_URL}/destinations/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to search destinations');
  return response.json();
}

export async function fetchDestinationById(id: string) {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`);
  if (!response.ok) throw new Error('Failed to fetch destination');
  return response.json();
}

export async function fetchExperiences() {
  const response = await fetch(`${API_BASE_URL}/experiences`);
  if (!response.ok) throw new Error('Failed to fetch experiences');
  return response.json();
}

export async function fetchGuides(city?: string) {
  let url = `${API_BASE_URL}/user/guides`;
  if (city) {
    url += `?city=${encodeURIComponent(city)}`;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch guides');
  return response.json();
}

export async function bookGuide(guideId: string, payload: { destinationId?: string; startDate: string; endDate: string; travelers?: number }, token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/guides/${guideId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...payload, type: 'guide' }),
  });
  if (!response.ok) throw new Error('Failed to book guide');
  return response.json();
}

export async function fetchAgents(params?: { city?: string; country?: string; destinationId?: string }) {
  const q = new URLSearchParams();
  if (params?.city) q.append('city', params.city);
  if (params?.country) q.append('country', params.country);
  if (params?.destinationId) q.append('destinationId', params.destinationId);
  const response = await fetch(`${API_BASE_URL}/agents?${q.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
}

export async function registerAgent(profile: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/agents/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error('Failed to register agent');
  return response.json();
}

export async function bookAgent(agentId: string, payload: { destinationId?: string; startDate: string; endDate: string; travelers?: number }, token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/agents/${agentId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...payload, type: 'agent' }),
  });
  if (!response.ok) throw new Error('Failed to create booking');
  return response.json();
}

export async function bookHotel(hotelId: string, payload: { startDate: string; endDate: string; travelers?: number }, token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/hotels/${hotelId}/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...payload, type: 'hotel' }),
  });
  if (!response.ok) throw new Error('Failed to book hotel');
  return response.json();
}

export async function getUserBookings(token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user bookings');
  return response.json();
}

export async function getProviderBookings(token: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/provider/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch provider bookings');
  return response.json();
}

export async function createDestination(data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/destinations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create destination');
  return response.json();
}

export async function updateDestination(id: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update destination');
  return response.json();
}

export async function deleteDestination(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to delete destination');
  return response.json();
}

export async function addReview(destinationId: string, review: { rating: number, comment: string, author: string }, token: string) {
  const response = await fetch(`${API_BASE_URL}/destinations/${destinationId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(review),
  });
  if (!response.ok) throw new Error('Failed to add review');
  return response.json();
}

export async function uploadFile(file: File, type: 'image' | 'video', token: string) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload file');
  }
  return response.json();
}

export async function updateUser(data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
  return response.json();
}

export async function uploadImage(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload image');
  return response.json();
}

export async function uploadVideo(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload video');
  return response.json();
}

// Hotel Management API
export async function fetchPendingHotels(token: string) {
  const response = await fetch(`${API_BASE_URL}/hotels/pending`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch pending hotels');
  return response.json();
}

export async function updateHotel(id: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update hotel');
  return response.json();
}

export async function deleteHotel(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/hotels/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to delete hotel');
  return response.json();
}

export async function getMyHotels(token: string) {
  const response = await fetch(`${API_BASE_URL}/hotels/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch my hotels');
  return response.json();
}

export async function fetchHotels(city: string) {
  const response = await fetch(`${API_BASE_URL}/hotels?city=${encodeURIComponent(city)}`);
  if (!response.ok) throw new Error('Failed to fetch hotels');
  return response.json();
}

export async function createHotel(data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/hotels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create hotel');
  return response.json();
}

export async function chatWithAi(message: string, context: any) {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, context }),
  });
  if (!response.ok) throw new Error('Failed to chat with AI');
  return response.json();
}

// Trip API
export async function createTrip(data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create trip');
  return response.json();
}

export async function getUserTrips(token: string) {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to fetch trips');
  return response.json();
}

export async function deleteTrip(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to delete trip');
  return response.json();
}

export async function toggleTripVisibility(id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/trips/${id}/visibility`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  if (!response.ok) throw new Error('Failed to update trip visibility');
  return response.json();
}

export async function getPublicTrip(id: string) {
  const response = await fetch(`${API_BASE_URL}/trips/share/${id}`);
  if (!response.ok) throw new Error('Failed to fetch trip');
  return response.json();
}
