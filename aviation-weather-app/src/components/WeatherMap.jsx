import { useState, useEffect, useMemo } from 'react';
import { fetchMapData } from '../services/weatherApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function WeatherMap() {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const flightCategoryColors = {
    VFR: '#3CB371', // Green
    MVFR: '#4169E1', // Blue
    IFR: '#FF4500', // Red
    LIFR: '#FF69B4', // Pink
  };

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
        console.log('Fetched data:', response); // Debugging
        if (response && response.data) {
          setMapData(response.data);
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

  useEffect(() => {
    const mockData = [
      { icao: 'KJFK', lat: 40.6413, lon: -73.7781, flight_category: 'VFR' }, // New York
      { icao: 'KLAX', lat: 33.9416, lon: -118.4085, flight_category: 'IFR' }, // Los Angeles
      { icao: 'KATL', lat: 33.6407, lon: -84.4277, flight_category: 'MVFR' }, // Atlanta
      { icao: 'KORD', lat: 41.9742, lon: -87.9073, flight_category: 'IFR' }, // Chicago O'Hare
      { icao: 'KDFW', lat: 32.8998, lon: -97.0403, flight_category: 'VFR' }, // Dallas/Fort Worth
      { icao: 'KDEN', lat: 39.8561, lon: -104.6737, flight_category: 'MVFR' }, // Denver
      { icao: 'KSFO', lat: 37.6213, lon: -122.3790, flight_category: 'IFR' }, // San Francisco
      { icao: 'KSEA', lat: 47.4502, lon: -122.3088, flight_category: 'VFR' }, // Seattle
      { icao: 'KMIA', lat: 25.7959, lon: -80.2871, flight_category: 'MVFR' }, // Miami
      { icao: 'KPHX', lat: 33.4342, lon: -112.0116, flight_category: 'VFR' }, // Phoenix
      { icao: 'KLAS', lat: 36.0840, lon: -115.1537, flight_category: 'IFR' }, // Las Vegas
      { icao: 'KCLT', lat: 35.2140, lon: -80.9431, flight_category: 'MVFR' }, // Charlotte
      { icao: 'KIAH', lat: 29.9902, lon: -95.3368, flight_category: 'VFR' }, // Houston
      { icao: 'KBOS', lat: 42.3656, lon: -71.0096, flight_category: 'IFR' }, // Boston
    ];
    setMapData(mockData);
    setLoading(false);
  }, []);

  // Memoize the transformed map data to avoid unnecessary recalculations
  const formattedMapData = useMemo(() => {
    return mapData.map((station) => ({
      id: station.icao,
      name: station.icao,
      lat: station.lat,
      lon: station.lon,
      category: station.flight_category,
    }));
  }, [mapData]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse text-gray-600">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading map:', error); // Debugging
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
        {formattedMapData && (
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

            {formattedMapData.map((airport) => (
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
