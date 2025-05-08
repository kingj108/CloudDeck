import { determineFlightCategory } from '../utils/weatherUtils';

const result = {
  data: [{
    raw: rawMetar,
    station: {
      icao: icaoUpper,
      name: metarData.station?.name || icaoUpper
    },
    flight_category: metarData.flight_category || determineFlightCategory(
      metarData.visibility?.miles || parsedData.visibility,
      metarData.clouds || parsedData.clouds
    ),
    temp: {
      celsius: parsedData.temp || metarData.temperature?.celsius || metarData.temp?.celsius || metarData.temp_c
    },
    wind: {
      degrees: parsedData.windDir || metarData.wind?.degrees || metarData.wind_direction?.value,
      speed_kts: parsedData.windSpeed || metarData.wind?.speed_kts || metarData.wind?.speed?.knots,
      gust_kts: parsedData.windGust || metarData.wind?.gust_kts || metarData.wind?.gust?.knots
    },
    visibility: {
      miles: parsedData.visibility || metarData.visibility?.miles || metarData.visibility?.miles_float
    },
    altimeter: {
      inHg: parsedData.altimeter || metarData.barometer?.inHg || metarData.altim_in_hg
    },
    clouds: parsedData.clouds || metarData.clouds || [],
    timestamp: metarData.observed || metarData.time?.dt || parsedData.time || new Date().toISOString()
  }]
}; 

// Specific cache for map data with longer TTL
const mapCache = {
  data: null,
  lastUpdate: null,
  ttl: 10 * 60 * 1000, // 10 minutes TTL for map data
  isValid() {
    return this.data && this.lastUpdate && (Date.now() - this.lastUpdate < this.ttl);
  }
};

export const fetchMapData = async () => {
  debugLog('Fetching map data for multiple airports');
  
  // Check map cache first
  if (mapCache.isValid()) {
    debugLog('Using cached map data');
    return mapCache.data;
  }
  
  try {
    // Split airports into batches of 10 to reduce concurrent API calls
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < MAJOR_AIRPORTS.length; i += batchSize) {
      const batch = MAJOR_AIRPORTS.slice(i, i + batchSize);
      const batchPromises = batch.map(async (airport) => {
        try {
          // Check individual airport cache first
          const cacheKey = `metar_${airport.icao}`;
          const cachedData = cache.get(cacheKey);
          
          if (cachedData) {
            return {
              ...airport,
              ...cachedData.data[0]
            };
          }
          
          // If not in cache, fetch new data
          const metarData = await fetchMetar(airport.icao);
          
          if (!metarData || !metarData.data || !metarData.data[0]) {
            throw new Error('No METAR data available');
          }
          
          return {
            ...airport,
            ...metarData.data[0]
          };
        } catch (err) {
          debugLog(`Error fetching data for ${airport.icao}:`, err);
          return {
            ...airport,
            flight_category: 'UNKNOWN'
          };
        }
      });

      // Wait for each batch to complete before moving to next
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add small delay between batches to prevent rate limiting
      if (i + batchSize < MAJOR_AIRPORTS.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const mapData = {
      data: results
    };
    
    // Update map cache
    mapCache.data = mapData;
    mapCache.lastUpdate = Date.now();
    
    debugLog('Map data fetched successfully:', results);
    return mapData;
    
  } catch (error) {
    debugLog('Error fetching map data:', error);
    // If all fails, return airports with unknown status
    return {
      data: MAJOR_AIRPORTS.map(airport => ({
        ...airport,
        flight_category: 'UNKNOWN'
      }))
    };
  }
}; 