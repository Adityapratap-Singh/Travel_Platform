const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const Destination = require('./models/Destination');

dotenv.config();
connectDB();

const destinations = [
  {
    id: 'dest_1',
    name: 'Santorini',
    location: 'Greece',
    country: 'Greece',
    description: 'White-washed houses and stunning sunsets over the caldera.',
    fullDescription: 'Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape. The whitewashed, cubiform houses of its 2 principal towns, Fira and Oia, cling to cliffs above an underwater caldera (crater).',
    price: 1200,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2070&auto=format&fit=crop',
    lat: 36.3932,
    lng: 25.4615,
    highlights: ['Sunset in Oia', 'Volcanic Beaches', 'Wine Tasting'],
    duration: '7 Days',
    season: ['Summer', 'Autumn'],
    interests: ['Romance', 'Beach', 'Food'],
    bestTime: 'June to September',
    verified: true
  },
  {
    id: 'dest_2',
    name: 'Kyoto',
    location: 'Japan',
    country: 'Japan',
    description: 'Ancient temples, traditional tea ceremonies, and cherry blossoms.',
    fullDescription: 'Kyoto, once the capital of Japan, is a city on the island of Honshu. It\'s famous for its numerous classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines and traditional wooden houses. It’s also known for formal traditions such as the kaiseki dining capabilities.',
    price: 1800,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
    lat: 35.0116,
    lng: 135.7681,
    highlights: ['Kinkaku-ji', 'Arashiyama Bamboo Grove', 'Fushimi Inari'],
    duration: '10 Days',
    season: ['Spring', 'Autumn'],
    interests: ['Culture', 'History', 'Nature'],
    bestTime: 'March to May, October to November',
    verified: true
  },
  {
    id: 'dest_3',
    name: 'Manali',
    location: 'Himachal Pradesh, India',
    country: 'India',
    description: 'A high-altitude resort town in the Himalayas, perfect for snow lovers.',
    fullDescription: 'Manali is a high-altitude Himalayan resort town in India’s northern Himachal Pradesh state. It has a reputation as a backpacking center and honeymoon destination. Set on the Beas River, it’s a gateway for skiing in the Solang Valley and trekking in Parvati Valley.',
    price: 500,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070&auto=format&fit=crop',
    lat: 32.2432,
    lng: 77.1892,
    highlights: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple'],
    duration: '5 Days',
    season: ['Winter', 'Summer'],
    interests: ['Adventure', 'Mountains', 'Snow'],
    bestTime: 'December to February (Snow), April to June',
    verified: true
  },
  {
    id: 'dest_4',
    name: 'Munnar',
    location: 'Kerala, India',
    country: 'India',
    description: 'Rolling tea gardens and misty hills, magical during the rains.',
    fullDescription: 'Munnar is a town in the Western Ghats mountain range in India’s Kerala state. A hill station and former resort for the British Raj elite, it\'s surrounded by rolling hills dotted with tea plantations established in the late 19th century.',
    price: 400,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=2070&auto=format&fit=crop',
    lat: 10.0889,
    lng: 77.0595,
    highlights: ['Tea Museum', 'Eravikulam National Park', 'Mattupetty Dam'],
    duration: '4 Days',
    season: ['Monsoon', 'Winter'],
    interests: ['Nature', 'Relaxation', 'Tea'],
    bestTime: 'September to March',
    verified: true
  },
  {
    id: 'dest_5',
    name: 'Cherrapunji',
    location: 'Meghalaya, India',
    country: 'India',
    description: 'One of the wettest places on Earth, famous for living root bridges.',
    fullDescription: 'Cherrapunji, also known as Sohra, is a high-altitude town in the northeast Indian state of Meghalaya. It\'s known for its living root bridges, made from rubber trees. To the northeast, Mawsmai Cave is illuminated to show its stalactites.',
    price: 600,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1622307849886-29a393d6b04d?q=80&w=1974&auto=format&fit=crop',
    lat: 25.2702,
    lng: 91.7323,
    highlights: ['Double Decker Root Bridge', 'Nohkalikai Falls', 'Mawsmai Cave'],
    duration: '5 Days',
    season: ['Monsoon'],
    interests: ['Adventure', 'Nature', 'Waterfalls'],
    bestTime: 'June to September',
    verified: true
  },
  {
    id: 'dest_6',
    name: 'New York City',
    location: 'USA',
    country: 'USA',
    description: 'The city that never sleeps, iconic landmarks and diverse culture.',
    fullDescription: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial and cultural centers.',
    price: 2000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop',
    lat: 40.7128,
    lng: -74.0060,
    highlights: ['Times Square', 'Central Park', 'Statue of Liberty'],
    duration: '5 Days',
    season: ['All Year'],
    interests: ['City', 'Culture', 'Shopping'],
    bestTime: 'All Year',
    verified: true
  },
  {
    id: 'dest_7',
    name: 'Machu Picchu',
    location: 'Peru',
    country: 'Peru',
    description: 'A 15th-century Inca citadel set high in the Andes Mountains.',
    fullDescription: 'Machu Picchu is an Incan citadel set high in the Andes Mountains in Peru, above the Urubamba River valley. Built in the 15th century and later abandoned, it’s renowned for its sophisticated dry-stone walls that fuse huge blocks without the use of mortar, intriguing buildings that play on astronomical alignments and panoramic views.',
    price: 1500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop',
    lat: -13.1631,
    lng: -72.5450,
    highlights: ['Inca Trail', 'Temple of the Sun', 'Intihuatana'],
    duration: '6 Days',
    season: ['Spring', 'Autumn'],
    interests: ['History', 'Hiking', 'Nature'],
    bestTime: 'May to October',
    verified: true
  }
];

const seedData = async () => {
  try {
    await Destination.deleteMany({});
    console.log('Cleared existing destinations');
    
    await Destination.insertMany(destinations);
    console.log('Added seed destinations');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
