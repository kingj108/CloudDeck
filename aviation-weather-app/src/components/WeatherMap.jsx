import { useState, useEffect } from 'react';
import { fetchMapData } from '../services/weatherApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
// This is needed because Leaflet's default marker icons have paths that don't work in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function WeatherMap() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Color codes for flight categories
  const flightCategoryColors = {
    VFR: '#3CB371', // Green
    MVFR: '#4169E1', // Blue
    IFR: '#FF4500', // Red
    LIFR: '#FF69B4', // Pink
  };

  // Create custom icons for each flight category
  const createCustomIcon = (category) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${flightCategoryColors[category] || '#808080'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7],
    });
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
        <div className="animate-pulse text-gray-600">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Weather Map</h2>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="text-sm text-gray-600 mb-2">Flight Categories:</div>
        <div className="flex space-x-4">
          {Object.entries(flightCategoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-1"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm">{category}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow" style={{ height: '500px' }}>
        {mapData && (
          <MapContainer 
            center={[39.8283, -98.5795]} // Center of the US
            zoom={4} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {mapData.map(airport => (
              <Marker 
                key={airport.id}
                position={[airport.lat, airport.lon]}
                icon={createCustomIcon(airport.category)}
              >
                <Popup>
                  <div>
                    <strong>{airport.id}</strong>
                    <div>Flight Category: {airport.category}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Note: This is a simplified demonstration map with mock data. In a production environment, 
        this would use a proper mapping library (like Leaflet or Google Maps) with real-time data.
      </p>
    </div>
  );
}
