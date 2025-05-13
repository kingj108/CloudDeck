import { useState } from 'react';
import Settings from '../components/Settings';
import AviationBackground from '../components/AviationBackground';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { darkMode } = useTheme();
  const [favorites, setFavorites] = useState([]);
  
  // Function to clear favorites
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites');
    // You could emit an event or call a function passed from parent
    console.log('Favorites cleared');
  };

  return (
    <AviationBackground>
      <div className="container mx-auto max-w-4xl pt-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Settings</h1>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <Settings 
            onClose={() => {}} // We don't close in page mode
            clearFavorites={clearFavorites}
            isPage={true} // Add this prop to indicate Settings is being used on a dedicated page
          />
        </div>
      </div>
    </AviationBackground>
  );
} 