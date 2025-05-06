import React from 'react';

/**
 * Flight category colors based on aviation standards
 */
const FLIGHT_CATEGORY_COLORS = {
  VFR: '#3CB371', // Green
  MVFR: '#4169E1', // Blue
  IFR: '#FF4500', // Red
  LIFR: '#FF69B4' // Pink
};

/**
 * A component to display flight category with appropriate color coding
 * @param {Object} props - Component props
 * @param {string} props.category - The flight category (VFR, MVFR, IFR, LIFR)
 * @param {string} props.size - Size of the indicator (sm, md, lg)
 */
function FlightCategoryIndicator({ category = 'VFR', size = 'md' }) {
  const normalizedCategory = category.toUpperCase();
  const color = FLIGHT_CATEGORY_COLORS[normalizedCategory] || FLIGHT_CATEGORY_COLORS.VFR;
  
  // Determine size classes
  const sizeClasses = {
    sm: 'h-3 w-3 text-xs',
    md: 'h-4 w-4 text-sm',
    lg: 'h-6 w-6 text-base'
  };
  
  const dotClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div className="flex items-center">
      <div 
        className={`rounded-full ${dotClass} mr-1`} 
        style={{ backgroundColor: color }}
      ></div>
      <span>{normalizedCategory}</span>
    </div>
  );
}

export default FlightCategoryIndicator;
