// Weather API service with comprehensive debugging

// Configuration
const DEBUG_MODE = true;
const API_CONFIG = {
  endpoints: {
    ADDS_METAR: 'https://aviationweather.gov/adds/dataserver_current/httpparam',
    ADDS_TAF: 'https://aviationweather.gov/adds/dataserver_current/httpparam',
    NOAA_METAR: 'https://aviationweather.gov/api/data/metar',
    NOAA_TAF: 'https://aviationweather.gov/api/data/taf'
  },
  params: {
    metar: {
      dataSource: 'metars',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: 3
    },
    taf: {
      dataSource: 'tafs',
      requestType: 'retrieve',
      format: 'xml',
      hoursBeforeNow: 3
    }
  },
  retries: 3,
  retryDelay: 1000,
  timeout: 5000
};

// CORS proxy configuration
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Debug logging helper
const debugLog = (...args) => DEBUG_MODE && console.log('[WEATHER API DEBUG]', ...args);

// Flag to control whether to use mock data or real API data
// Default to false to ensure real data is used by default
let useMockData = false;

// Function to toggle mock data usage
export function setUseMockData(value) {
  useMockData = value;
  debugLog(`Mock data set to: ${value}`);
  // Clear cache when switching between real and mock data
  cache.clear();
  return useMockData;
}

// Simple in-memory cache
const cache = {
  data: {},
  // Set cache with optional TTL (default 5 minutes)
  set(key, value, ttl = 5 * 60 * 1000) {
    this.data[key] = {
      value,
      expiry: Date.now() + ttl
    };
  },
  // Get cache if not expired
  get(key) {
    const item = this.data[key];
    if (!item) return null;
    if (Date.now() > item.expiry) {
      delete this.data[key];
      return null;
    }
    return item.value;
  },
  // Clear all cache items
  clear() {
    this.data = {};
    console.log('Cache cleared');
  },
  // Clear expired items
  cleanup() {
    const now = Date.now();
    Object.keys(this.data).forEach(key => {
      if (now > this.data[key].expiry) {
        delete this.data[key];
      }
    });
  }
};

// Rate limiting
const rateLimits = {
  calls: {},
  // Check if we can make an API call to a specific endpoint
  canMakeCall(endpoint, limit = 10, period = 60 * 1000) {
    const now = Date.now();
    if (!this.calls[endpoint]) {
      this.calls[endpoint] = [];
    }
    
    // Remove expired timestamps
    this.calls[endpoint] = this.calls[endpoint].filter(time => now - time < period);
    
    // Check if we're under the limit
    if (this.calls[endpoint].length < limit) {
      this.calls[endpoint].push(now);
      return true;
    }
    
    return false;
  }
};

