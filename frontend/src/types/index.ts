export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  fullDescription: string;
  price: number;
  rating: number;
  image: string;
  lat: number;
  lng: number;
  highlights: string[];
  duration: string;
  season: string;
  interests: string[];
  country: string;
  bestTime?: string;
  createdBy?: string;
  reviews?: Review[];
  itineraries?: Itinerary[];
  safety?: SafetyInfo;
  nearbySpots?: NearbySpot[];
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Activity {
  time: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  name: string;
  days: ItineraryDay[];
}

export interface SafetyInfo {
  score: number;
  status: 'Safe' | 'Moderate' | 'Caution';
  description: string;
}

export interface NearbySpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  image?: string; // Optional image for map popup
}

export interface Experience {
  id: string;
  title: string;
  location: string;
  duration: string;
  price: number;
  image: string;
  category: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  image: string;
  city?: string;
  verified?: boolean;
  createdBy?: string;
}

export interface Trip {
  _id: string;
  name: string;
  destinations: Destination[];
  hotel?: Hotel;
  route: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'hotel' | 'destination';
  }[];
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
}
