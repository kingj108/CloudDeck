import { useState } from 'react';
import WeatherDisplay from './WeatherDisplay';
import { fetchMetar, fetchTaf } from '../services/weatherApi';

export default function FlightPlanning() {
  const [departureData, setDepartureData] = useState({ metar: null, taf: null });
  const [arrivalData, setArrivalData] = useState({ metar: null, taf: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAirportSearch = async (icao, isArrival) => {
    if (!icao) {
      setError('Please enter an airport code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const [metarData, tafData] = await Promise.all([
        fetchMetar(icao),
        fetchTaf(icao)
      ]);
      
      if (!metarData?.data?.[0]?.raw) {
        throw new Error('No weather data available for this airport');
      }

      if (isArrival) {
        setArrivalData({ metar: metarData.data[0], taf: tafData.data[0] });
      } else {
        setDepartureData({ metar: metarData.data[0], taf: tafData.data[0] });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch weather data');
      if (isArrival) {
        setArrivalData({ metar: null, taf: null });
      } else {
        setDepartureData({ metar: null, taf: null });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departure Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Departure</h2>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Enter departure ICAO"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAirportSearch(e.target.value, false);
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              onClick={(e) => handleAirportSearch(e.target.previousElementSibling.value, false)}
            >
              Search
            </button>
          </div>
          {departureData.metar && (
            <WeatherDisplay
              metar={departureData.metar}
              taf={departureData.taf}
              compact={true}
            />
          )}
        </div>

        {/* Arrival Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Arrival</h2>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Enter arrival ICAO"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAirportSearch(e.target.value, true);
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              onClick={(e) => handleAirportSearch(e.target.previousElementSibling.value, true)}
            >
              Search
            </button>
          </div>
          {arrivalData.metar && (
            <WeatherDisplay
              metar={arrivalData.metar}
              taf={arrivalData.taf}
              compact={true}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
    </div>
  );
} 