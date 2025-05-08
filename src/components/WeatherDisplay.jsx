import { useState } from 'react';
import { parseMetar, parseTaf } from '../utils/metarParser';
import { formatAirportLocalTime } from '../utils/timeUtils';
import FlightCategoryIndicator from './FlightCategoryIndicator';

export default function WeatherDisplay({ metar, taf, favorites, onToggleFavorite, onRefresh, isRefreshing }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRawMetar, setShowRawMetar] = useState(false);
  const [showRawTaf, setShowRawTaf] = useState(false);

  // Parse the Z time from METAR and convert to Date object
  const parseMetarTime = (timeString) => {
    if (!timeString || !timeString.endsWith('Z')) return null;
    
    const day = parseInt(timeString.slice(0, 2));
    const hour = parseInt(timeString.slice(2, 4));
    const minute = parseInt(timeString.slice(4, 6));
    
    const now = new Date();
    const date = new Date(Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      day,
      hour,
      minute
    ));
    
    // Handle month rollover
    if (day > now.getDate()) {
      date.setUTCMonth(date.getUTCMonth() - 1);
    }
    
    return date;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const parsedMetar = parseMetar(metar?.raw);

  return (
    <div className="weather-display bg-white p-4 rounded shadow space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">
          {metar.station?.name || metar.station?.icao || 'Weather Data'}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-1 ${isRefreshing ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
            title={isRefreshing ? 'Refreshing...' : 'Refresh data'}
          >
            {isRefreshing ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Timestamp */}
      {metar.timestamp && (
        <p className="text-sm text-gray-500 mt-1">
          Updated: {formatTimestamp(metar.timestamp)}
        </p>
      )}

      {/* METAR Display */}
      <div className="metar-section">
        {/* ... existing METAR display code ... */}
      </div>
      
      {/* TAF Display */}
      <div className="taf-section">
        {/* ... existing TAF display code ... */}
      </div>
      
      {/* Additional METAR Data */}
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li><span className={windClass}>Wind: {formatWind(metar.wind)}</span></li>
        <li>Visibility: {formatVisibility(metar.visibility)}</li>
        <li>Clouds: {formatCloudLayers(metar.clouds)}</li>
        <li>Temp / Dew: {formatTemp(metar.temp)} / {formatTemp(metar.dewpoint)}</li>
        <li>Altimeter: {formatAltimeter(metar.altim_in_hg)}</li>
        <li className="flex items-center">
          <span>Category: </span>
          <div className="ml-2">
            <FlightCategoryIndicator category={metar.flight_category} size="md" />
          </div>
        </li>
      </ul>
    </div>
  );
} 