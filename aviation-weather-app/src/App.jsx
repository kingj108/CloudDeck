import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WeatherDisplay from './components/WeatherDisplay';
import FavoritesList from './components/FavoritesList';
import WeatherMap from './components/WeatherMap';
import Auth from './components/Auth';
import Settings from './components/Settings';
import { fetchMetar, fetchTaf } from './services/weatherApi';

// Mock data for testing when API is unavailable
const MOCK_METAR = {
  raw_text: "KJFK 051651Z 33015G25KT 10SM FEW050 SCT250 16/M04 A3012 RMK AO2 SLP199 T01561044",
  station_id: "KJFK",
  observation_time: "2025-05-05T16:51:00Z",
  latitude: 40.64,
  longitude: -73.76,
  temp_c: 15.6,
  dewpoint_c: -4.4,
  wind_dir_degrees: 330,
  wind_speed_kt: 15,
  wind_gust_kt: 25,
  visibility_statute_mi: 10.0,
  altim_in_hg: 30.12,
  sea_level_pressure_mb: 1019.9,
  flight_category: "VFR",
  three_hr_pressure_tendency_mb: 0.5,
  maxT_c: 17.0,
  minT_c: 10.0,
  precip_in: 0.0,
  pcp3hr_in: 0.0,
  pcp6hr_in: 0.0,
  pcp24hr_in: 0.0,
  snow_in: 0.0,
  vert_vis_ft: 0,
  metar_type: "METAR",
  elevation_m: 4.0
};

const MOCK_TAF = {
  raw_text: "KJFK 051730Z 0518/0624 33015G25KT P6SM SCT050 BKN250\n     FM052000 34010KT P6SM FEW050 SCT250\n     FM060600 35008KT P6SM FEW050",
  station_id: "KJFK",
  issue_time: "2025-05-05T17:30:00Z",
  bulletin_time: "2025-05-05T17:30:00Z",
  valid_time_from: "2025-05-05T18:00:00Z",
  valid_time_to: "2025-05-06T24:00:00Z",
  latitude: 40.64,
  longitude: -73.76,
  elevation_m: 4.0
};

// Use a reliable CORS proxy for API requests
const PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://aviationweather.gov/adds/dataserver_current/httpparam';

function App() {
  // Weather data state
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMockData, setUseMockData] = useState(true); // Default to mock data for demo
  
  // UI state
  const [activeTab, setActiveTab] = useState('weather');
  const [showSettings, setShowSettings] = useState(false);
  
  // User state
  const [favorites, setFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Load favorites from localStorage on initial load
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
    
    // Check for saved login
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Authentication functions
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  };
  
  // Settings functions
  const openSettings = () => {
    setShowSettings(true);
  };
  
  const closeSettings = () => {
    setShowSettings(false);
  };
  
  const clearAllFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
  };
  
  // Toggle airport in favorites list
  const toggleFavorite = (code) => {
    let newFavorites;
    if (favorites.includes(code)) {
      newFavorites = favorites.filter(fav => fav !== code);
    } else {
      newFavorites = [...favorites, code];
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  
  const fetchWeather = async (code) => {
    if (!code || code.length < 3) {
      setError('Please enter a valid airport code');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Always use the new API service
      const [metarResponse, tafResponse] = await Promise.all([
        fetchMetar(code.toUpperCase()),
        fetchTaf(code.toUpperCase())
      ]);
      
      // Process METAR data
      if (metarResponse && metarResponse.data && metarResponse.data.length > 0) {
        const metarData = metarResponse.data[0];
        
        // Format the data to match our component expectations
        const formattedMetar = {
          station_id: metarData.icao,
          raw_text: metarData.raw_text,
          wind_dir_degrees: metarData.wind?.degrees || 0,
          wind_speed_kt: metarData.wind?.speed_kts || 0,
          visibility_statute_mi: metarData.visibility?.miles || 0,
          temp_c: metarData.temperature?.celsius || 0,
          dewpoint_c: metarData.dewpoint?.celsius || 0,
          altim_in_hg: metarData.barometer?.hg || 29.92,
          flight_category: metarData.flight_category || 'VFR'
        };
        
        setMetar(formattedMetar);
      } else {
        throw new Error('No METAR data found');
      }
      
      // Process TAF data if available
      if (tafResponse && tafResponse.data && tafResponse.data.length > 0) {
        const tafData = tafResponse.data[0];
        
        // Format the data to match our component expectations
        const formattedTaf = {
          station_id: tafData.icao,
          raw_text: tafData.raw_text,
          valid_time_from: tafData.timestamp?.valid?.from,
          valid_time_to: tafData.timestamp?.valid?.to
        };
        
        setTaf(formattedTaf);
      } else {
        // TAF is optional, so just set to null if not found
        setTaf(null);
      }
    } catch (e) {
      setError(e.message);
      setMetar(null);
      setTaf(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onSearch={fetchWeather} 
        useMockData={useMockData} 
        setUseMockData={setUseMockData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={openSettings}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
      />
      
      <main className="container mx-auto p-4 flex-grow">
        {/* Weather Tab */}
        {activeTab === 'weather' && (
          <>
            {favorites.length > 0 && (
              <FavoritesList 
                favorites={favorites} 
                onSelectAirport={fetchWeather} 
              />
            )}
            
            {loading && (
              <div className="mt-4 p-4 bg-white rounded shadow flex justify-center">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-2 bg-slate-200 rounded"></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                        <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                      </div>
                      <div className="h-2 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-white rounded shadow">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {metar && (
              <WeatherDisplay 
                metar={metar} 
                taf={taf} 
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </>
        )}
        
        {/* Weather Map Tab */}
        {activeTab === 'map' && (
          <WeatherMap />
        )}
        
        {/* Account Tab */}
        {activeTab === 'account' && (
          <Auth 
            onLogin={handleLogin}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />
        )}
      </main>
      
      {/* Settings Panel (slides in from right) */}
      {showSettings && (
        <Settings 
          onClose={closeSettings} 
          clearFavorites={clearAllFavorites} 
        />
      )}
      
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        CloudDeck &copy; {new Date().getFullYear()} - Aviation Weather App
      </footer>
    </div>
  );
}

export default App;
