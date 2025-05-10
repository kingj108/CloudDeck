import React, { useState } from 'react';
import WeatherDisplay from '../components/WeatherDisplay';
import AviationBackground from '../components/AviationBackground';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

export default function WeatherPage({ onSearch, metar, taf, loading, error, onRefresh, isRefreshing }) {
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
    <AviationBackground>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 pt-24 text-white">
        <div className="max-w-2xl text-center space-y-8">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Airport Weather
            </h1>
          </div>
          
          <p className="text-xl text-gray-200 max-w-xl mx-auto">
            Enter an airport's ICAO code to get detailed METAR and TAF information
          </p>

          {/* Search Form */}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  placeholder="Enter ICAO code (e.g., KJFK)"
                  className="w-full px-6 py-3 text-lg text-gray-800 bg-white rounded-lg 
                    border-2 border-transparent focus:border-blue-400 focus:outline-none
                    placeholder-gray-400 shadow-lg"
                  maxLength={4}
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold
                  hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50
                  disabled:cursor-not-allowed shadow-lg"
              >
                Get Weather
              </button>
            </form>
          </div>

          {/* Popular Airports */}
          <div className="mt-12 p-8 rounded-xl bg-white/5 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-6">Popular Airports</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { code: 'KJFK', name: 'New York' },
                { code: 'KLAX', name: 'Los Angeles' },
                { code: 'KORD', name: 'Chicago' },
                { code: 'KATL', name: 'Atlanta' }
              ].map((airport) => (
                <button
                  key={airport.code}
                  onClick={() => onSearch(airport.code)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg
                    transition-colors duration-200 flex flex-col items-center"
                >
                  <span className="text-lg font-semibold">{airport.code}</span>
                  <span className="text-sm text-gray-300">{airport.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AviationBackground>
  );
} 