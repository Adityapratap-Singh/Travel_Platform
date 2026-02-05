import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Destinations } from './pages/Destinations';
import { DestinationDetail } from './pages/DestinationDetail';
import { Experiences } from './pages/Experiences';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Contribute } from './pages/Contribute';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { PlanTrip } from './pages/PlanTrip';
import { PublicTrip } from './pages/PublicTrip';
import { Agents } from './pages/Agents';
import { AgentRegister } from './pages/AgentRegister';
import { AgentDashboard } from './pages/AgentDashboard';
import { TouristDashboard } from './pages/TouristDashboard';
import { HotelDashboard } from './pages/HotelDashboard';
import { GuideDashboard } from './pages/GuideDashboard';
import { API_BASE_URL } from './lib/api';
import { RefreshCw } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminDashboard } from './pages/AdminDashboard';

function ServerOffline() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Trying to connect to server...</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            The server might be sleeping. Please wait while we establish connection.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isServerUp, setIsServerUp] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        // If we get any response, the server is technically reachable (even if 404/500)
        // Ideally it should be 200, but for "is up" check, any response is better than network error
        if (response.status === 200) {
          setIsServerUp(true);
        } else {
          // If status is not 200, log it but maybe still consider it up if it's not a connection refused?
          // For now, strict 200 check as per backend health endpoint
          setIsServerUp(response.status === 200);
        }
      } catch (error) {
        console.error("Health check failed:", error);
        setIsServerUp(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately
    checkServerStatus();

    // Poll every 10 seconds (increased from 3s to reduce load)
    const interval = setInterval(checkServerStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking && !isServerUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!isServerUp) {
    return <ServerOffline />;
  }

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:id" element={<DestinationDetail />} />
            <Route path="destinations/:id/edit" element={<Contribute />} />
            <Route path="experiences" element={<Experiences />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogPost />} />
              <Route path="contribute" element={<Contribute />} />
              <Route path="about" element={<About />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="profile" element={<Profile />} />
              <Route path="plan-trip" element={<PlanTrip />} />
              <Route path="trips/share/:id" element={<PublicTrip />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agent/register" element={<AgentRegister />} />
              <Route path="dashboard/agent" element={<AgentDashboard />} />
              <Route path="dashboard/tourist" element={<TouristDashboard />} />
              <Route path="dashboard/hotel" element={<HotelDashboard />} />
              <Route path="dashboard/guide" element={<GuideDashboard />} />
              <Route path="dashboard/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
