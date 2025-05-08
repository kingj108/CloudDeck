import { useState, useEffect } from 'react';
import SearchForm from './SearchForm';
import { getZuluTime } from '../utils/timeUtils';

export default function Navbar({ 
  onSearch, 
  activeTab,
  setActiveTab,
  onOpenSettings,
  isLoggedIn,
  currentUser
}) {
  const [zuluTime, setZuluTime] = useState(getZuluTime());

  // Update Zulu time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setZuluTime(getZuluTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="bg-blue-900 py-2 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Top row with logo and time */}
        <div className="flex justify-between items-center mb-2">
          <button 
            onClick={() => setActiveTab('weather')}
            className="text-xl font-light tracking-tight hover:opacity-80 transition-opacity"
          >
            <h1 className="flex items-center">
              <span className="font-bold text-blue-300">Cloud</span>
              <span className="font-extralight text-white">Deck</span>
            </h1>
          </button>
          <div className="text-white text-sm font-mono bg-blue-800 px-3 py-1 rounded">
            {zuluTime}
          </div>
        </div>

        {/* Bottom row with navigation and search */}
        <div className="flex justify-between items-center">
          {/* Navigation buttons */}
          <div className="flex space-x-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'weather' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('weather')}
            >
              Weather
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('map')}
            >
              Weather Map
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'planning' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('planning')}
            >
              Flight Planning
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'account' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('account')}
            >
              {isLoggedIn ? 'My Account' : 'Login'}
            </button>
          </div>

          {/* Search and settings */}
          <div className="flex items-center space-x-4">
            <SearchForm onSearch={onSearch} />
            <button 
              className="px-4 py-2 bg-blue-800 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={onOpenSettings}
            >
              Settings
            </button>
            {isLoggedIn && (
              <div className="text-white text-sm">
                <span className="bg-green-500 rounded-full w-2 h-2 inline-block mr-1"></span>
                {currentUser.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 