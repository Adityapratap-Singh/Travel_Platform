import { Button } from '../components/ui/Button';
import { Globe, Users, Award, Heart } from 'lucide-react';

export function About() {
  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              We Help You See the World Differently
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              At WanderLust, we believe travel is more than just visiting a place—it's about connecting with cultures, people, and yourself.
            </p>
            <div className="flex gap-4">
              <Button size="lg">Join Our Team</Button>
              <Button variant="outline" size="lg">Contact Us</Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-full overflow-hidden border-8 border-gray-50 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                alt="Our Team" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl max-w-xs">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50k+</div>
                  <div className="text-sm text-gray-500">Happy Travelers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're dedicated to making your journey as seamless and memorable as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Global Reach",
                description: "Access to exclusive destinations and experiences in over 100 countries worldwide."
              },
              {
                icon: Heart,
                title: "Curated with Love",
                description: "Every trip is hand-picked and verified by our team of expert travel designers."
              },
              {
                icon: Award,
                title: "Award Winning Support",
                description: "24/7 customer support to ensure your peace of mind throughout your journey."
              }
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Guides</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate experts behind your unforgettable journeys.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Alex Morgan",
                role: "Senior Travel Designer",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
              },
              {
                name: "David Chen",
                role: "Adventure Specialist",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
              },
              {
                name: "Sarah Johnson",
                role: "Cultural Expert",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"
              },
              {
                name: "Michael Ross",
                role: "Local Guide Lead",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1976&auto=format&fit=crop"
              }
            ].map((member, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-4 mx-auto w-48 h-48 rounded-full overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
