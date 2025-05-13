import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Settings({ onClose, clearFavorites, isPage = false }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const settingsRef = useRef(null);

  // Close settings when clicking outside (only when used as a modal)
  useEffect(() => {
    if (isPage) return; // Skip this effect when used in a page
    
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isPage]);

  // Render the settings content (used in both modal and page)
  const SettingsContent = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Appearance</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="dark:text-gray-300">Dark Mode</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div 
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                darkMode ? 'bg-blue-600 transform translate-x-5' : 'bg-white'
              }`}
            ></div>
          </div>
        </label>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</h3>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="dark:text-gray-300">Auto-refresh (every 5 min)</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
            />
            <div className="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div 
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                autoRefresh ? 'bg-blue-600 transform translate-x-5' : 'bg-white'
              }`}
            ></div>
          </div>
        </label>
      </div>
      
      <div className="pt-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Favorites</h3>
        <button 
          onClick={clearFavorites}
          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Clear all favorites
        </button>
      </div>
      
      <div className="pt-4 border-t dark:border-gray-700 mt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          CloudDeck v1.0.0<br />
          © {new Date().getFullYear()} CloudDeck Aviation
        </p>
      </div>
    </div>
  );

  // When used as a page, return just the content without the modal container
  if (isPage) {
    return <SettingsContent />;
  }

  // When used as a modal, wrap with modal container
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        ref={settingsRef}
        className="bg-white dark:bg-gray-800 w-96 max-w-md rounded-lg shadow-xl animate-slide-in-right"
      >
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold dark:text-white">Settings</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <SettingsContent />
        </div>
      </div>
    </div>
  );
}
