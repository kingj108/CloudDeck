import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherMap from './components/WeatherMap';
import FlightPlanning from './components/FlightPlanning';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import LoginPage from './pages/LoginPage';
import { fetchMetar, fetchTaf } from './services/weatherApi';

// Wrap the main app content
function AppContent() {
  // Weather data state
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const location = useLocation();

  // Update active tab based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/weather') setActiveTab('weather');
    else if (path === '/map') setActiveTab('map');
    else if (path === '/flight-planning') setActiveTab('flight-planning');
  }, [location]);

  // Search handler
  const handleSearch = async (icao) => {
    if (!icao) {
      setError('Please enter an airport code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const [metarData, tafData] = await Promise.all([
        fetchMetar(icao),
        fetchTaf(icao)
      ]);
      
      if (!metarData?.data?.[0]?.raw) {
        throw new Error('No weather data available for this airport');
      }
      
      setMetar(metarData);
      setTaf(tafData);
      setActiveTab('weather');
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch weather data');
      setMetar(null);
      setTaf(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh handler
  const handleRefresh = async () => {
    if (!metar?.data?.[0]?.station?.icao || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await handleSearch(metar.data[0].station.icao);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Toggle favorite
  const toggleFavorite = (icao) => {
    if (favorites.includes(icao)) {
      setFavorites(favorites.filter(fav => fav !== icao));
    } else {
      setFavorites([...favorites, icao]);
    }
  };

  // Handle login
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setFavorites([]);
  };
  
  // Render main content based on active tab
  let mainContent;
  
  if (loading) {
    mainContent = <LoadingIndicator />;
  } else if (error) {
    mainContent = <ErrorMessage message={error} />;
  } else if (activeTab === 'weather' && metar) {
    mainContent = (
      <WeatherDisplay 
        metar={metar?.data?.[0]} 
        taf={taf?.data?.[0]}
        isFavorite={favorites.includes(metar?.data?.[0]?.station?.icao)} 
        onToggleFavorite={() => toggleFavorite(metar?.data?.[0]?.station?.icao)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  } else if (activeTab === 'map') {
    mainContent = <WeatherMap isActive={activeTab === 'map'} />;
  } else if (activeTab === 'flight-planning') {
    mainContent = <FlightPlanning />;
  } else {
    // Home page content
    mainContent = (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex items-center mb-8">
          <img src="/images/CloudDeckicon.png" alt="CloudDeck Icon" className="w-20 h-20 mr-4" />
          <h2 className="text-4xl font-bold text-blue-900">Welcome to CloudDeck</h2>
        </div>
        
        <p className="mb-8 text-gray-600 max-w-2xl text-lg leading-relaxed">
          Your comprehensive aviation weather dashboard. Get real-time weather conditions, 
          plan your flights, and stay informed with our interactive weather map.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Quick Weather</h3>
            <p className="text-gray-600 mb-4">Get instant access to METAR and TAF for any airport worldwide.</p>
            <button 
              className="w-full bg-blue-900 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
              onClick={() => setActiveTab('weather')}
            >
              Check Weather
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Flight Planning</h3>
            <p className="text-gray-600 mb-4">Compare weather conditions for your departure and arrival airports.</p>
            <button 
              className="w-full bg-blue-900 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
              onClick={() => setActiveTab('flight-planning')}
            >
              Plan Flight
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Weather Map</h3>
            <p className="text-gray-600 mb-4">Interactive map showing real-time weather conditions across airports.</p>
            <button 
              className="w-full bg-blue-900 text-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
              onClick={() => setActiveTab('map')}
            >
              View Map
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-8 w-full max-w-4xl">
          <h3 className="text-2xl font-semibold text-blue-900 mb-4">Popular Airports</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              className="bg-white text-blue-900 border border-blue-200 px-6 py-3 rounded-md text-base font-medium hover:bg-blue-100 transition-colors"
              onClick={() => handleSearch('KJFK')} 
            >
              <span className="mr-2">✈️</span> KJFK
            </button>
            <button 
              className="bg-white text-blue-900 border border-blue-200 px-6 py-3 rounded-md text-base font-medium hover:bg-blue-100 transition-colors"
              onClick={() => handleSearch('KLAX')} 
            >
              <span className="mr-2">✈️</span> KLAX
            </button>
            <button 
              className="bg-white text-blue-900 border border-blue-200 px-6 py-3 rounded-md text-base font-medium hover:bg-blue-100 transition-colors"
              onClick={() => handleSearch('KORD')} 
            >
              <span className="mr-2">✈️</span> KORD
            </button>
            <button 
              className="bg-white text-blue-900 border border-blue-200 px-6 py-3 rounded-md text-base font-medium hover:bg-blue-100 transition-colors"
              onClick={() => handleSearch('KATL')} 
            >
              <span className="mr-2">✈️</span> KATL
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container min-h-screen bg-gray-100">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
        onOpenSettings={() => console.log('Settings clicked')}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
      />
      <main className="container mx-auto max-w-4xl p-4">
        {mainContent}
      </main>
    </div>
  );
}

// Main App component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
