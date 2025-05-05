import { useState, useEffect } from 'react';
import { fetchMapData } from '../services/weatherApi';

export default function WeatherMap() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Color codes for flight categories
  const flightCategoryColors = {
    VFR: '#3CB371', // Green
    MVFR: '#4169E1', // Blue
    IFR: '#FF4500', // Red
    LIFR: '#800080', // Purple
  };

  useEffect(() => {
    const getMapData = async () => {
      setLoading(true);
      try {
        const response = await fetchMapData();
        if (response && response.data) {
          // Transform the data to the format we need
          const formattedData = response.data.map(station => ({
            id: station.icao,
            name: station.icao,
            lat: station.lat,
            lon: station.lon,
            category: station.flight_category
          }));
          setMapData(formattedData);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        setError('Failed to load weather map data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getMapData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-semibold mb-4">US Weather Map</h2>
      
      <div className="mb-4">
        <div className="flex items-center justify-center space-x-4">
          {Object.entries(flightCategoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center">
              <div 
                className="w-4 h-4 mr-1 rounded-full" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm">{category}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative w-full h-[500px] bg-gray-100 rounded border overflow-hidden">
        {/* This would be replaced with an actual map component in production */}
        <div className="absolute inset-0 bg-gray-200 opacity-50">
          {/* Simplified US map outline */}
          <svg viewBox="0 0 1000 600" className="w-full h-full">
            <path 
              d="M 100,200 L 200,150 L 300,100 L 400,150 L 500,100 L 600,150 L 700,100 L 800,150 L 900,200 L 850,300 L 900,400 L 800,450 L 700,500 L 600,450 L 500,500 L 400,450 L 300,500 L 200,450 L 100,400 Z" 
              fill="#f0f0f0" 
              stroke="#ccc" 
              strokeWidth="2"
            />
          </svg>
        </div>
        
        {/* Airport markers */}
        <div className="absolute inset-0">
          {mapData.map(airport => {
            // Convert lat/lon to approximate position on our simplified map
            const x = ((airport.lon + 125) / 65) * 1000; // Rough conversion for demo
            const y = ((50 - airport.lat) / 25) * 600;   // Rough conversion for demo
            
            return (
              <div 
                key={airport.id}
                className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: `${x}px`, 
                  top: `${y}px`,
                  backgroundColor: flightCategoryColors[airport.category]
                }}
                title={`${airport.id} - ${airport.name} (${airport.category})`}
              ></div>
            );
          })}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Note: This is a simplified demonstration map with mock data. In a production environment, 
        this would use a proper mapping library (like Leaflet or Google Maps) with real-time data.
      </p>
    </div>
  );
}
