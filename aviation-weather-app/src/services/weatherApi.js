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
        clouds: parsedData.clouds || metarData.clouds || [],
        timestamp: metarData.observed || metarData.time?.dt || parsedData.time || new Date().toISOString()
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
    altimeter: null,
    clouds: []
  };

  const cloudTypes = ['CLR', 'SKC', 'FEW', 'SCT', 'BKN', 'OVC'];

  parts.forEach((part, index) => {
    // Time (format: ddhhmmZ, e.g., 071853Z)
    if (part.endsWith('Z')) {
      const day = parseInt(part.slice(0, 2));
      const hour = parseInt(part.slice(2, 4));
      const minute = parseInt(part.slice(4, 6));
      
      // Create date object for the current month and year
      const now = new Date();
      const date = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        day,
        hour,
        minute,
        0  // seconds
      ));
      
      // Handle month rollover (if the day is greater than today, it's from last month)
      if (day > now.getDate()) {
        date.setUTCMonth(date.getUTCMonth() - 1);
      }
      
      result.time = date.toISOString();
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
    // Cloud layers
    else if (cloudTypes.some(type => part.startsWith(type))) {
      if (part === 'CLR' || part === 'SKC') {
        result.clouds = [];  // Clear skies
      } else {
        const coverage = part.slice(0, 3);
        const height = parseInt(part.slice(3)) * 100;
        result.clouds.push({
          coverage,
          base_feet_agl: height
        });
      }
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

// List of major US airports for the weather map (top 3 per state)
const MAJOR_AIRPORTS = [
  // Alabama (AL)
  { icao: 'KBHM', lat: 33.5629, lon: -86.7535, name: 'Birmingham International' },
  { icao: 'KMGM', lat: 32.3006, lon: -86.3939, name: 'Montgomery Regional' },
  { icao: 'KHSV', lat: 34.6372, lon: -86.7751, name: 'Huntsville International' },
  
  // Alaska (AK)
  { icao: 'PANC', lat: 61.1741, lon: -149.9961, name: 'Anchorage International' },
  { icao: 'PAFA', lat: 64.8151, lon: -147.8560, name: 'Fairbanks International' },
  { icao: 'PAJN', lat: 58.3547, lon: -134.5762, name: 'Juneau International' },
  
  // Arizona (AZ)
  { icao: 'KPHX', lat: 33.4342, lon: -112.0116, name: 'Phoenix Sky Harbor' },
  { icao: 'KTUS', lat: 32.1161, lon: -110.9411, name: 'Tucson International' },
  { icao: 'KGYR', lat: 33.4234, lon: -112.3761, name: 'Phoenix Goodyear' },
  
  // Arkansas (AR)
  { icao: 'KLIT', lat: 34.7294, lon: -92.2243, name: 'Little Rock National' },
  { icao: 'KXNA', lat: 36.2819, lon: -94.3068, name: 'Northwest Arkansas National' },
  { icao: 'KFSM', lat: 35.3366, lon: -94.3674, name: 'Fort Smith Regional' },
  
  // California (CA)
  { icao: 'KLAX', lat: 33.9416, lon: -118.4085, name: 'Los Angeles International' },
  { icao: 'KSFO', lat: 37.6213, lon: -122.3790, name: 'San Francisco International' },
  { icao: 'KSAN', lat: 32.7336, lon: -117.1897, name: 'San Diego International' },
  
  // Colorado (CO)
  { icao: 'KDEN', lat: 39.8561, lon: -104.6737, name: 'Denver International' },
  { icao: 'KCOS', lat: 38.8058, lon: -104.7007, name: 'Colorado Springs' },
  { icao: 'KGJT', lat: 39.1224, lon: -108.5267, name: 'Grand Junction Regional' },
  
  // Connecticut (CT)
  { icao: 'KBDL', lat: 41.9389, lon: -72.6832, name: 'Bradley International' },
  { icao: 'KHVN', lat: 41.2637, lon: -72.8868, name: 'Tweed New Haven' },
  { icao: 'KGON', lat: 41.3301, lon: -72.0451, name: 'Groton-New London' },
  
  // Delaware (DE)
  { icao: 'KILG', lat: 39.6787, lon: -75.6065, name: 'Wilmington Airport' },
  { icao: 'KDOV', lat: 39.1294, lon: -75.4666, name: 'Dover Air Force Base' },
  { icao: 'KGED', lat: 38.6893, lon: -75.3589, name: 'Delaware Coastal Airport' },
  
  // Florida (FL)
  { icao: 'KMIA', lat: 25.7959, lon: -80.2871, name: 'Miami International' },
  { icao: 'KMCO', lat: 28.4294, lon: -81.3089, name: 'Orlando International' },
  { icao: 'KTPA', lat: 27.9755, lon: -82.5332, name: 'Tampa International' },
  
  // Georgia (GA)
  { icao: 'KATL', lat: 33.6407, lon: -84.4277, name: 'Atlanta Hartsfield-Jackson' },
  { icao: 'KSAV', lat: 32.1276, lon: -81.2020, name: 'Savannah/Hilton Head' },
  { icao: 'KABY', lat: 31.5355, lon: -84.1945, name: 'Southwest Georgia Regional' },

  // Hawaii (HI)
  { icao: 'PHNL', lat: 21.3245, lon: -157.9251, name: 'Daniel K. Inouye International' },
  { icao: 'PHOG', lat: 20.8986, lon: -156.4305, name: 'Kahului Airport' },
  { icao: 'PHKO', lat: 19.7388, lon: -156.0456, name: 'Ellison Onizuka Kona International' },
  
  // Idaho (ID)
  { icao: 'KBOI', lat: 43.5644, lon: -116.2228, name: 'Boise Airport' },
  { icao: 'KIDA', lat: 43.5146, lon: -112.0708, name: 'Idaho Falls Regional' },
  { icao: 'KTWF', lat: 42.4818, lon: -114.4877, name: 'Magic Valley Regional' },
  
  // Illinois (IL)
  { icao: 'KORD', lat: 41.9742, lon: -87.9073, name: 'Chicago O\'Hare International' },
  { icao: 'KMDW', lat: 41.7868, lon: -87.7522, name: 'Chicago Midway' },
  { icao: 'KPIA', lat: 40.6642, lon: -89.6933, name: 'Peoria International' },
  
  // Indiana (IN)
  { icao: 'KIND', lat: 39.7173, lon: -86.2944, name: 'Indianapolis International' },
  { icao: 'KFWA', lat: 40.9785, lon: -85.1952, name: 'Fort Wayne International' },
  { icao: 'KSBN', lat: 41.7087, lon: -86.3173, name: 'South Bend International' },
  
  // Iowa (IA)
  { icao: 'KDSM', lat: 41.5340, lon: -93.6631, name: 'Des Moines International' },
  { icao: 'KCID', lat: 41.8847, lon: -91.7108, name: 'The Eastern Iowa Airport' },
  { icao: 'KALO', lat: 42.5571, lon: -92.4003, name: 'Waterloo Regional' },
  
  // Kansas (KS)
  { icao: 'KICT', lat: 37.6499, lon: -97.4331, name: 'Wichita Dwight D. Eisenhower National' },
  { icao: 'KMHK', lat: 39.1409, lon: -96.6708, name: 'Manhattan Regional' },
  { icao: 'KFOE', lat: 38.9509, lon: -95.6636, name: 'Topeka Regional' },
  
  // Kentucky (KY)
  { icao: 'KSDF', lat: 38.1741, lon: -85.7365, name: 'Louisville Muhammad Ali International' },
  { icao: 'KLEX', lat: 38.0365, lon: -84.6058, name: 'Blue Grass Airport' },
  { icao: 'KCVG', lat: 39.0489, lon: -84.6678, name: 'Cincinnati/Northern Kentucky International' },
  
  // Louisiana (LA)
  { icao: 'KMSY', lat: 29.9934, lon: -90.2580, name: 'Louis Armstrong New Orleans International' },
  { icao: 'KBTR', lat: 30.5331, lon: -91.1495, name: 'Baton Rouge Metropolitan' },
  { icao: 'KSHV', lat: 32.4466, lon: -93.8256, name: 'Shreveport Regional' },
  
  // Maine (ME)
  { icao: 'KPWM', lat: 43.6462, lon: -70.3087, name: 'Portland International Jetport' },
  { icao: 'KBGR', lat: 44.8074, lon: -68.8281, name: 'Bangor International' },
  { icao: 'KPQI', lat: 46.6889, lon: -68.0448, name: 'Presque Isle International' },
  
  // Maryland (MD)
  { icao: 'KBWI', lat: 39.1754, lon: -76.6682, name: 'Baltimore/Washington International' },
  { icao: 'KDCA', lat: 38.8521, lon: -77.0377, name: 'Ronald Reagan Washington National' },
  { icao: 'KSBY', lat: 38.3405, lon: -75.5103, name: 'Salisbury Regional' },
  
  // Massachusetts (MA)
  { icao: 'KBOS', lat: 42.3656, lon: -71.0096, name: 'Boston Logan International' },
  { icao: 'KBED', lat: 42.4700, lon: -71.2890, name: 'Laurence G. Hanscom Field' },
  { icao: 'KORH', lat: 42.2673, lon: -71.8757, name: 'Worcester Regional' },
  
  // Michigan (MI)
  { icao: 'KDTW', lat: 42.2124, lon: -83.3534, name: 'Detroit Metropolitan Wayne County' },
  { icao: 'KGRR', lat: 42.8808, lon: -85.5228, name: 'Gerald R. Ford International' },
  { icao: 'KFNT', lat: 42.9655, lon: -83.7435, name: 'Bishop International' },
  
  // Minnesota (MN)
  { icao: 'KMSP', lat: 44.8820, lon: -93.2218, name: 'Minneapolis−Saint Paul International' },
  { icao: 'KRST', lat: 43.9085, lon: -92.5000, name: 'Rochester International' },
  { icao: 'KDLH', lat: 46.8420, lon: -92.1936, name: 'Duluth International' },
  
  // Mississippi (MS)
  { icao: 'KJAN', lat: 32.3113, lon: -90.0759, name: 'Jackson-Medgar Wiley Evers International' },
  { icao: 'KGPT', lat: 30.4073, lon: -89.0701, name: 'Gulfport-Biloxi International' },
  { icao: 'KTUP', lat: 34.2681, lon: -88.7699, name: 'Tupelo Regional' },
  
  // Missouri (MO)
  { icao: 'KMCI', lat: 39.2976, lon: -94.7139, name: 'Kansas City International' },
  { icao: 'KSTL', lat: 38.7487, lon: -90.3700, name: 'St. Louis Lambert International' },
  { icao: 'KSGF', lat: 37.2457, lon: -93.3886, name: 'Springfield-Branson National' },
  
  // Montana (MT)
  { icao: 'KBZN', lat: 45.7772, lon: -111.1602, name: 'Bozeman Yellowstone International' },
  { icao: 'KBIL', lat: 45.8077, lon: -108.5428, name: 'Billings Logan International' },
  { icao: 'KGPI', lat: 48.3105, lon: -114.2559, name: 'Glacier Park International' },
  
  // Nebraska (NE)
  { icao: 'KOMA', lat: 41.3032, lon: -95.8940, name: 'Eppley Airfield' },
  { icao: 'KLNK', lat: 40.8510, lon: -96.7592, name: 'Lincoln Airport' },
  { icao: 'KGRI', lat: 40.9675, lon: -98.3096, name: 'Central Nebraska Regional' },
  
  // Nevada (NV)
  { icao: 'KLAS', lat: 36.0840, lon: -115.1537, name: 'Harry Reid International' },
  { icao: 'KRNO', lat: 39.4991, lon: -119.7682, name: 'Reno-Tahoe International' },
  { icao: 'KELN', lat: 39.2999, lon: -114.8416, name: 'Elko Regional' },
  
  // New Hampshire (NH)
  { icao: 'KMHT', lat: 42.9326, lon: -71.4357, name: 'Manchester-Boston Regional' },
  { icao: 'KPSM', lat: 43.0779, lon: -70.8233, name: 'Portsmouth International' },
  { icao: 'KLEB', lat: 43.6261, lon: -72.3042, name: 'Lebanon Municipal' },
  
  // New Jersey (NJ)
  { icao: 'KEWR', lat: 40.6925, lon: -74.1687, name: 'Newark Liberty International' },
  { icao: 'KACY', lat: 39.4577, lon: -74.5772, name: 'Atlantic City International' },
  { icao: 'KTTN', lat: 40.2767, lon: -74.8135, name: 'Trenton Mercer' },
  
  // New Mexico (NM)
  { icao: 'KABQ', lat: 35.0402, lon: -106.6091, name: 'Albuquerque International Sunport' },
  { icao: 'KSAW', lat: 35.3333, lon: -106.6000, name: 'Santa Fe Municipal' },
  { icao: 'KROW', lat: 33.3016, lon: -104.5307, name: 'Roswell Air Center' },
  
  // New York (NY)
  { icao: 'KJFK', lat: 40.6413, lon: -73.7781, name: 'John F. Kennedy International' },
  { icao: 'KLGA', lat: 40.7769, lon: -73.8740, name: 'LaGuardia' },
  { icao: 'KBUF', lat: 42.9405, lon: -78.7322, name: 'Buffalo Niagara International' },
  
  // North Carolina (NC)
  { icao: 'KCLT', lat: 35.2140, lon: -80.9431, name: 'Charlotte Douglas International' },
  { icao: 'KRDU', lat: 35.8776, lon: -78.7875, name: 'Raleigh-Durham International' },
  { icao: 'KGSO', lat: 36.0978, lon: -79.9372, name: 'Piedmont Triad International' },
  
  // North Dakota (ND)
  { icao: 'KFAR', lat: 46.9207, lon: -96.8158, name: 'Hector International' },
  { icao: 'KBIS', lat: 46.7724, lon: -100.7467, name: 'Bismarck Airport' },
  { icao: 'KGFK', lat: 47.9493, lon: -97.1761, name: 'Grand Forks International' },
  
  // Ohio (OH)
  { icao: 'KCLE', lat: 41.4117, lon: -81.8497, name: 'Cleveland Hopkins International' },
  { icao: 'KCMH', lat: 39.9980, lon: -82.8918, name: 'John Glenn Columbus International' },
  { icao: 'KDAY', lat: 39.9024, lon: -84.2194, name: 'James M. Cox Dayton International' },
  
  // Oklahoma (OK)
  { icao: 'KOKC', lat: 35.3931, lon: -97.6007, name: 'Will Rogers World' },
  { icao: 'KTUL', lat: 36.1984, lon: -95.8881, name: 'Tulsa International' },
  { icao: 'KLAWT', lat: 34.5677, lon: -98.4166, name: 'Lawton-Fort Sill Regional' },
  
  // Oregon (OR)
  { icao: 'KPDX', lat: 45.5898, lon: -122.5951, name: 'Portland International' },
  { icao: 'KEUG', lat: 44.1246, lon: -123.2190, name: 'Eugene Airport' },
  { icao: 'KMFR', lat: 42.3742, lon: -122.8735, name: 'Rogue Valley International-Medford' },
  
  // Pennsylvania (PA)
  { icao: 'KPHL', lat: 39.8721, lon: -75.2411, name: 'Philadelphia International' },
  { icao: 'KPIT', lat: 40.4915, lon: -80.2329, name: 'Pittsburgh International' },
  { icao: 'KMDT', lat: 40.1935, lon: -76.7634, name: 'Harrisburg International' },
  
  // Rhode Island (RI)
  { icao: 'KPVD', lat: 41.7240, lon: -71.4283, name: 'T. F. Green International' },
  { icao: 'KWST', lat: 41.3496, lon: -71.8033, name: 'Westerly State' },
  { icao: 'KBID', lat: 41.1681, lon: -71.5778, name: 'Block Island State' },
  
  // South Carolina (SC)
  { icao: 'KCHS', lat: 32.8986, lon: -80.0405, name: 'Charleston International' },
  { icao: 'KCAE', lat: 33.9389, lon: -81.1195, name: 'Columbia Metropolitan' },
  { icao: 'KGSP', lat: 34.8957, lon: -82.2189, name: 'Greenville-Spartanburg International' },
  
  // South Dakota (SD)
  { icao: 'KFSD', lat: 43.5820, lon: -96.7417, name: 'Sioux Falls Regional' },
  { icao: 'KRAP', lat: 44.0453, lon: -103.0574, name: 'Rapid City Regional' },
  { icao: 'KABR', lat: 45.4491, lon: -98.4218, name: 'Aberdeen Regional' },
  
  // Tennessee (TN)
  { icao: 'KMEM', lat: 35.0424, lon: -89.9767, name: 'Memphis International' },
  { icao: 'KBNA', lat: 36.1245, lon: -86.6782, name: 'Nashville International' },
  { icao: 'KTYS', lat: 35.8124, lon: -83.9935, name: 'McGhee Tyson' },
  
  // Texas (TX)
  { icao: 'KDFW', lat: 32.8998, lon: -97.0403, name: 'Dallas/Fort Worth International' },
  { icao: 'KIAH', lat: 29.9902, lon: -95.3368, name: 'George Bush Intercontinental' },
  { icao: 'KAUS', lat: 30.1945, lon: -97.6699, name: 'Austin-Bergstrom International' },
  
  // Utah (UT)
  { icao: 'KSLC', lat: 40.7884, lon: -111.9777, name: 'Salt Lake City International' },
  { icao: 'KPVU', lat: 40.2194, lon: -111.7235, name: 'Provo Municipal' },
  { icao: 'KOGD', lat: 41.1959, lon: -112.0122, name: 'Ogden-Hinckley' },
  
  // Vermont (VT)
  { icao: 'KBTV', lat: 44.4720, lon: -73.1533, name: 'Burlington International' },
  { icao: 'KRUT', lat: 43.5294, lon: -72.9496, name: 'Rutland Southern Vermont Regional' },
  { icao: 'KMPV', lat: 44.2035, lon: -72.5623, name: 'Edward F. Knapp State' },
  
  // Virginia (VA)
  { icao: 'KIAD', lat: 38.9445, lon: -77.4558, name: 'Washington Dulles International' },
  { icao: 'KRIC', lat: 37.5052, lon: -77.3197, name: 'Richmond International' },
  { icao: 'KORF', lat: 36.8946, lon: -76.2012, name: 'Norfolk International' },
  
  // Washington (WA)
  { icao: 'KSEA', lat: 47.4502, lon: -122.3088, name: 'Seattle-Tacoma International' },
  { icao: 'KGEG', lat: 47.6199, lon: -117.5339, name: 'Spokane International' },
  { icao: 'KBLI', lat: 48.7927, lon: -122.5375, name: 'Bellingham International' },
  
  // West Virginia (WV)
  { icao: 'KCRW', lat: 38.3731, lon: -81.5932, name: 'Yeager Airport' },
  { icao: 'KCKB', lat: 39.2966, lon: -80.2285, name: 'North Central West Virginia' },
  { icao: 'KHTS', lat: 38.3667, lon: -82.5580, name: 'Tri-State/Milton J. Ferguson Field' },
  
  // Wisconsin (WI)
  { icao: 'KMKE', lat: 42.9472, lon: -87.8966, name: 'Milwaukee Mitchell International' },
  { icao: 'KMSN', lat: 43.1399, lon: -89.3375, name: 'Dane County Regional' },
  { icao: 'KGRB', lat: 44.4851, lon: -88.1296, name: 'Green Bay Austin Straubel International' },
  
  // Wyoming (WY)
  { icao: 'KCPR', lat: 42.9080, lon: -106.4645, name: 'Casper/Natrona County International' },
  { icao: 'KJAR', lat: 43.6071, lon: -110.7377, name: 'Jackson Hole' },
  { icao: 'KCYS', lat: 41.1557, lon: -104.8120, name: 'Cheyenne Regional' }
];

export const fetchMapData = async () => {
  debugLog('Fetching map data for multiple airports');
  
  try {
    // Fetch weather data for all airports in parallel using fetchMetar
    const promises = MAJOR_AIRPORTS.map(async (airport) => {
      try {
        // Use the main fetchMetar function instead of direct API call
        const metarData = await fetchMetar(airport.icao);
        
        if (!metarData || !metarData.data || !metarData.data[0]) {
          throw new Error('No METAR data available');
        }
        
        // Combine airport location with weather data
        return {
          ...airport,
          ...metarData.data[0]
        };
      } catch (err) {
        debugLog(`Error fetching data for ${airport.icao}:`, err);
        // Return airport with unknown status if fetch fails
        return {
          ...airport,
          flight_category: 'UNKNOWN'
        };
      }
    });

    const results = await Promise.all(promises);
    debugLog('Map data fetched successfully:', results);
    
    return {
      data: results
    };
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
