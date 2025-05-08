/**
 * Time zone definitions for US airports
 */
export const AIRPORT_TIMEZONES = {
  // Special cases for major airports first (must come before general patterns)
  'MAJOR': {
    regex: /^K(ORD|MDW|MKE|MSP|STL|MCI|DFW|IAH|MSY)$/,  // Major Central airports
    offset: -5,
    name: 'America/Chicago'
  },
  'MAJOR_WEST': {
    regex: /^K(LAX|SFO|SEA|PDX|LAS|PHX|SAN|OAK|SJC)$/,  // Major Pacific airports
    offset: -7,
    name: 'America/Los_Angeles'
  },
  'MAJOR_MOUNTAIN': {
    regex: /^K(DEN|SLC|ABQ|PHX|TUS|BOI)$/,  // Major Mountain airports
    offset: -6,
    name: 'America/Denver'
  },
  'MAJOR_EAST': {
    regex: /^K(JFK|LGA|EWR|BOS|PHL|DCA|IAD|BWI|ATL|MIA|MCO|CLT)$/,  // Major Eastern airports
    offset: -4,
    name: 'America/New_York'
  },

  // General patterns for regions
  'CENTRAL': {
    regex: /^K(?:(?:[CMT][AEILNORSX])|(?:IC|GR|SP|LN|BV|ST|CG|OF|PW|VK))[A-Z]$/,
    offset: -5,
    name: 'America/Chicago'
  },
  'PACIFIC': {
    regex: /^K(?:(?:[ACLNPSTW][ACEIMNPRSTW])|(?:VG|TH|RD|BL|MY|EA))[A-Z]$/,
    offset: -7,
    name: 'America/Los_Angeles'
  },
  'MOUNTAIN': {
    regex: /^K(?:(?:[ABCDEFGRT][DEFHLMNPRSTWY])|(?:AL|SD|GJ|CY))[A-Z]$/,
    offset: -6,
    name: 'America/Denver'
  },
  'EASTERN': {
    regex: /^K(?:(?:[ABCDEFGHIJKLMNOPQRSTUVWXYZ][ABCDEFGHIJKLMNOPQRSTUVWXYZ])|(?:RI|NC|SC|FL|GA|VA|MD|DE|NJ|NY|CT|RI|MA|VT|NH|ME))[A-Z]$/,
    offset: -4,
    name: 'America/New_York'
  },
  // Alaska
  'ALASKA': {
    regex: /^PA[A-Z][A-Z]$/,
    offset: -8,
    name: 'America/Anchorage'
  },
  // Hawaii
  'HAWAII': {
    regex: /^PH[A-Z][A-Z]$/,
    offset: -10,
    name: 'Pacific/Honolulu'
  }
};

/**
 * Get timezone information for an airport
 * @param {string} icao - Airport ICAO code
 * @returns {Object} Timezone information including offset and name
 */
export const getAirportTimezone = (icao) => {
  if (!icao) return null;
  
  // Find matching timezone
  for (const [region, tzInfo] of Object.entries(AIRPORT_TIMEZONES)) {
    if (tzInfo.regex.test(icao)) {
      return {
        offset: tzInfo.offset,
        name: tzInfo.name
      };
    }
  }
  
  // Default to UTC if no match found
  return {
    offset: 0,
    name: 'UTC'
  };
};

/**
 * Format a date in the airport's local timezone
 * @param {Date|string} date - Date to format
 * @param {string} icao - Airport ICAO code
 * @returns {string} Formatted date string
 */
export const formatAirportLocalTime = (date, icao) => {
  if (!date) return 'N/A';
  
  const tzInfo = getAirportTimezone(icao);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return dateObj.toLocaleString('en-US', {
      timeZone: tzInfo.name,
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateObj.toLocaleString();
  }
};

// Convert UTC date to local time for a given airport based on its coordinates
export const getLocalTime = (date, lat, lon) => {
  try {
    if (!date) return 'N/A';
    
    // Ensure we have a valid Date object
    const timestamp = new Date(date);
    if (isNaN(timestamp)) return 'Invalid Date';

    // Get the UTC time components
    const utcHours = timestamp.getUTCHours();
    const utcMinutes = timestamp.getUTCMinutes();
    const utcSeconds = timestamp.getUTCSeconds();
    
    // Calculate local time (EDT is UTC-4)
    const localDate = new Date(timestamp);
    localDate.setHours(utcHours - 4); // Adjust for EDT (UTC-4)
    
    // Format the date in local time
    return localDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Time format error';
  }
}; 