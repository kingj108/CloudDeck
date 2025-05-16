import { useState, useEffect } from 'react';
import { parseMetar, parseTaf } from '../utils/metarParser';
import { getLocalTime } from '../utils/timeUtils';
import FlightCategoryIndicator from './FlightCategoryIndicator';

// Flight category colors
const flightCategoryColors = {
  VFR: '#3CB371', // Green
  MVFR: '#4169E1', // Blue
  IFR: '#FF4500', // Red
  LIFR: '#FF69B4', // Pink
};

export default function WeatherDisplay({ metar, taf, favorites, onToggleFavorite, onRefresh, isRefreshing, compact }) {
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
    
    // Handle 10+ miles visibility
    if (vis.miles >= 10) {
      return '10+ mi';
    }
    
    // Convert decimal values to fractions for common values
    const value = vis.miles;
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

  // Format raw data for display
  const formatRawData = (raw) => {
    if (!raw) return 'No data available';
    return raw.replace(/\n/g, '\n'); // Ensure newlines are preserved
  };

  const windSpeed = metar?.wind_speed_kt ? parseInt(metar.wind_speed_kt, 10) : 0;
  let windClass = 'text-green-600';
  if (windSpeed > 30) windClass = 'text-red-500';
  else if (windSpeed > 15) windClass = 'text-yellow-500';

  useEffect(() => {
    if (favorites && metar) {
      setIsFavorite(favorites?.includes(metar.station_id));
    }
  }, [favorites, metar]);

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(metar.station_id);
      setIsFavorite(!isFavorite);
    }
  };

  // Format TAF time with better readability
  const formatTafTime = (date, lat, lon) => {
    if (!date) return '';
    
    const now = new Date();
    const localTime = getLocalTime(date, lat, lon);
    
    // Skip timezone detection if not found properly
    if (!localTime || localTime === 'N/A' || localTime === 'Invalid Date') {
      // Fallback to simple formatting
      const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZoneName: 'short'
      };
      const dateOptions = {
        month: 'numeric',
        day: 'numeric'
      };
      
      return `${date.toLocaleDateString('en-US', dateOptions)} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
    }
    
    // Extract date and time portions
    const timeParts = localTime.split(' ');
    const timeOnly = timeParts.slice(-2).join(' '); // Time and AM/PM
    
    // Calculate day difference for "TODAY", "TOMORROW", etc.
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
    
    let prefix = '';
    if (diffDays < 0) {
      // If it's a date in the past, use the actual date
      const options = { month: 'short', day: 'numeric' };
      prefix = date.toLocaleDateString('en-US', options).toUpperCase() + ' AT ';
    } else if (diffDays === 0) {
      prefix = 'TODAY AT ';
    } else if (diffDays === 1) {
      prefix = 'TOMORROW AT ';
    } else {
      // Get the day of the week if it's further in the future
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      prefix = `${dayOfWeek} AT `;
    }
    
    // Extract timezone abbreviation
    let timezone = 'EDT'; // Default
    const tzMatch = localTime.match(/[A-Z]{2,4}$/);
    if (tzMatch) {
      timezone = tzMatch[0];
    }
    
    return `${prefix}${timeOnly} ${timezone}`;
  };

  // Format TAF visibility
  const formatTafVisibility = (visibility) => {
    if (!visibility) return 'N/A';
    
    // Handle P6SM (more than 6 statute miles)
    if (visibility.isPlus) return '6+ sm';
    
    // Convert decimal values to fractions for common values
    const value = visibility.miles;
    if (value === 0.25) return '1/4 sm';
    if (value === 0.5) return '1/2 sm';
    if (value === 0.75) return '3/4 sm';
    if (value === 1.25) return '1 1/4 sm';
    if (value === 1.5) return '1 1/2 sm';
    if (value === 1.75) return '1 3/4 sm';
    if (value === 2.5) return '2 1/2 sm';
    if (value === 2.75) return '2 3/4 sm';
    
    // For values with decimal parts that aren't common fractions, display with one decimal place
    if (value % 1 !== 0) {
      return `${value.toFixed(1)} sm`;
    }
    
    // For whole numbers, display as integers
    return `${value} sm`;
  };

  // Format TAF conditions
  const formatTafConditions = (conditions) => {
    if (!conditions) return null;
    
    // Flight category colors
    const categoryColors = {
      VFR: '#3CB371',  // Green
      MVFR: '#4169E1', // Blue
      IFR: '#FF4500',  // Red
      LIFR: '#FF69B4'  // Pink
    };
    
    // Get color for flight category
    const getCategoryColor = (category) => {
      return categoryColors[category] || '#6B7280'; // Default gray if not found
    };
    
    // Convert cloud coverage codes to readable text
    const formatCloudCoverage = (code) => {
      switch (code) {
        case 'FEW': return 'Few';
        case 'SCT': return 'Scattered';
        case 'BKN': return 'Broken';
        case 'OVC': return 'Overcast';
        case 'SKC':
        case 'CLR': return 'Clear';
        default: return code;
      }
    };
    
    // Format wind direction to handle variable winds
    const formatWindDirection = (wind) => {
      if (!wind) return '';
      if (wind.direction === 'VRB') return 'Variable';
      if (wind.degrees === 0 || wind.degrees >= 360) return 'N';
      return wind.degrees + '°';
    };
    
    const categoryColor = getCategoryColor(conditions.flight_category);
    
    return (
      <div className="space-y-2">
        <div className="font-bold text-lg text-center flex items-center justify-center">
          <span 
            className="inline-block w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: categoryColor }}
          ></span>
          <span style={{ color: categoryColor }}>
            {conditions.flight_category}
          </span>
        </div>
        
        {/* Wind */}
        {conditions.wind && (
          <div>
            <div className="font-semibold">Wind</div>
            <div>
              {formatWindDirection(conditions.wind)} at {conditions.wind.speed_kts}
              {conditions.wind.gust_kts ? ` - ${conditions.wind.gust_kts}` : ''} kts
            </div>
          </div>
        )}
        
        {/* Visibility */}
        {conditions.visibility && (
          <div>
            <div className="font-semibold">Visibility</div>
            <div>
              {formatTafVisibility(conditions.visibility)}
            </div>
          </div>
        )}
        
        {/* Clouds */}
        {conditions.clouds && conditions.clouds.length > 0 ? (
          <div>
            <div className="font-semibold">Clouds (AGL)</div>
            <div>
              {conditions.clouds.map((cloud, i) => (
                <div key={i}>
                  {formatCloudCoverage(cloud.coverage)} {Math.round(cloud.base_feet_agl/1000)},000'
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="font-semibold">Clouds (AGL)</div>
            <div>Clear</div>
          </div>
        )}
      </div>
    );
  };

  // Format TAF forecast
  const formatTafForecast = (taf, lat, lon) => {
    if (!taf || !taf.forecast || taf.forecast.length === 0) {
      return (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-700">No forecast periods available in the TAF data.</p>
        </div>
      );
    }
    
    const periods = taf.forecast;
    
    // Set expiration times - each period expires when the next one begins
    for (let i = 0; i < periods.length - 1; i++) {
      if (!periods[i].expires) {
        periods[i].expires = periods[i + 1].changeTime;
      }
    }
    
    // The last period expires at the end of the valid period
    if (periods.length > 0) {
      const lastPeriod = periods[periods.length - 1];
      if (!lastPeriod.expires && taf.validPeriodTimes?.end) {
        lastPeriod.expires = taf.validPeriodTimes.end;
      }
    }
    
    // Find the current period
    const now = new Date();
    let currentPeriod = -1;
    
    for (let i = 0; i < periods.length; i++) {
      if (periods[i].changeTime && periods[i].expires) {
        if (now >= periods[i].changeTime && now < periods[i].expires) {
          currentPeriod = i;
          break;
        }
      }
    }
    
    // If no current period was found, use the first one if it's in the future
    if (currentPeriod === -1 && periods[0].changeTime && now < periods[0].changeTime) {
      currentPeriod = 0;
    }
    
    return periods.map((period, i) => {
      const isCurrent = i === currentPeriod;
      
      return (
        <div key={i} className={`mt-4 p-3 border rounded-lg ${isCurrent ? 
          'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <div className="font-bold text-lg mb-2">
            {formatTafTime(period.changeTime, lat, lon)}
            {isCurrent && (
              <span className="ml-2 text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded">
                CURRENT
              </span>
            )}
          </div>
          
          {formatTafConditions(period)}
          
          {period.expires && (
            <div className="mt-2 text-sm text-gray-500">
              <div className="font-semibold">Expires</div>
              <div>{formatTafTime(period.expires, lat, lon)}</div>
            </div>
          )}
        </div>
      );
    });
  };

  // If no METAR data is provided, show an error message
  if (!metar || !metar.raw) {
    return (
      <div className="text-center p-4 text-gray-500">
        No weather data available
      </div>
    );
  }

  // Determine the container class based on whether we're in compact mode
  const containerClass = compact 
    ? "weather-display bg-white rounded-lg space-y-3" 
    : "pt-20 px-6";

  const contentClass = compact 
    ? "" 
    : "weather-display bg-white p-6 rounded-lg shadow-lg space-y-4 max-w-4xl mx-auto";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-800">
            {metar.station?.name || metar.station?.icao || 'Weather Data'}
          </h2>
          <div className="flex space-x-2">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`p-1 ${isRefreshing ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                title={isRefreshing ? 'Refreshing...' : 'Refresh data'}
              >
                {isRefreshing ? '⏳' : '🔄'}
              </button>
            )}
            {onToggleFavorite && (
              <button 
                onClick={handleToggleFavorite}
                className={`favorite-btn text-xl ${isFavorite ? 'active' : ''}`}
              >
                ★
              </button>
            )}
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
        {taf && taf.raw && (
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
                    {formatTafForecast(parsedTaf, metar.station?.lat, metar.station?.lon)}
                  </div>
                ) : (
                  <pre className="font-mono bg-blue-50 p-2 rounded whitespace-pre-wrap">
                    {taf?.raw}
                  </pre>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Additional METAR Data */}
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li><span className={windClass}>Wind: {formatWind(metar.wind)}</span></li>
          <li>Visibility: {formatVisibility(metar.visibility)}</li>
          <li>Clouds: {formatCloudLayers(metar.clouds)}</li>
          <li>Temp / Dew: {formatTemp(metar.temp)} / {formatTemp(metar.dewpoint)}</li>
          <li>Altimeter: {formatAltimeter(parsedMetar?.altimeter)}</li>
          <li className="flex items-center">
            <span>Category: </span>
            <div className="ml-2">
              <FlightCategoryIndicator 
                category={metar.flight_category} 
                size="md" 
                colorText={true} 
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
