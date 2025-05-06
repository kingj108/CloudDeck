import React from 'react';

/**
 * A loading indicator component that displays a spinner and optional message
 * @param {Object} props - Component props
 * @param {boolean} props.isLoading - Whether the component should show the loading state
 * @param {string} props.message - Optional message to display with the spinner
 * @param {React.ReactNode} props.children - Content to display when not loading
 */
function LoadingIndicator({ isLoading, message = 'Loading...', children }) {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export default LoadingIndicator;
