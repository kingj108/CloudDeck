import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherMap from './components/WeatherMap';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import { fetchMetar, fetchTaf, setUseMockData as setApiMockData } from './services/weatherApi';

function App() {
  console.log('App component rendering');
  
  // Weather data state
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('weather');
  const [favorites, setFavorites] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Initialize API to use real data
  useEffect(() => {
    setApiMockData(false);
  }, []);

  // Handle mock data toggle
  const handleToggleMockData = (value) => {
    setUseMockData(value);
    // Clear any cached data when toggling
    setMetar(null);
    setTaf(null);
  };
  
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
        throw new Error('Received empty weather data - using mock data instead');
      }
      
      setMetar(metarData);
      setTaf(tafData);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      
      // Always show mock data when real data fails
      setMetar(getMockMetar(icao));
      setTaf(getMockTaf(icao));
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
    mainContent = <WeatherMap />;
  } else {
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
            style={{
              backgroundColor: '#002366',
              color: 'white',
              border: '1px solid white',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleSearch('KJFK')} 
          >
            <span className="mr-2">✈️</span> New York (KJFK)
          </button>
          <button 
            style={{
              backgroundColor: '#002366',
              color: 'white',
              border: '1px solid white',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleSearch('KLAX')} 
          >
            <span className="mr-2">✈️</span> Los Angeles (KLAX)
          </button>
          <button 
            style={{
              backgroundColor: '#002366',
              color: 'white',
              border: '1px solid white',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleSearch('KORD')} 
          >
            <span className="mr-2">✈️</span> Chicago (KORD)
          </button>
          <button 
            style={{
              backgroundColor: '#002366',
              color: 'white',
              border: '1px solid white',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
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
        onOpenSettings={() => console.log('Settings clicked')}
        isLoggedIn={false}
        currentUser={null}
        useMockData={useMockData}
        setUseMockData={handleToggleMockData}
      />
      <main className="container mx-auto max-w-4xl p-4">
        {mainContent}
      </main>
    </div>
  );
}

export default App;
