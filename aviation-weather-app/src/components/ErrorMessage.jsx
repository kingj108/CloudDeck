import React from 'react';

/**
 * A component to display error messages with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.message - The error message to display
 * @param {string} props.details - Optional additional details about the error
 * @param {Function} props.onRetry - Optional callback function to retry the operation
 */
function ErrorMessage({ message, details, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-3">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {/* Error icon */}
          <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{message}</h3>
          {details && <p className="text-sm mt-1">{details}</p>}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 text-xs font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
