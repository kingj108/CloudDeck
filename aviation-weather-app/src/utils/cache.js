/**
 * Simple in-memory cache utility for API responses
 * This helps reduce API calls and implement basic rate limiting
 */

// Cache storage with TTL (time to live)
const cache = new Map();

// Default cache TTL in milliseconds (5 minutes)
const DEFAULT_TTL = 5 * 60 * 1000;

// Rate limiting tracking
const apiCallTimestamps = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_CALLS_PER_WINDOW = 10; // Maximum 10 calls per minute

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found/expired
 */
export const getCachedValue = (key) => {
  if (!cache.has(key)) return null;
  
  const { value, expiry } = cache.get(key);
  const now = Date.now();
  
  if (now > expiry) {
    // Cache entry has expired
    cache.delete(key);
    return null;
  }
  
  return value;
};

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 */
export const setCachedValue = (key, value, ttl = DEFAULT_TTL) => {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
};

/**
 * Check if we can make an API call based on rate limiting
 * @param {string} endpoint - API endpoint identifier
 * @returns {boolean} - True if API call is allowed, false if rate limited
 */
export const canMakeApiCall = (endpoint) => {
  const now = Date.now();
  
  if (!apiCallTimestamps.has(endpoint)) {
    apiCallTimestamps.set(endpoint, [now]);
    return true;
  }
  
  // Get timestamps for this endpoint
  const timestamps = apiCallTimestamps.get(endpoint);
  
  // Filter out timestamps outside the current window
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  // Update timestamps
  apiCallTimestamps.set(endpoint, [...recentTimestamps, now]);
  
  // Check if we're under the rate limit
  return recentTimestamps.length < MAX_CALLS_PER_WINDOW;
};

/**
 * Clear expired cache entries
 */
export const cleanupCache = () => {
  const now = Date.now();
  for (const [key, { expiry }] of cache.entries()) {
    if (now > expiry) {
      cache.delete(key);
    }
  }
};

// Run cache cleanup every 15 minutes
setInterval(cleanupCache, 15 * 60 * 1000);
