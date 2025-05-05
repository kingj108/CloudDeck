// Weather API service
// Using CheckWX API which provides reliable aviation weather data
// In a production app, you would need to sign up for an API key at https://www.checkwx.com/

const API_KEY = 'demo_key'; // Replace with your actual API key in production

// Base URLs for different API endpoints
const BASE_URL = 'https://api.checkwx.com';

/**
 * Fetch METAR data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to METAR data
 */
export const fetchMetar = async (icao) => {
  try {
    // In a real app with a valid API key:
    // const response = await fetch(`${BASE_URL}/metar/${icao}/decoded`, {
    //   headers: {
    //     'X-API-Key': API_KEY
    //   }
    // });
    // return await response.json();
    
    // For demo purposes, we'll return mock data
    return getMockMetar(icao);
  } catch (error) {
    console.error('Error fetching METAR:', error);
    throw new Error('Failed to fetch METAR data');
  }
};

/**
 * Fetch TAF data for a specific airport
 * @param {string} icao - Airport ICAO code (e.g., KJFK)
 * @returns {Promise} - Promise resolving to TAF data
 */
export const fetchTaf = async (icao) => {
  try {
    // In a real app with a valid API key:
    // const response = await fetch(`${BASE_URL}/taf/${icao}/decoded`, {
    //   headers: {
    //     'X-API-Key': API_KEY
    //   }
    // });
    // return await response.json();
    
    // For demo purposes, we'll return mock data
    return getMockTaf(icao);
  } catch (error) {
    console.error('Error fetching TAF:', error);
    throw new Error('Failed to fetch TAF data');
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
  try {
    // In a real app with a valid API key:
    // const response = await fetch(`${BASE_URL}/metar/map?bbox=-125,25,-65,50`, {
    //   headers: {
    //     'X-API-Key': API_KEY
    //   }
    // });
    // return await response.json();
    
    // For demo purposes, we'll return mock data
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
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw new Error('Failed to fetch map data');
  }
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

const getMockMetar = (icao) => {
  const now = new Date();
  const hour = now.getUTCHours().toString().padStart(2, '0');
  const minute = now.getUTCMinutes().toString().padStart(2, '0');
  const day = now.getUTCDate().toString().padStart(2, '0');
  
  // Generate random weather conditions
  const windDir = Math.floor(Math.random() * 36) * 10;
  const windSpeed = Math.floor(Math.random() * 25) + 5;
  const gustChance = Math.random();
  const gustSpeed = windSpeed + Math.floor(Math.random() * 15) + 5;
  const windGust = gustChance > 0.7 ? `G${gustSpeed}` : '';
  const visibility = Math.floor(Math.random() * 7) + 3;
  const temp = Math.floor(Math.random() * 30) - 5;
  const dewpoint = temp - Math.floor(Math.random() * 10);
  const altimeter = (29.92 + (Math.random() * 0.5 - 0.25)).toFixed(2);
  
  // Determine flight category based on visibility and ceiling
  let flightCategory = 'VFR';
  if (visibility < 5) flightCategory = 'MVFR';
  if (visibility < 3) flightCategory = 'IFR';
  if (visibility < 1) flightCategory = 'LIFR';
  
  const rawText = `${icao} ${day}${hour}${minute}Z ${windDir.toString().padStart(3, '0')}${windSpeed.toString().padStart(2, '0')}${windGust}KT ${visibility}SM FEW050 ${temp.toString().padStart(2, '0')}/${dewpoint.toString().padStart(2, '0')} A${altimeter.replace('.', '')}`;
  
  return {
    data: [
      {
        icao,
        raw_text: rawText,
        barometer: {
          hg: parseFloat(altimeter),
          hpa: parseFloat(altimeter) * 33.8639
        },
        clouds: [
          {
            code: 'FEW',
            base_feet_agl: 5000,
            text: 'Few clouds at 5,000 feet'
          }
        ],
        flight_category: flightCategory,
        humidity_percent: 65,
        temperature: {
          celsius: temp,
          fahrenheit: (temp * 9/5) + 32
        },
        dewpoint: {
          celsius: dewpoint,
          fahrenheit: (dewpoint * 9/5) + 32
        },
        visibility: {
          miles: visibility,
          meters: visibility * 1609.34
        },
        wind: {
          degrees: windDir,
          speed_kts: windSpeed,
          speed_mph: Math.round(windSpeed * 1.15078),
          gust_kts: gustChance > 0.7 ? gustSpeed : null
        },
        station: {
          name: getMockAirportName(icao)
        },
        observed: now.toISOString()
      }
    ]
  };
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
