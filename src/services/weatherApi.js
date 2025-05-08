import { determineFlightCategory } from '../utils/weatherUtils';

const API_BASE_URL = '/api';

// Cache implementation
const cache = {
  data: new Map(),
  ttl: 5 * 60 * 1000, // 5 minutes TTL
  get(key) {
    const item = this.data.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.data.delete(key);
      return null;
    }
    return item.value;
  },
  set(key, value) {
    this.data.set(key, {
      value,
      timestamp: Date.now()
    });
  }
};

// Fetch METAR data for a single airport
export const fetchMetar = async (icao) => {
  const icaoUpper = icao.toUpperCase();
  const cacheKey = `metar_${icaoUpper}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/metar/${icaoUpper}`);
    if (!response.ok) {
      throw new Error('Failed to fetch METAR data');
    }
    
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching METAR:', error);
    throw error;
  }
};

// Fetch TAF data for a single airport
export const fetchTaf = async (icao) => {
  const icaoUpper = icao.toUpperCase();
  const cacheKey = `taf_${icaoUpper}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/taf/${icaoUpper}`);
    if (!response.ok) {
      throw new Error('Failed to fetch TAF data');
    }
    
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching TAF:', error);
    throw error;
  }
};

// Major US airports for the map
const MAJOR_AIRPORTS = [
  { icao: 'KATL', name: 'Atlanta', lat: 33.6367, lon: -84.4281 },
  { icao: 'KBOS', name: 'Boston', lat: 42.3656, lon: -71.0096 },
  { icao: 'KORD', name: 'Chicago', lat: 41.9786, lon: -87.9048 },
  { icao: 'KDFW', name: 'Dallas', lat: 32.8968, lon: -97.0380 },
  { icao: 'KDEN', name: 'Denver', lat: 39.8561, lon: -104.6737 },
  { icao: 'KJFK', name: 'New York', lat: 40.6399, lon: -73.7787 },
  { icao: 'KLAX', name: 'Los Angeles', lat: 33.9416, lon: -118.4085 },
  { icao: 'KMIA', name: 'Miami', lat: 25.7932, lon: -80.2906 },
  { icao: 'KPHX', name: 'Phoenix', lat: 33.4342, lon: -112.0117 },
  { icao: 'KSEA', name: 'Seattle', lat: 47.4502, lon: -122.3088 }
];

// Map data cache with longer TTL
const mapCache = {
  data: null,
  lastUpdate: null,
  ttl: 10 * 60 * 1000, // 10 minutes TTL
  isValid() {
    return this.data && this.lastUpdate && (Date.now() - this.lastUpdate < this.ttl);
  }
};

// Fetch weather data for multiple airports (used by the map)
export const fetchMapData = async () => {
  // Check map cache first
  if (mapCache.isValid()) {
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
          console.error(`Error fetching data for ${airport.icao}:`, err);
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
    
    return mapData;
    
  } catch (error) {
    console.error('Error fetching map data:', error);
    // If all fails, return airports with unknown status
    return {
      data: MAJOR_AIRPORTS.map(airport => ({
        ...airport,
        flight_category: 'UNKNOWN'
      }))
    };
  }
}; 