import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherMap from './components/WeatherMap';
import FlightPlanning from './components/FlightPlanning';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import Settings from './components/Settings';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import WeatherPage from './pages/WeatherPage';
import SettingsPage from './pages/SettingsPage';
import GlossaryPage from './pages/GlossaryPage';
import { ThemeProvider } from './context/ThemeContext';
import { fetchMetar, fetchTaf } from './services/weatherApi';

// Wrap the main app content
function AppContent() {
  // Weather data state
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  //User interface state
  // UI state
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Update active tab based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/weather') setActiveTab('weather');
    else if (path === '/map') setActiveTab('map');
    else if (path === '/flight-planning') setActiveTab('flight-planning');
    else if (path === '/settings') setActiveTab('settings');
    else if (path === '/glossary') setActiveTab('glossary');
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
      
      // Navigate to weather page after successful search
      if (location.pathname !== '/weather') {
        setActiveTab('weather');
        navigate('/weather');
      }
      
      // Return the data for use in other components like FlightPlanning
      return {
        metar: metarData.data[0],
        taf: tafData.data[0]
      };
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch weather data');
      setMetar(null);
      setTaf(null);
      throw err; // Rethrow to allow handling in calling components
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

  // Clear favorites
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
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

  // Handle opening settings as modal or navigating to settings page
  const handleOpenSettings = () => {
    navigate('/settings');
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
    mainContent = (
      <LoadingIndicator isLoading={loading}>
        <FlightPlanning onSearch={handleSearch} />
      </LoadingIndicator>
    );
  } else if (activeTab === 'settings') {
    mainContent = (
      <SettingsPage 
        favorites={favorites}
        clearFavorites={clearFavorites}
      />
    );
  } else if (activeTab === 'glossary') {
    mainContent = <GlossaryPage />;
  }
  
  return (
    <div className="min-h-screen relative">
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
        onOpenSettings={handleOpenSettings}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
      />
      <div className="pt-16"> {/* Add padding to account for fixed navbar */}
        {mainContent}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
          clearFavorites={clearFavorites}
        />
      )}
    </div>
  );
}

// Main App component with Router
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/settings" element={<AppContent />} />
          <Route path="/glossary" element={<AppContent />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
