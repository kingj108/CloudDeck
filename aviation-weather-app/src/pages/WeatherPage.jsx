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
          {/* Search form is in the navbar */}
          
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
                  <p className="text-gray-600 dark:text-gray-300">
                    Search for an airport code in the search box above to view 
                    current weather conditions and forecasts.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4">
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
            ) : null}
          </LoadingIndicator>
        </div>
      </AviationBackground>
    </div>
  );
} 