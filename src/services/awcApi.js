const API_BASE_URL = '/api';

const fetchOptions = {
  headers: {
    'Accept': 'application/json'
  },
  mode: 'cors'
};

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export async function fetchMetar(stationId) {
  if (!stationId) {
    throw new Error('Station ID is required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/metar/${stationId}`, fetchOptions);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch METAR');
    }
    
    const data = await response.json();
    console.log('METAR data received:', data);
    
    if (!data || !data.data || !data.data[0]) {
      throw new Error('No METAR data available');
    }

    return data;
  } catch (error) {
    console.error('Error fetching METAR:', error);
    throw error;
  }
}

export async function fetchTaf(stationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/taf/${stationId}`, fetchOptions);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch TAF');
    }
    
    const data = await response.json();
    console.log('TAF data received:', data);
    
    if (!data || !data.data || !data.data[0]) {
      throw new Error('No TAF data available');
    }

    return data;
  } catch (error) {
    console.error('Error fetching TAF:', error);
    throw error;
  }
}

// Add retry functionality for transient failures
export async function fetchMetarWithRetry(stationId, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchMetar(stationId);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
} 