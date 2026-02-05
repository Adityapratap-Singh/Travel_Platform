import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Destinations', path: '/destinations' },
    { name: 'Plan Trip', path: '/plan-trip' },
    { name: 'Experiences', path: '/experiences' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    ...(user ? [{ name: 'Contribute', path: '/contribute' }] : []),
  ];

  const isHome = location.pathname === '/';
  const showBackground = isScrolled || !isHome;

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'agent': return '/dashboard/agent';
      case 'hotel': return '/dashboard/hotel';
      case 'guide': return '/dashboard/guide'; // Ensure this matches App.tsx
      case 'admin': return '/dashboard/admin'; // Assuming we might add this
      default: return '/dashboard/tourist';
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        showBackground ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-2.5 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Globe size={22} />
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight transition-colors duration-300",
              showBackground ? "text-gray-900" : "text-white"
            )}>
              WanderLust
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300 mr-4",
              showBackground ? "bg-gray-100/50" : "bg-white/10 backdrop-blur-sm"
            )}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive 
                        ? (showBackground ? "bg-white text-blue-600 shadow-sm" : "bg-white text-blue-600 shadow-md")
                        : (showBackground ? "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50" : "text-white/90 hover:text-white hover:bg-white/10")
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200/20">
                {user.role && user.role !== 'user' && (
                  <Link to={getDashboardLink()} className={cn(
                    "text-sm font-medium px-3 py-2 rounded-full transition-colors border hidden lg:block",
                    showBackground 
                      ? "text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100" 
                      : "text-white border-white/20 bg-white/10 hover:bg-white/20"
                  )}>
                    Dashboard
                  </Link>
                )}
                <Link to="/profile" className={cn(
                  "text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-full transition-colors", 
                  showBackground ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
                )}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                    <UserIcon size={14} />
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                </Link>
                <Button 
                  variant={showBackground ? 'outline' : 'secondary'} 
                  size="sm"
                  onClick={logout}
                  className={cn(showBackground ? "border-gray-200" : "bg-white/10 text-white border-white/20 hover:bg-white/20")}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant={showBackground ? 'primary' : 'secondary'} size="sm" className="shadow-lg shadow-blue-500/20">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={showBackground ? "text-gray-900" : "text-white"} />
            ) : (
              <Menu className={showBackground ? "text-gray-900" : "text-white"} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-600 font-medium py-2 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <div className="text-gray-600 font-medium py-2">Hi, {user.name}</div>
              {user.role && user.role !== 'user' && (
                <Link 
                  to={getDashboardLink()} 
                  className="text-blue-600 font-medium py-2 hover:text-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              )}
              <Button className="w-full" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
