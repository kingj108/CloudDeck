import { useState, useEffect, useMemo } from 'react';
import { fetchMapData } from '../services/weatherApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getFlightCategoryColor } from '../utils/weatherUtils';
import { formatAirportLocalTime, formatTimestamp } from '../utils/timeUtils';
import LoadingIndicator from './LoadingIndicator';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Refresh interval in milliseconds (10 minutes)
const REFRESH_INTERVAL = 10 * 60 * 1000;

export default function WeatherMap({ isActive }) {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const createCustomIcon = (category) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${getFlightCategoryColor(category)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7],
    });
  };

  const fetchWeatherData = async () => {
    if (!isActive) return;
    
    setLoading(true);
    try {
      const response = await fetchMapData();
      if (response && response.data) {
        setMapData(response.data);
        setLastUpdate(new Date());
        setError('');
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

  // Fetch data when tab becomes active
  useEffect(() => {
    if (isActive) {
      // Only fetch if we don't have data or data is old
      if (!lastUpdate || Date.now() - lastUpdate.getTime() >= REFRESH_INTERVAL) {
        fetchWeatherData();
      }
      
      // Start auto-refresh when tab is active
      const newIntervalId = setInterval(fetchWeatherData, REFRESH_INTERVAL);
      setIntervalId(newIntervalId);
    } else {
      // Clear interval when tab is inactive
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive]);

  // Format cloud layers for display
  const formatCloudLayers = (clouds) => {
    if (!clouds || clouds.length === 0) return 'CLR';
    
    return clouds.map(cloud => {
      const coverage = cloud.coverage || 'UNK';
      const height = cloud.base_feet_agl ? `${Math.round(cloud.base_feet_agl/100)*100}` : 'UNK';
      return `${coverage} @ ${height}'`;
    }).join(', ');
  };

  // Format the weather details for popup
  const formatWeatherDetails = (airport) => {
    const temp = airport.temp?.celsius !== undefined ? `${airport.temp.celsius}°C` : 'N/A';
    const wind = airport.wind ? 
      `${airport.wind.degrees || 0}° @ ${airport.wind.speed_kts || 0}${airport.wind.gust_kts ? 'G' + airport.wind.gust_kts : ''} kt` 
      : 'Calm';
    const visibility = airport.visibility?.miles !== undefined ? 
      `${airport.visibility.miles >= 10 ? '10+' : airport.visibility.miles} mi` 
      : 'N/A';
    const clouds = formatCloudLayers(airport.clouds);

    return (
      <div className="text-sm">
        <div className="font-bold mb-1">{airport.station?.icao || airport.icao}</div>
        <div className="text-gray-600 mb-2">{airport.station?.name || airport.name}</div>
        <div><strong>Updated:</strong> {formatTimestamp(airport.timestamp)}</div>
        <div><strong>Temperature:</strong> {temp}</div>
        <div><strong>Wind:</strong> {wind}</div>
        <div><strong>Visibility:</strong> {visibility}</div>
        <div><strong>Clouds:</strong> {clouds}</div>
        <div><strong>Category:</strong> {airport.flight_category}</div>
      </div>
    );
  };

  // Memoize the transformed map data
  const formattedMapData = useMemo(() => {
    return mapData.map((airport) => ({
      id: airport.station?.icao || airport.icao,
      icao: airport.station?.icao || airport.icao,
      name: airport.station?.name || airport.name,
      lat: airport.lat,
      lon: airport.lon,
      category: airport.flight_category,
      clouds: airport.clouds,
      details: formatWeatherDetails(airport),
    }));
  }, [mapData]);

  if (!isActive) {
    return null;
  }

  if (loading && !mapData.length) {
    return (
      <div className="p-4 flex justify-center">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Weather Map</h2>
        {lastUpdate && (
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="glass-panel p-4">
        <div className="flex flex-wrap gap-4">
          {Object.entries(getFlightCategoryColor.COLORS || {}).map(([category, color]) => (
            <div key={category} className="flex items-center">
              <div className={`category-badge ${category.toLowerCase()}`}>
                {category}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="weather-card" style={{ height: '600px' }}>
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
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
                <div className="glass-panel p-3">
                  {airport.details}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
} 