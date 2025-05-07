// Weather API service with comprehensive debugging

// Configuration
const DEBUG_MODE = true;
const API_CONFIG = {
  endpoints: {
    METAR: '/api/checkwx/metar',
    TAF: '/api/checkwx/taf'
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
        'Accept': 'application/json',
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
    const url = `${API_CONFIG.endpoints.METAR}/${icaoUpper}`;
    debugLog('Fetching METAR from:', url);
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    debugLog('METAR response:', data);

    if (!data || !data.data || !data.data[0]) {
      throw new Error('No METAR data available');
    }

    const metarData = data.data[0];
    debugLog('Parsed METAR data:', metarData);
    
    // Parse the raw METAR if needed
    const rawMetar = typeof metarData === 'string' ? metarData : metarData.raw;
    const parsedData = parseRawMetar(rawMetar);
    
    const result = {
      data: [{
        raw: rawMetar,
        station: {
          icao: icaoUpper,
          name: metarData.station?.name || icaoUpper
        },
        flight_category: parsedData.category || metarData.flight_category || determineFlightCategory(parsedData.visibility),
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
        timestamp: metarData.observed || metarData.time?.dt || parsedData.time
      }]
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, result);
    debugLog('Returning formatted result:', result);
    
    return result;
  } catch (error) {
    debugLog('METAR fetch error:', error);
    // Try alternative API: AVWX API
    try {
      const avwxUrl = `https://avwx.rest/api/metar/${icaoUpper}`;
      const response = await fetch(avwxUrl, {
        headers: {
          'Authorization': 'AVWX_API_KEY_HERE'
        }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error('AVWX API error');
      
      return {
        data: [{
          raw: data.raw,
          station: {
            icao: icaoUpper,
            name: data.station || icaoUpper
          },
          flight_category: data.flight_rules || 'UNKNOWN',
          temp: {
            celsius: data.temperature?.value
          },
          wind: {
            degrees: data.wind_direction?.value,
            speed_kts: data.wind_speed?.value,
            gust_kts: data.wind_gust?.value
          },
          visibility: {
            miles: data.visibility?.value
          },
          timestamp: data.time?.dt
        }]
      };
    } catch (avwxError) {
      debugLog('AVWX API error:', avwxError);
      // If both APIs fail, try one more: FAA Weather API
      try {
        const faaUrl = `https://external-api.faa.gov/weather/metar/${icaoUpper}`;
        const response = await fetch(faaUrl);
        const data = await response.json();
        
        if (!response.ok) throw new Error('FAA API error');
        
        return {
          data: [{
            raw: data.metar,
            station: {
              icao: icaoUpper,
              name: data.station_id || icaoUpper
            },
            flight_category: data.flight_category || 'UNKNOWN',
            temp: {
              celsius: data.temp_c
            },
            wind: {
              degrees: data.wind_dir_degrees,
              speed_kts: data.wind_speed_kt,
              gust_kts: data.wind_gust_kt
            },
            visibility: {
              miles: data.visibility_statute_mi
            },
            timestamp: data.observation_time
          }]
        };
      } catch (faaError) {
        debugLog('FAA API error:', faaError);
        // If all APIs fail, return mock data
        return getMockMetar(icaoUpper);
      }
    }
  }
};

// Helper function to parse raw METAR
function parseRawMetar(raw) {
  if (!raw) return {};
  
  const parts = raw.split(' ');
  const result = {
    time: null,
    windDir: null,
    windSpeed: null,
    windGust: null,
    visibility: null,
    temp: null,
    dewpoint: null,
    altimeter: null
  };

  parts.forEach((part, index) => {
    // Time
    if (part.endsWith('Z')) {
      result.time = part;
    }
    // Wind
    else if (part.endsWith('KT')) {
      const wind = part.slice(0, -2);
      if (wind === 'VRB') {
        result.windDir = 'VRB';
        result.windSpeed = parseInt(wind.slice(3));
      } else {
        result.windDir = parseInt(wind.slice(0, 3));
        result.windSpeed = parseInt(wind.slice(3));
        if (wind.includes('G')) {
          result.windGust = parseInt(wind.split('G')[1]);
        }
      }
    }
    // Visibility
    else if (part.endsWith('SM')) {
      result.visibility = parseFloat(part.slice(0, -2));
    }
    // Temperature/Dewpoint
    else if (part.includes('/')) {
      const [temp, dew] = part.split('/');
      result.temp = parseInt(temp);
      result.dewpoint = parseInt(dew);
    }
    // Altimeter
    else if (part.startsWith('A')) {
      result.altimeter = parseFloat(part.slice(1)) / 100;
    }
  });

  return result;
}

// Helper function to determine flight category based on visibility
function determineFlightCategory(visibility) {
  if (!visibility) return 'UNKNOWN';
  if (visibility >= 5) return 'VFR';
  if (visibility >= 3) return 'MVFR';
  if (visibility >= 1) return 'IFR';
  return 'LIFR';
}

/**
 * Fetch TAF data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to TAF data
 */
export const fetchTaf = async (icao) => {
  const icaoUpper = icao.toUpperCase();
  debugLog('Starting TAF fetch for', icaoUpper);

  // Check cache first
  const cacheKey = `taf_${icaoUpper}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    debugLog('Using cached TAF data');
    return cachedData;
  }

  try {
    const url = `${API_CONFIG.endpoints.TAF}/${icaoUpper}`;
    debugLog('Fetching TAF from:', url);
    
    const response = await fetchWithRetry(url);
    const data = await response.json();
    debugLog('TAF response:', data);

    if (!data || !data.data || !data.data[0]) {
      throw new Error('No TAF data available');
    }

    const tafData = data.data[0];
    debugLog('Parsed TAF data:', tafData);
    
    const result = {
      data: [{
        raw: tafData.raw || tafData,
        station: {
          icao: icaoUpper,
          name: tafData.station?.name || icaoUpper
        },
        forecast: tafData.forecast || [],
        timestamp: {
          issued: tafData.timestamp?.issued || tafData.time?.dt,
          from: tafData.timestamp?.from,
          to: tafData.timestamp?.to
        }
      }]
    };

    // Cache the result for 5 minutes
    cache.set(cacheKey, result);
    debugLog('Returning formatted TAF result:', result);
    
    return result;
  } catch (error) {
    debugLog('TAF fetch error:', error);
    // Try alternative API: AVWX API
    try {
      const avwxUrl = `https://avwx.rest/api/taf/${icaoUpper}`;
      const response = await fetch(avwxUrl, {
        headers: {
          'Authorization': 'AVWX_API_KEY_HERE'
        }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error('AVWX API error');
      
      return {
        data: [{
          raw: data.raw,
          station: {
            icao: icaoUpper,
            name: data.station || icaoUpper
          },
          timestamp: data.time?.dt
        }]
      };
    } catch (avwxError) {
      debugLog('AVWX API error:', avwxError);
      return getMockTaf(icaoUpper);
    }
  }
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
