// Convert UTC date to local time for a given airport based on its coordinates
export const getLocalTime = (date, lat, lon) => {
  try {
    // Get timezone for the coordinates using Intl.DateTimeFormat
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return new Date(date).toLocaleString('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    // Fallback to UTC if timezone lookup fails
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
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