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

// Flight category colors
const flightCategoryColors = {
  VFR: '#3CB371', // Green
  MVFR: '#4169E1', // Blue
  IFR: '#FF4500', // Red
  LIFR: '#FF69B4', // Pink
  UNKNOWN: '#808080', // Gray
};

// Refresh interval in milliseconds (5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function WeatherMap({ isActive }) {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const createCustomIcon = (category) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${flightCategoryColors[category] || flightCategoryColors.UNKNOWN}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
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
      fetchWeatherData();
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

  // Format visibility with fractions
  const formatVisibility = (visibility) => {
    if (!visibility || visibility.miles === undefined) return 'N/A';
    
    // Handle 10+ miles visibility
    if (visibility.miles >= 10) {
      return '10+ mi';
    }
    
    // Convert decimal values to fractions for common values
    const value = visibility.miles;
    if (value === 0.25) return '1/4 mi';
    if (value === 0.5) return '1/2 mi';
    if (value === 0.75) return '3/4 mi';
    if (value === 1.25) return '1 1/4 mi';
    if (value === 1.5) return '1 1/2 mi';
    if (value === 1.75) return '1 3/4 mi';
    if (value === 2.5) return '2 1/2 mi';
    if (value === 2.75) return '2 3/4 mi';
    
    // For values with decimal parts that aren't common fractions, display with one decimal place
    if (value % 1 !== 0) {
      return `${value.toFixed(1)} mi`;
    }
    
    // For whole numbers, display as integers
    return `${value} mi`;
  };

  // Format the weather details for popup
  const formatWeatherDetails = (airport) => {
    // Format temperature with both Celsius and Fahrenheit
    let tempDisplay = 'N/A';
    if (airport.temp?.celsius !== undefined) {
      const celsius = airport.temp.celsius;
      const fahrenheit = Math.round((celsius * 9/5) + 32);
      tempDisplay = `${celsius}°C (${fahrenheit}°F)`;
    }
    
    const wind = airport.wind ? 
      `${airport.wind.degrees || 0}° @ ${airport.wind.speed_kts || 0}${airport.wind.gust_kts ? 'G' + airport.wind.gust_kts : ''} kt` 
      : 'Calm';
    const visibility = formatVisibility(airport.visibility);
    const clouds = formatCloudLayers(airport.clouds);
    const category = airport.flight_category || 'UNKNOWN';
    const categoryColor = flightCategoryColors[category] || flightCategoryColors.UNKNOWN;

    return (
      <div className="text-sm">
        <div className="font-bold mb-1">{airport.icao}</div>
        <div className="text-gray-600 mb-2">{airport.name}</div>
        <div><strong>Temperature:</strong> {tempDisplay}</div>
        <div><strong>Wind:</strong> {wind}</div>
        <div><strong>Visibility:</strong> {visibility}</div>
        <div><strong>Clouds:</strong> {clouds}</div>
        <div>
          <strong>Category:</strong>{' '}
          <span style={{ color: categoryColor, fontWeight: 'bold' }}>
            {category}
          </span>
        </div>
      </div>
    );
  };

  // Memoize the transformed map data
  const formattedMapData = useMemo(() => {
    return mapData.map((airport) => ({
      id: airport.icao,
      icao: airport.icao,
      name: airport.name || airport.icao,
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
      <div className="pt-20 p-4 flex justify-center">
        <div className="animate-pulse text-gray-600">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 p-4">
      <h2 className="text-xl font-semibold mb-4">Weather Map</h2>

      {/* Legend and last update time */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">Flight Categories:</div>
          {lastUpdate && (
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(flightCategoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-1"
                style={{ backgroundColor: color, border: '2px solid white' }}
              ></div>
              <span className="text-sm" style={{ color, fontWeight: 'bold' }}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden shadow" style={{ height: '500px' }}>
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
                  <strong>{airport.name}</strong>
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
