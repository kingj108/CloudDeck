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
      hour12: true,
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Time format error';
  }
};

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