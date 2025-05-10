import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherMap from './components/WeatherMap';
import FlightPlanning from './components/FlightPlanning';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import WeatherPage from './pages/WeatherPage';
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
      
      setMetar(metarData.data[0]);
      setTaf(tafData.data[0]);
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
    if (!metar?.station?.icao || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await handleSearch(metar.station.icao);
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
  
  // Render main content based on active tab and route
  let mainContent;
  
  if (location.pathname === '/') {
    mainContent = <WelcomePage onSearch={handleSearch} />;
  } else if (location.pathname === '/weather') {
    mainContent = (
      <WeatherPage
        metar={metar}
        taf={taf}
        loading={loading}
        error={error}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    );
  } else if (activeTab === 'map') {
    mainContent = <WeatherMap isActive={activeTab === 'map'} />;
  } else if (activeTab === 'flight-planning') {
    mainContent = <FlightPlanning onSearch={handleSearch} />;
  }
  
  return (
    <div className="min-h-screen relative">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
        onOpenSettings={() => console.log('Settings clicked')}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
      />
      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        {mainContent}
      </div>
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
