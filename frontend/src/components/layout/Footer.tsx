import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800 pb-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">Join our newsletter</h3>
            <p className="text-gray-400">Get the latest travel updates and exclusive offers sent to your inbox.</p>
          </div>
          <form className="flex w-full md:w-auto gap-2 flex-col sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-gray-800 border border-gray-700 rounded-full px-6 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-80 transition-all"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-blue-600/25">
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-6">WanderLust</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Discover the world's most breathtaking destinations with us. 
              We craft unforgettable journeys tailored to your dreams.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['About Us', 'Destinations', 'Travel Guides', 'FAQ', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Top Destinations</h4>
            <ul className="space-y-4">
              {['Bali, Indonesia', 'Santorini, Greece', 'Kyoto, Japan', 'Machu Picchu, Peru', 'Reykjavik, Iceland'].map((item) => (
                <li key={item}>
                  <Link to="/destinations" className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="shrink-0 mt-1" size={18} />
                <span>123 Adventure Lane,<br />Travel City, TC 90210</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={18} />
                <span>hello@wanderlust.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WanderLust. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-white">Privacy Policy</Link>
            <Link to="/" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
