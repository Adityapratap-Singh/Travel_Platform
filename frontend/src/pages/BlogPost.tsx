import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Dummy data (in real app, fetch from API)
const BLOG_POSTS = [
  {
    id: '1',
    title: '10 Hidden Gems in Southeast Asia',
    content: `
      <p class="mb-4">Southeast Asia is a treasure trove of culture, history, and natural beauty. While places like Bali and Phuket are famous for a reason, there's so much more to explore off the beaten path.</p>
      
      <h3 class="text-xl font-bold mb-2">1. Pai, Thailand</h3>
      <p class="mb-4">Nestled in the mountains of Northern Thailand, Pai offers a relaxed atmosphere, hot springs, and stunning waterfalls.</p>
      
      <h3 class="text-xl font-bold mb-2">2. Kampot, Cambodia</h3>
      <p class="mb-4">Famous for its pepper plantations and French colonial architecture, Kampot is a riverside town perfect for unwinding.</p>
      
      <p class="mb-4">... (More content would go here)</p>
    `,
    author: 'Sarah Jenkins',
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2039&auto=format&fit=crop',
    tags: ['Travel Tips', 'Asia', 'Budget']
  },
  {
    id: '2',
    title: 'The Ultimate Guide to Solo Travel',
    content: 'Full content here...',
    author: 'Mike Chen',
    date: '2024-03-10',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop',
    tags: ['Solo Travel', 'Tips', 'Safety']
  },
  {
    id: '3',
    title: 'Sustainable Tourism: How to Travel Responsibly',
    content: 'Full content here...',
    author: 'Emma Wilson',
    date: '2024-03-05',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?q=80&w=2074&auto=format&fit=crop',
    tags: ['Sustainability', 'Eco-friendly']
  }
];

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = BLOG_POSTS.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link to="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>

        <article className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="h-[400px] w-full relative">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-4 text-sm font-medium mb-4 text-white/90">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-md text-white border border-white/30">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none prose-blue prose-headings:font-bold prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
              <div className="text-gray-500 font-medium">
                Share this article
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Share2 className="w-4 h-4 mr-2" /> Copy Link
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
