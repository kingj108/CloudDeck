// Convert UTC date to local time for a given airport based on its coordinates
export const getLocalTime = (date, lat, lon) => {
  try {
    if (!date) return 'N/A';
    
    // Ensure we have a valid Date object
    const timestamp = new Date(date);
    if (isNaN(timestamp)) return 'Invalid Date';

    // If we don't have coordinates, use the user's local timezone
    if (!lat || !lon) {
      return timestamp.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    // Calculate timezone offset based on longitude
    // Rough approximation: Each 15 degrees of longitude = 1 hour time difference
    // Positive longitude is east of Greenwich (positive offset)
    // Negative longitude is west of Greenwich (negative offset)
    const hourOffset = Math.round(lon / 15);
    
    // Create a new date with the offset applied
    const localDate = new Date(timestamp);
    const utcHours = timestamp.getUTCHours();
    localDate.setHours(utcHours + hourOffset);
    
    // Format the date, but omit timezone information
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

/**
 * Get timezone abbreviation based on coordinates
 * @param {number} lon - Longitude
 * @param {number} lat - Latitude
 * @returns {string} - Timezone abbreviation
 */
function getTimezoneAbbreviation(lon, lat) {
  // Check if location is in Hawaii (HST - Hawaii Standard Time)
  if (lat >= 18.0 && lat <= 23.0 && lon >= -160.0 && lon <= -154.0) {
    return 'HST'; // Hawaii doesn't observe DST
  }
  
  // Check if location is in Alaska (AKST/AKDT - Alaska Time)
  if (lat >= 51.0 && lat <= 72.0 && lon >= -170.0 && lon <= -130.0) {
    return 'AKST/AKDT';
  }
  
  // Check if coordinates are in the Continental US
  if (lat >= 24.5 && lat <= 49.5 && lon >= -125.5 && lon <= -66.5) {
    // US timezone boundaries using more precise longitude ranges
    // Note: These are simplified and don't account for irregular timezone boundaries
    
    // Pacific Time (PT): PST/PDT
    if (lon <= -114.0) return 'PST/PDT';
    
    // Mountain Time (MT): MST/MDT
    // Note: Arizona (approx: lon -109 to -114.5, lat 31.3 to 37) mostly doesn't observe DST
    if (lon <= -102.0) {
      // Special case for Arizona which mostly uses MST year-round (no daylight saving)
      if (lat >= 31.3 && lat <= 37.0 && lon >= -114.5 && lon <= -109.0) {
        return 'MST'; // Arizona uses Mountain Standard Time year-round
      }
      return 'MST/MDT';
    }
    
    // Central Time (CT): CST/CDT
    if (lon <= -85.0) return 'CST/CDT';
    
    // Eastern Time (ET): EST/EDT
    if (lon <= -67.0) return 'EST/EDT';
    
    // Atlantic Time (AT): AST/ADT (mainly for eastern Maine)
    return 'AST/ADT';
  }
  
  // Europe
  if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 40) {
    if (lon < 0) return 'GMT/BST';    // UK/Ireland
    if (lon < 15) return 'CET/CEST';  // Central Europe
    return 'EET/EEST';                // Eastern Europe
  }
  
  // Asia Pacific regions
  if (lon >= 100 && lon <= 150) {
    if (lat >= 20 && lat <= 50) {
      if (lon < 120) return 'CST';      // China
      if (lon < 142) return 'JST';      // Japan
      return 'AEST/AEDT';               // Eastern Australia
    }
  }
  
  // Default to UTC+/- format
  const hourOffset = Math.round(lon / 15);
  if (hourOffset === 0) {
    return 'UTC';
  } else {
    const absOffset = Math.abs(hourOffset);
    return `UTC${hourOffset >= 0 ? '+' : '-'}${absOffset}`;
  }
}

// Get current Zulu (UTC) time
export const getZuluTime = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + 'Z';
}; 