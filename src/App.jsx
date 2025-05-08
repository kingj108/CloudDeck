import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherMap from './components/WeatherMap';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import FlightPlanning from './components/FlightPlanning';
import WelcomeSection from './components/WelcomeSection';
import Settings from './components/Settings';
import { fetchMetar, fetchTaf } from './services/weatherApi';

function App() {
  // Weather data state
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('weather');
  const [favorites, setFavorites] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Debug log for activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

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
      return { metar: metarData, taf: tafData };
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
  } else if (activeTab === 'planning') {
    mainContent = <FlightPlanning onSearch={handleSearch} />;
  } else if (activeTab === 'weather') {
    // Default welcome content
    mainContent = (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex items-center mb-6">
          <img src="/images/CloudDeckicon.png" alt="CloudDeck Icon" className="w-16 h-16 mr-4" />
          <h2 className="text-3xl font-bold text-blue-800">Welcome to CloudDeck</h2>
        </div>
        <p className="mb-8 text-gray-600 max-w-lg">
          Your real-time aviation weather dashboard. Search for an airport by ICAO code to see current weather conditions.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-lg">
          <button 
            className="bg-blue-900 text-white border border-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
            onClick={() => handleSearch('KJFK')} 
          >
            <span className="mr-2">✈️</span> New York (KJFK)
          </button>
          <button 
            className="bg-blue-900 text-white border border-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
            onClick={() => handleSearch('KLAX')} 
          >
            <span className="mr-2">✈️</span> Los Angeles (KLAX)
          </button>
          <button 
            className="bg-blue-900 text-white border border-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
            onClick={() => handleSearch('KORD')} 
          >
            <span className="mr-2">✈️</span> Chicago (KORD)
          </button>
          <button 
            className="bg-blue-900 text-white border border-white px-6 py-3 rounded-md text-base font-medium hover:bg-blue-800 transition-colors"
            onClick={() => handleSearch('KATL')} 
          >
            <span className="mr-2">✈️</span> Atlanta (KATL)
          </button>
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
        onOpenSettings={() => setShowSettings(true)}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
      />
      <main className="container mx-auto max-w-4xl p-4">
        {mainContent}
      </main>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App; 