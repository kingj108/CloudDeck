import { useState, useEffect } from 'react';
import { parseMetar, parseTaf } from '../utils/metarParser';
import { getLocalTime } from '../utils/timeUtils';

// Flight category colors
const flightCategoryColors = {
  VFR: '#3CB371', // Green
  MVFR: '#4169E1', // Blue
  IFR: '#FF4500', // Red
  LIFR: '#FF69B4', // Pink
};

export default function WeatherDisplay({ metar, taf, favorites, onToggleFavorite, onRefresh, isRefreshing }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRawMetar, setShowRawMetar] = useState(false);
  const [showRawTaf, setShowRawTaf] = useState(false);

  const parsedMetar = parseMetar(metar?.raw);
  const parsedTaf = parseTaf(taf?.raw);

  // Format cloud layers for display
  const formatCloudLayers = (clouds) => {
    if (!clouds || clouds.length === 0) return 'CLR';
    
    return clouds.map(cloud => {
      const coverage = cloud.coverage || 'UNK';
      const height = cloud.base_feet_agl ? `${Math.round(cloud.base_feet_agl/100)*100}` : 'UNK';
      return `${coverage} @ ${height}'`;
    }).join(', ');
  };

  // Format wind direction
  const formatWind = (wind) => {
    if (!wind || wind.degrees === undefined || wind.speed_kts === undefined) return 'Calm';
    return `${wind.degrees}° @ ${wind.speed_kts}${wind.gust_kts ? 'G' + wind.gust_kts : ''} kt`;
  };

  // Format temperature
  const formatTemp = (temp) => {
    if (temp?.celsius === undefined) return 'N/A';
    const fahrenheit = (temp.celsius * 9/5) + 32;
    return `${temp.celsius}°C (${Math.round(fahrenheit)}°F)`;
  };

  // Format altimeter
  const formatAltimeter = (altimInHg) => {
    if (!altimInHg) return 'N/A';
    const hpa = (altimInHg * 33.86389).toFixed(1);
    return `${altimInHg} inHg (${hpa} hPa)`;
  };

  // Format visibility
  const formatVisibility = (vis) => {
    if (!vis) return 'N/A';
    return vis.miles >= 10 ? '10+ mi' : `${vis.miles} mi`;
  };

  // Format raw data for display
  const formatRawData = (raw) => {
    if (!raw) return 'No data available';
    return raw.replace(/\n/g, '\n'); // Ensure newlines are preserved
  };

  const windSpeed = metar.wind_speed_kt ? parseInt(metar.wind_speed_kt, 10) : 0;
  let windClass = 'text-green-600';
  if (windSpeed > 30) windClass = 'text-red-500';
  else if (windSpeed > 15) windClass = 'text-yellow-500';

  useEffect(() => {
    if (favorites && metar) {
      setIsFavorite(favorites.includes(metar.station_id));
    }
  }, [favorites, metar]);

  const handleToggleFavorite = () => {
    onToggleFavorite(metar.station_id);
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="weather-display bg-white p-4 rounded shadow space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">
          {metar.station?.name || 'Weather Data'}
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
          <button 
            onClick={handleToggleFavorite}
            className={`favorite-btn text-xl ${isFavorite ? 'active' : ''}`}
          >
            ★
          </button>
        </div>
      </div>
      
      {/* Timestamp */}
      {metar.timestamp && (
        <p className="text-sm text-gray-500 mt-1">
          Updated: {getLocalTime(metar.timestamp, metar.station?.lat, metar.station?.lon)} (Local)
        </p>
      )}
      
      {/* METAR Display */}
      <div className="metar-section">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-lg">METAR</h3>
          <button 
            onClick={() => setShowRawMetar(!showRawMetar)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${showRawMetar 
              ? 'bg-blue-800 text-white border border-white' 
              : 'bg-white text-blue-800 border border-blue-800'}`}
          >
            {showRawMetar ? 'Show Parsed' : 'Show Raw'}
          </button>
        </div>
        
        {showRawMetar ? (
          <div className="font-mono bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
            {formatRawData(metar?.raw)}
          </div>
        ) : (
          <>
            <div className="font-mono bg-gray-100 p-2 rounded">
              {parsedMetar ? (
                <>
                  <div><span className="font-semibold">Station:</span> {parsedMetar.station}</div>
                  <div><span className="font-semibold">Time:</span> {parsedMetar.time}</div>
                  <div><span className="font-semibold">Wind:</span> {parsedMetar.wind}</div>
                  <div><span className="font-semibold">Visibility:</span> {parsedMetar.visibility}</div>
                  <div><span className="font-semibold">Clouds:</span> {formatCloudLayers(metar.clouds)}</div>
                  <div><span className="font-semibold">Temperature:</span> {formatTemp(metar.temp)}</div>
                  <div><span className="font-semibold">Altimeter:</span> {formatAltimeter(parsedMetar.altimeter)}</div>
                  <div className="mt-1 text-sm">{parsedMetar.weather}</div>
                </>
              ) : (
                <pre className="whitespace-pre-wrap">{metar?.raw}</pre>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* TAF Display */}
      <div className="taf-section">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-lg">TAF</h3>
          <button 
            onClick={() => setShowRawTaf(!showRawTaf)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${showRawTaf 
              ? 'bg-blue-800 text-white border border-white' 
              : 'bg-white text-blue-800 border border-blue-800'}`}
          >
            {showRawTaf ? 'Show Parsed' : 'Show Raw'}
          </button>
        </div>
        
        {showRawTaf ? (
          <div className="font-mono bg-blue-50 p-3 rounded text-sm whitespace-pre-wrap">
            {formatRawData(taf?.raw)}
          </div>
        ) : (
          <>
            {parsedTaf ? (
              <div className="font-mono bg-blue-50 p-2 rounded">
                <div><span className="font-semibold">Station:</span> {parsedTaf.station}</div>
                <div><span className="font-semibold">Issued:</span> {parsedTaf.issued}</div>
                <div><span className="font-semibold">Valid:</span> {parsedTaf.validPeriod}</div>
                
                {parsedTaf.forecast?.map((fc, i) => (
                  <div key={i} className="mt-2 p-1 border-t border-blue-100">
                    <div className="font-semibold">{fc.changeIndicator}</div>
                    <div className="text-sm">{fc.conditions}</div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="font-mono bg-blue-50 p-2 rounded whitespace-pre-wrap">
                {taf?.raw}
              </pre>
            )}
          </>
        )}
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
          <div className="flex items-center ml-2">
            <div 
              className="w-4 h-4 rounded-full mr-1" 
              style={{ backgroundColor: flightCategoryColors[metar.flight_category] || '#808080' }}
            ></div>
            <span>{metar.flight_category}</span>
          </div>
        </li>
      </ul>
    </div>
  );
}
