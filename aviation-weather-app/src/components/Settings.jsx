import { useState, useEffect, useRef } from 'react';

export default function Settings({ onClose, clearFavorites }) {
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const settingsRef = useRef(null);

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        ref={settingsRef}
        className="bg-white w-96 max-w-md rounded-lg shadow-xl animate-slide-in-right"
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Appearance</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Dark Mode</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-10 h-5 bg-gray-300 rounded-full"></div>
                  <div 
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                      darkMode ? 'bg-blue-600 transform translate-x-5' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </label>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Data</h3>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Auto-refresh (every 5 min)</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={autoRefresh}
                    onChange={() => setAutoRefresh(!autoRefresh)}
                  />
                  <div className="w-10 h-5 bg-gray-300 rounded-full"></div>
                  <div 
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                      autoRefresh ? 'bg-blue-600 transform translate-x-5' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </label>
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Favorites</h3>
              <button 
                onClick={clearFavorites}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all favorites
              </button>
            </div>
            
            <div className="pt-4 border-t mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
              <p className="text-xs text-gray-600">
                CloudDeck v1.0.0<br />
                © {new Date().getFullYear()} CloudDeck Aviation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
