import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchForm from './SearchForm';
import { getZuluTime } from '../utils/timeUtils';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ 
  onSearch, 
  activeTab,
  setActiveTab,
  onOpenSettings,
  isLoggedIn,
  currentUser
}) {
  const [zuluTime, setZuluTime] = useState(getZuluTime());
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Update Zulu time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setZuluTime(getZuluTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Implement logout functionality
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-blue-900'} shadow-lg transition-colors duration-300`}>
      <div className="container mx-auto max-w-6xl px-4 py-2">
        {/* Top row with logo and time */}
        <div className="flex justify-between items-center mb-2">
          <Link 
            to="/"
            onClick={() => setActiveTab('home')}
            className="text-xl font-light tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-300'}`}>Cloud</span>
            <span className="font-extralight text-white">Deck</span>
          </Link>
          <div className={`text-white text-sm font-mono ${darkMode ? 'bg-gray-800' : 'bg-blue-800'} px-3 py-1 rounded`}>
            {zuluTime}
          </div>
        </div>

        {/* Bottom row with navigation and search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => {
                setActiveTab('weather');
                navigate('/weather');
              }}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'weather' ? 'text-white' : `${darkMode ? 'text-blue-400 hover:text-white' : 'text-blue-300 hover:text-white'}`
              }`}
            >
              Weather
            </button>
            <button
              onClick={() => {
                setActiveTab('map');
                navigate('/map');
              }}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'map' ? 'text-white' : `${darkMode ? 'text-blue-400 hover:text-white' : 'text-blue-300 hover:text-white'}`
              }`}
            >
              Map
            </button>
            <button
              onClick={() => {
                setActiveTab('flight-planning');
                navigate('/flight-planning');
              }}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'flight-planning' ? 'text-white' : `${darkMode ? 'text-blue-400 hover:text-white' : 'text-blue-300 hover:text-white'}`
              }`}
            >
              Flight Planning
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <SearchForm onSearch={onSearch} />
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className={`text-sm ${darkMode ? 'text-blue-400 hover:text-white' : 'text-blue-300 hover:text-white'} transition-colors`}
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLoginClick}
                className={`text-sm ${darkMode ? 'text-blue-400 hover:text-white' : 'text-blue-300 hover:text-white'} transition-colors`}
              >
                Login
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className={`${darkMode ? 'text-blue-400 hover:text-white' : 'text-blue-300 hover:text-white'} transition-colors`}
            >
              <span className="sr-only">Settings</span>
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
