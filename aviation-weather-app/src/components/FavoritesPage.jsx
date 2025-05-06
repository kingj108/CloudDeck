import { useState, useEffect } from 'react';
import { fetchMetar } from '../services/weatherApi';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import FlightCategoryIndicator from './FlightCategoryIndicator';

export default function FavoritesPage({ favorites, onSelectAirport }) {
  const [favoritesData, setFavoritesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Flight category colors
  const flightCategoryColors = {
    VFR: '#3CB371', // Green
    MVFR: '#4169E1', // Blue
    IFR: '#FF4500', // Red
    LIFR: '#FF69B4', // Pink
  };

  useEffect(() => {
    const fetchFavoritesData = async () => {
      if (!favorites || favorites.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const promises = favorites.map(code => fetchMetar(code));
        const results = await Promise.all(promises);
        
        const newData = {};
        results.forEach((result, index) => {
          if (result && result.data && result.data.length > 0) {
            const metarData = result.data[0];
            newData[favorites[index]] = metarData;
          }
        });
        
        setFavoritesData(newData);
      } catch (err) {
        console.error('Error fetching favorites data:', err);
        setError('Failed to load favorites data');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritesData();
  }, [favorites]);

  if (loading) {
    return <LoadingIndicator isLoading={true} message="Loading your favorite airports..." />;
  }
  
  if (error) {
    return <ErrorMessage 
      message="Error Loading Favorites" 
      details={error} 
      onRetry={() => {
        setLoading(true);
        setError('');
        const fetchFavoritesData = async () => {
          try {
            const promises = favorites.map(code => fetchMetar(code));
            const results = await Promise.all(promises);
            
            const newData = {};
            results.forEach((result, index) => {
              if (result && result.data && result.data.length > 0) {
                const metarData = result.data[0];
                newData[favorites[index]] = metarData;
              }
            });
            
            setFavoritesData(newData);
          } catch (err) {
            console.error('Error fetching favorites data:', err);
            setError('Failed to load favorites data');
          } finally {
            setLoading(false);
          }
        };
        fetchFavoritesData();
      }} 
    />;
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">No favorite airports saved yet.</div>
        <div className="mt-2 text-sm text-gray-500">
          Search for an airport and click the star icon to add it to your favorites.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Favorite Airports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map(code => {
          const data = favoritesData[code];
          
          if (!data) {
            return (
              <div key={code} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{code}</h3>
                </div>
                <div className="text-gray-500">No data available</div>
              </div>
            );
          }
          
          return (
            <div 
              key={code} 
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectAirport(code)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{code}</h3>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: flightCategoryColors[data.flight_category] || '#808080' }}
                  ></div>
                  <span className="text-sm font-medium">{data.flight_category}</span>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="grid grid-cols-2">
                  <div className="text-gray-600">Wind:</div>
                  <div>{data.wind?.degrees || 0}° @ {data.wind?.speed_kts || 0} kt</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-gray-600">Visibility:</div>
                  <div>{data.visibility?.miles || 0} mi</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-gray-600">Temp / Dew:</div>
                  <div>{data.temperature?.celsius || 0}°C / {data.dewpoint?.celsius || 0}°C</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="text-gray-600">Altimeter:</div>
                  <div>{data.barometer?.hg.toFixed(2) || 29.92} inHg</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 truncate" title={data.raw_text}>
                {data.raw_text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
