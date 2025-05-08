/**
 * Standard aviation weather category criteria
 */

// Flight category thresholds
export const CATEGORY_THRESHOLDS = {
  VFR: {
    visibility: 5, // statute miles
    ceiling: 3000, // feet AGL
  },
  MVFR: {
    visibility: 3,
    ceiling: 1000,
  },
  IFR: {
    visibility: 1,
    ceiling: 500,
  },
  // LIFR is anything below IFR thresholds
};

/**
 * Get flight category based on visibility
 * @param {number} visibility - Visibility in statute miles
 * @returns {string} Flight category based on visibility
 */
export const getCategoryFromVisibility = (visibility) => {
  if (!visibility && visibility !== 0) return 'UNKNOWN';
  if (visibility >= CATEGORY_THRESHOLDS.VFR.visibility) return 'VFR';
  if (visibility >= CATEGORY_THRESHOLDS.MVFR.visibility) return 'MVFR';
  if (visibility >= CATEGORY_THRESHOLDS.IFR.visibility) return 'IFR';
  return 'LIFR';
};

/**
 * Parse cloud layer string into structured data
 * @param {string} cloudString - Cloud layer string (e.g., "BKN011")
 * @returns {Object} Parsed cloud layer data
 */
export const parseCloudLayer = (cloudString) => {
  if (!cloudString) return null;
  
  const coverage = cloudString.slice(0, 3);
  const height = parseInt(cloudString.slice(3)) * 100;
  
  return {
    coverage,
    base_feet_agl: height
  };
};

/**
 * Get flight category based on ceiling
 * @param {Array} clouds - Array of cloud layers or cloud strings
 * @returns {string} Flight category based on ceiling
 */
export const getCategoryFromCeiling = (clouds) => {
  if (!clouds || !Array.isArray(clouds)) return 'UNKNOWN';

  // Convert string format clouds to structured format if needed
  const processedClouds = clouds.map(cloud => {
    if (typeof cloud === 'string') {
      return parseCloudLayer(cloud);
    }
    return cloud;
  });

  // Find the lowest broken or overcast layer
  const ceiling = processedClouds
    .filter(cloud => cloud && ['BKN', 'OVC'].includes(cloud.coverage))
    .map(cloud => cloud.base_feet_agl)
    .sort((a, b) => a - b)[0];

  // If no ceiling found (e.g., only scattered clouds)
  if (!ceiling && ceiling !== 0) return 'VFR';

  if (ceiling >= CATEGORY_THRESHOLDS.VFR.ceiling) return 'VFR';
  if (ceiling >= CATEGORY_THRESHOLDS.MVFR.ceiling) return 'MVFR';
  if (ceiling >= CATEGORY_THRESHOLDS.IFR.ceiling) return 'IFR';
  return 'LIFR';
};

/**
 * Get the most restrictive flight category based on both visibility and ceiling
 * @param {number} visibility - Visibility in statute miles
 * @param {Array} clouds - Array of cloud layers
 * @returns {string} Most restrictive flight category
 */
export const determineFlightCategory = (visibility, clouds) => {
  const categories = ['VFR', 'MVFR', 'IFR', 'LIFR'];
  
  const visibilityCategory = getCategoryFromVisibility(visibility);
  const ceilingCategory = getCategoryFromCeiling(clouds);
  
  // Return the more restrictive category
  const visibilityIndex = categories.indexOf(visibilityCategory);
  const ceilingIndex = categories.indexOf(ceilingCategory);
  
  if (visibilityIndex === -1 || ceilingIndex === -1) return 'UNKNOWN';
  return categories[Math.max(visibilityIndex, ceilingIndex)];
};

/**
 * Get the color associated with a flight category
 * @param {string} category - Flight category
 * @returns {string} Hex color code
 */
export const getFlightCategoryColor = (category) => {
  const colors = {
    VFR: '#3CB371',    // Green
    MVFR: '#4169E1',   // Blue
    IFR: '#FF4500',    // Red
    LIFR: '#FF69B4',   // Pink
    UNKNOWN: '#808080', // Gray
  };
  return colors[category] || colors.UNKNOWN;
}; 