const fetchWithRetry = async (url, options = {}, retries = API_CONFIG.retries) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(CORS_PROXY + url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

const OPENWEATHER_API_KEY = 'YOUR_API_KEY';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/3.0/station';

const fetchOpenWeatherMap = async (icao) => {
  try {
    const response = await fetch(`${OPENWEATHER_URL}/${icao}/observations/current?appid=${OPENWEATHER_API_KEY}`);
    const data = await response.json();
    return {
      raw: data.weather.raw,
      station: {
        icao: data.station.id,
        name: data.station.name
      }
    };
  } catch (error) {
    console.error('OpenWeatherMap Error:', error);
    return null;
  }
};

const fetchAviationWeather = async (icao, type = 'metar') => {
  const params = new URLSearchParams({
    ...API_CONFIG.params[type],
    stationString: icao
  });

  // Try ADDS API first
  try {
    const response = await fetchWithRetry(`${API_CONFIG.endpoints.ADDS_METAR}?${params}`);
    const text = await response.text();
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const rawText = xml.querySelector('raw_text')?.textContent;
    if (rawText) return rawText;
  } catch (error) {
    debugLog(`ADDS ${type.toUpperCase()} Error:`, error);
  }

  // Fallback to NOAA API
  try {
    const response = await fetchWithRetry(`${API_CONFIG.endpoints.NOAA_METAR}?ids=${icao}&format=json`);
    const data = await response.json();
    if (data[0]?.rawOb) return data[0].rawOb;
  } catch (error) {
    debugLog(`NOAA ${type.toUpperCase()} Error:`, error);
  }

  // Fallback to OpenWeatherMap API
  try {
    const openWeatherMapData = await fetchOpenWeatherMap(icao);
    if (openWeatherMapData) return openWeatherMapData.raw;
  } catch (error) {
    debugLog(`OpenWeatherMap ${type.toUpperCase()} Error:`, error);
  }

  // Final fallback to direct text endpoint
  try {
    const response = await fetchWithRetry(`https://aviationweather.gov/api/data/${type}?ids=${icao}&format=raw`);
    const rawText = (await response.text()).trim();
    
    if (!rawText || rawText === 'NO DATA') {
      throw new Error('Empty raw response');
    }
    
    return rawText;
  } catch (error) {
    debugLog(`Raw ${type.toUpperCase()} Error:`, error);
    throw error;
  }
};

const parseRawMetar = (raw) => {
  return {
    raw,
    flight_category: raw.match(/CF\d+|CAVOK/) ? 'VFR' : 'UNKNOWN',
    temp: { celsius: parseInt(raw.match(/\d{2}\/(\d{2})/)?.[1] || '15') },
    wind: {
      degrees: parseInt(raw.match(/(\d{3})KT/)?.[1] || '0'),
      speed_kts: parseInt(raw.match(/(\d{2})KT/)?.[0] || '0')
    }
  };
};

/**
 * Fetch METAR data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to METAR data
 */
export const fetchMetar = async (icao) => {
  const icaoUpper = icao.toUpperCase();
  console.log('[DEBUG] Starting METAR fetch for', icaoUpper);

  try {
    const raw = await fetchAviationWeather(icaoUpper, 'metar');
    console.log('[DEBUG] Raw API Response:', raw);
    
    const parsed = parseRawMetar(raw);
    console.log('[DEBUG] Parsed Data:', parsed);

    if (!parsed.raw || parsed.raw.includes('NO DATA')) {
      throw new Error('Invalid parsed data');
    }

    return { 
      data: [{
        ...parsed,
        station: { 
          icao: icaoUpper,
          name: `${icaoUpper} Airport`
        }
      }]
    };
  } catch (error) {
    console.error('[ERROR] METAR Failure:', error.message);
    console.log('[DEBUG] Falling back to mock data');
    return getMockMetar(icaoUpper);
  }
};

const getMockMetar = (icao) => {
  console.log('[MOCK] Generating mock data for', icao);
  return {
    data: [{
      raw: 'METAR MOCK 000000Z 00000KT',
      station: { icao, name: `${icao} (Mock)` }
    }]
  };
};

/**
 * Fetch TAF data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to TAF data
 */
export const fetchTaf = async (icao) => {
  debugLog(`Starting TAF fetch for ${icao}`);
  
  if (!icao) {
    console.error('No ICAO code provided');
    return getMockTaf('KJFK');
  }
  
  icao = icao.toUpperCase().trim();
  
  if (useMockData) {
    debugLog('Using mock data');
    return getMockTaf(icao);
  }
  
  try {
    const raw = await fetchAviationWeather(icao, 'taf');
    return { data: [{ raw, station: { icao } }] };
  } catch (error) {
    debugLog('All TAF sources failed:', error);
    return getMockTaf(icao);
  }
};

/**
 * Fetch station information for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to station data
 */
export const fetchStation = async (icao) => {
  try {
    // In a real app with a valid API key:
    // const response = await fetch(`${BASE_URL}/station/${icao}`, {
    //   headers: {
    //     'X-API-Key': API_KEY
    //   }
    // });
    // return await response.json();
    
    // For demo purposes, we'll return mock data
    return {
      data: [
        {
          icao,
          name: getMockAirportName(icao),
          location: {
            lat: 40.6413,
            lon: -73.7781
          }
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching station data:', error);
    throw new Error('Failed to fetch station data');
  }
};

/**
 * Fetch weather map data for multiple stations
 * @returns {Promise} - Promise resolving to map data
 */
export const fetchMapData = async () => {
  // Check cache first
  const cacheKey = 'map_data';
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log('Using cached map data');
    return cachedData;
  }
  
  try {
    console.log('Fetching map data for multiple airports');
    
    // Get data for major US airports
    const airports = [
      'KATL', 'KBOS', 'KDFW', 'KDEN', 'KLAX', 'KMIA', 'KJFK', 'KORD', 'KSFO', 'KSEA',
      'KLAS', 'KPHX', 'KMCO', 'KIAH', 'KSLC', 'KCLT', 'KMSP', 'KDTW', 'KPHL', 'KCVG'
    ];
    
    // Fetch METAR data for all airports in batches to avoid rate limiting
    const mapData = [];
    const batchSize = 5; // Process airports in batches
    
    for (let i = 0; i < airports.length; i += batchSize) {
      const batch = airports.slice(i, i + batchSize);
      const promises = batch.map(icao => fetchMetar(icao));
      
      try {
        const results = await Promise.all(promises);
        
        results.forEach((result, index) => {
          const airportIndex = i + index;
          const airportCode = airports[airportIndex];
          
          if (result && result.data && result.data.length > 0) {
            const airport = result.data[0];
            mapData.push({
              icao: airport.icao || airportCode,
              lat: airport.latitude || getDefaultCoordinates(airportCode).lat,
              lon: airport.longitude || getDefaultCoordinates(airportCode).lon,
              flight_category: airport.flight_category || 'VFR'
            });
          } else {
            // Use default data if API doesn't return valid data
            mapData.push({
              icao: airportCode,
              ...getDefaultCoordinates(airportCode),
              flight_category: getRandomFlightCategory()
            });
          }
        });
        
        // Add a small delay between batches to avoid rate limiting
        if (i + batchSize < airports.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i}-${i+batchSize}:`, batchError);
        // For any batch that fails, add default data for those airports
        batch.forEach(airportCode => {
          mapData.push({
            icao: airportCode,
            ...getDefaultCoordinates(airportCode),
            flight_category: getRandomFlightCategory()
          });
        });
      }
    }
    
    const result = { data: mapData };
    
    // Cache the result for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  } catch (error) {
    console.error('Error fetching map data:', error);
    return getFallbackMapData();
  }
};

// Helper function to get fallback map data
const getFallbackMapData = () => {
  return {
    data: [
      { icao: 'KATL', lat: 33.6407, lon: -84.4277, flight_category: 'VFR' },
      { icao: 'KBOS', lat: 42.3656, lon: -71.0096, flight_category: 'MVFR' },
      { icao: 'KDFW', lat: 32.8998, lon: -97.0403, flight_category: 'VFR' },
      { icao: 'KDEN', lat: 39.8561, lon: -104.6737, flight_category: 'IFR' },
      { icao: 'KLAX', lat: 33.9416, lon: -118.4085, flight_category: 'VFR' },
      { icao: 'KMIA', lat: 25.7932, lon: -80.2906, flight_category: 'MVFR' },
      { icao: 'KJFK', lat: 40.6413, lon: -73.7781, flight_category: 'IFR' },
      { icao: 'KORD', lat: 41.9742, lon: -87.9073, flight_category: 'LIFR' },
      { icao: 'KSFO', lat: 37.6213, lon: -122.3790, flight_category: 'MVFR' },
      { icao: 'KSEA', lat: 47.4502, lon: -122.3088, flight_category: 'IFR' }
    ]
  };
};

// Helper function to get default coordinates for major airports
const getDefaultCoordinates = (icao) => {
  const coordinates = {
    'KATL': { lat: 33.6407, lon: -84.4277 },
    'KBOS': { lat: 42.3656, lon: -71.0096 },
    'KDFW': { lat: 32.8998, lon: -97.0403 },
    'KDEN': { lat: 39.8561, lon: -104.6737 },
    'KLAX': { lat: 33.9416, lon: -118.4085 },
    'KMIA': { lat: 25.7932, lon: -80.2906 },
    'KJFK': { lat: 40.6413, lon: -73.7781 },
    'KORD': { lat: 41.9742, lon: -87.9073 },
    'KSFO': { lat: 37.6213, lon: -122.3790 },
    'KSEA': { lat: 47.4502, lon: -122.3088 },
    'KLAS': { lat: 36.0840, lon: -115.1537 },
    'KPHX': { lat: 33.4352, lon: -112.0101 },
    'KMCO': { lat: 28.4312, lon: -81.3081 },
    'KIAH': { lat: 29.9844, lon: -95.3414 },
    'KSLC': { lat: 40.7899, lon: -111.9791 },
    'KCLT': { lat: 35.2144, lon: -80.9473 },
    'KMSP': { lat: 44.8848, lon: -93.2223 },
    'KDTW': { lat: 42.2162, lon: -83.3554 },
    'KPHL': { lat: 39.8729, lon: -75.2437 },
    'KCVG': { lat: 39.0489, lon: -84.6678 }
  };
  
  return coordinates[icao] || { lat: 39.8283, lon: -98.5795 }; // Default to center of US
};

// Helper function to generate a random flight category
const getRandomFlightCategory = () => {
  const categories = ['VFR', 'MVFR', 'IFR', 'LIFR'];
  return categories[Math.floor(Math.random() * categories.length)];
};

// Mock data helpers
const getMockAirportName = (icao) => {
  const airports = {
    'KJFK': 'John F Kennedy Intl',
    'KLAX': 'Los Angeles Intl',
    'KORD': 'Chicago O\'Hare Intl',
    'KATL': 'Atlanta Hartsfield-Jackson Intl',
    'KDFW': 'Dallas/Fort Worth Intl',
    'KDEN': 'Denver Intl',
    'KSFO': 'San Francisco Intl',
    'KLAS': 'Las Vegas McCarran Intl',
    'KMIA': 'Miami Intl',
    'KBOS': 'Boston Logan Intl',
    'KSEA': 'Seattle-Tacoma Intl'
  };
  
  return airports[icao] || `${icao} Airport`;
};

const getMockTaf = (icao) => {
  const now = new Date();
  const hour = now.getUTCHours().toString().padStart(2, '0');
  const minute = now.getUTCMinutes().toString().padStart(2, '0');
  const day = now.getUTCDate().toString().padStart(2, '0');
  
  // Create valid time range (24 hours from now)
  const validFrom = new Date(now);
  const validTo = new Date(now);
  validTo.setHours(validTo.getHours() + 24);
  
  const fromDay = validFrom.getUTCDate().toString().padStart(2, '0');
  const fromHour = validFrom.getUTCHours().toString().padStart(2, '0');
  const toDay = validTo.getUTCDate().toString().padStart(2, '0');
  const toHour = validTo.getUTCHours().toString().padStart(2, '0');
  
  // Generate forecast periods
  const windDir1 = Math.floor(Math.random() * 36) * 10;
  const windSpeed1 = Math.floor(Math.random() * 20) + 5;
  const windDir2 = ((windDir1 + Math.floor(Math.random() * 10) - 5) + 360) % 360;
  const windSpeed2 = Math.max(5, windSpeed1 + Math.floor(Math.random() * 10) - 5);
  
  const rawText = `${icao} ${day}${hour}${minute}Z ${fromDay}${fromHour}/${toDay}${toHour} ${windDir1.toString().padStart(3, '0')}${windSpeed1.toString().padStart(2, '0')}KT P6SM FEW050 SCT250\n     FM${fromDay}${parseInt(fromHour) + 6}00 ${windDir2.toString().padStart(3, '0')}${windSpeed2.toString().padStart(2, '0')}KT P6SM FEW050`;
  
  return {
    data: [
      {
        icao,
        raw_text: rawText,
        forecast: [
          {
            timestamp: {
              from: validFrom.toISOString(),
              to: validTo.toISOString()
            },
            wind: {
              degrees: windDir1,
              speed_kts: windSpeed1
            },
            visibility: {
              miles: 6,
              meters: 9656
            },
            clouds: [
              {
                code: 'FEW',
                base_feet_agl: 5000
              },
              {
                code: 'SCT',
                base_feet_agl: 25000
              }
            ]
          }
        ],
        station: {
          name: getMockAirportName(icao)
        },
        timestamp: {
          issued: now.toISOString(),
          valid: {
            from: validFrom.toISOString(),
            to: validTo.toISOString()
          }
        }
      }
    ]
  };
};
