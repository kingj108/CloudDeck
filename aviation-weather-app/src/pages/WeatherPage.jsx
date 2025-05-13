import React, { useState } from 'react';
import WeatherDisplay from '../components/WeatherDisplay';
import AviationBackground from '../components/AviationBackground';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../context/ThemeContext';

export default function WeatherPage({ onSearch, metar, taf, loading, error, onRefresh, isRefreshing, favorites, onToggleFavorite }) {
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim().toUpperCase());
    }
  };

  // If we have weather data, show the WeatherDisplay component
  if (metar) {
    return (
      <WeatherDisplay
        metar={metar}
        taf={taf}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
    );
  }

  // Show loading state
  if (loading) {
    return <LoadingIndicator isLoading={true} message="Fetching weather data..." />;
  }

  // Show error state
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Show initial search state
  return (
    <div className={`min-h-[calc(100vh-4rem)] ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <AviationBackground>
        <div className="container mx-auto px-4 py-8">
          {/* Error message */}
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}
          
          {/* Loading indicator */}
          <LoadingIndicator isLoading={loading && !metar}>
            {/* If we have METAR data, show the weather display */}
            {metar ? (
              <WeatherDisplay
                metar={metar}
                taf={taf}
                onRefresh={onRefresh}
                isRefreshing={isRefreshing}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
              />
            ) : !loading && !error ? (
              <div className="text-center p-12">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md inline-block max-w-md">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Welcome to Weather</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Search for an airport code to view current weather conditions and forecasts.
                  </p>
                  
                  {/* In-page search form */}
                  <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex shadow-sm">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter ICAO (e.g., KJFK)"
                        className={`px-4 py-3 w-full rounded-l-md focus:outline-none text-gray-800 ${
                          darkMode ? 'border-gray-700' : 'border-gray-300'
                        }`}
                        maxLength={4}
                      />
                      <button
                        type="submit"
                        className={`px-6 py-3 rounded-r-md font-medium transition-colors ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        disabled={!searchQuery.trim()}
                      >
                        Search
                      </button>
                    </div>
                  </form>
                  
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Popular airports:</p>
                    <div className="grid grid-cols-2 gap-4">
                      {['KJFK', 'KLAX', 'KORD', 'EGLL'].map(code => (
                        <button
                          key={code}
                          onClick={() => onSearch(code)}
                          className={`px-4 py-2 rounded-md ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                          }`}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </LoadingIndicator>
        </div>
      </AviationBackground>
    </div>
  );
} 