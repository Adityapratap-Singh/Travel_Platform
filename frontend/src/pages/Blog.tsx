import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import type { BlogPost } from '../types';
import { Button } from '../components/ui/Button';

// Dummy data
const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '10 Hidden Gems in Southeast Asia',
    excerpt: 'Discover the untouched beauty of these lesser-known destinations that are perfect for your next adventure.',
    content: 'Full content here...',
    author: 'Sarah Jenkins',
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2039&auto=format&fit=crop',
    tags: ['Travel Tips', 'Asia', 'Budget']
  },
  {
    id: '2',
    title: 'The Ultimate Guide to Solo Travel',
    excerpt: 'Everything you need to know about traveling alone, from safety tips to meeting new people.',
    content: 'Full content here...',
    author: 'Mike Chen',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop',
    tags: ['Solo Travel', 'Tips', 'Safety']
  },
  {
    id: '3',
    title: 'Sustainable Tourism: How to Travel Responsibly',
    excerpt: 'Learn how to minimize your environmental impact and support local communities while exploring the world.',
    content: 'Full content here...',
    author: 'Emma Wilson',
    date: '2024-03-05',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?q=80&w=2074&auto=format&fit=crop',
    tags: ['Sustainability', 'Eco-friendly']
  }
];

export function Blog() {
  const [posts] = useState<BlogPost[]>(BLOG_POSTS);

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Travel Journal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Stories, tips, and guides to inspire your next adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  <Link to={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                    {post.title}
                  </Link>
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                <Link to={`/blog/${post.id}`} className="mt-auto">
                  <Button variant="outline" className="w-full group">
                    Read More 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
