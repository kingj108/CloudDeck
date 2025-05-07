// Weather API service with comprehensive debugging

// Configuration
const DEBUG_MODE = true;
const API_CONFIG = {
  endpoints: {
    METAR: 'https://api.weather.gov/stations',
    TAF: 'https://api.weather.gov/stations'
  },
  retries: 3,
  retryDelay: 1000,
  timeout: 10000
};

// Debug logging helper
const debugLog = (...args) => DEBUG_MODE && console.log('[WEATHER API DEBUG]', ...args);

// Simple in-memory cache
const cache = {
  data: {},
  set(key, value, ttl = 5 * 60 * 1000) {
    this.data[key] = {
      value,
      expiry: Date.now() + ttl
    };
  },
  get(key) {
    const item = this.data[key];
    if (!item) return null;
    if (Date.now() > item.expiry) {
      delete this.data[key];
      return null;
    }
    return item.value;
  },
  clear() {
    this.data = {};
    console.log('Cache cleared');
  }
};

const fetchWithRetry = async (url, options = {}, retries = API_CONFIG.retries) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/geo+json',
        'User-Agent': '(CloudDeck Weather App, contact@clouddeck.app)',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

/**
 * Fetch METAR data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to METAR data
 */
export const fetchMetar = async (icao) => {
  const icaoUpper = icao.toUpperCase();
  debugLog('Starting METAR fetch for', icaoUpper);

  // Check cache first
  const cacheKey = `metar_${icaoUpper}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    debugLog('Using cached METAR data');
    return cachedData;
  }

  try {
    // First, get the station information
    const stationUrl = `${API_CONFIG.endpoints.METAR}/${icaoUpper}`;
    debugLog('Fetching station info from:', stationUrl);
    
    const stationResponse = await fetchWithRetry(stationUrl);
    const stationData = await stationResponse.json();
    debugLog('Station data:', stationData);

    // Then, get the latest observations
    const observationsUrl = `${stationUrl}/observations/latest`;
    debugLog('Fetching observations from:', observationsUrl);
    
    const obsResponse = await fetchWithRetry(observationsUrl);
    const obsData = await obsResponse.json();
    debugLog('Observation data:', obsData);

    const result = {
      data: [{
        raw: obsData.raw || 'No raw METAR available',
        station: {
          icao: icaoUpper,
          name: stationData.properties.name
        },
        flight_category: obsData.properties?.flightCategory || 'UNKNOWN',
        temp: {
          celsius: obsData.properties?.temperature?.value
        },
        wind: {
          degrees: obsData.properties?.windDirection?.value,
          speed_kts: Math.round(obsData.properties?.windSpeed?.value * 1.944), // Convert m/s to knots
          gust_kts: obsData.properties?.windGust?.value ? Math.round(obsData.properties.windGust.value * 1.944) : null
        },
        visibility: {
          miles: obsData.properties?.visibility?.value * 0.000621371 // Convert meters to miles
        },
        timestamp: obsData.properties?.timestamp
      }]
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    debugLog('METAR fetch error:', error);
    // If the API fails, return mock data
    return getMockMetar(icaoUpper);
  }
};

/**
 * Fetch TAF data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to TAF data
 */
export const fetchTaf = async (icao) => {
  const icaoUpper = icao.toUpperCase();
  debugLog('Starting TAF fetch for', icaoUpper);

  // For now, return mock TAF data since NOAA API doesn't provide TAF
  return getMockTaf(icaoUpper);
};

// Export mock data functions for testing
export const getMockMetar = (icao) => ({
  data: [{
    raw: `METAR ${icao} 010000Z 18010KT 10SM FEW050 21/16 A3001 RMK AO2`,
    station: { 
      icao, 
      name: `${icao} Airport` 
    },
    flight_category: 'VFR',
    temp: {
      celsius: 21
    },
    wind: {
      degrees: 180,
      speed_kts: 10
    },
    visibility: {
      miles: 10
    },
    timestamp: new Date().toISOString()
  }]
});

export const getMockTaf = (icao) => ({
  data: [{
    raw: `TAF ${icao} 010000Z 0100/0200 18010KT P6SM FEW050`,
    station: { 
      icao, 
      name: `${icao} Airport` 
    },
    timestamp: new Date().toISOString()
  }]
});

export const fetchMapData = async () => {
  // For now, return mock data for the map
  return {
    data: [
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
    ]
  };
};
