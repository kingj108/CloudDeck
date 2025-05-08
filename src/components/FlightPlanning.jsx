import { useState } from 'react';
import WeatherDisplay from './WeatherDisplay';

export default function FlightPlanning({ onSearch }) {
  const [departureICAO, setDepartureICAO] = useState('');
  const [arrivalICAO, setArrivalICAO] = useState('');
  const [departureData, setDepartureData] = useState(null);
  const [arrivalData, setArrivalData] = useState(null);

  const handleSearch = (type, icao) => {
    const upperICAO = icao.toUpperCase();
    onSearch(upperICAO).then(data => {
      if (type === 'departure') {
        setDepartureData(data);
        setDepartureICAO(upperICAO);
      } else {
        setArrivalData(data);
        setArrivalICAO(upperICAO);
      }
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="weather-card mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Flight Planning</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Departure Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-lg font-semibold text-gray-700">Departure:</label>
              <div className="flex-1">
                <input
                  type="text"
                  value={departureICAO}
                  onChange={(e) => setDepartureICAO(e.target.value.toUpperCase())}
                  placeholder="Enter ICAO (e.g., KJFK)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={4}
                />
              </div>
              <button
                onClick={() => handleSearch('departure', departureICAO)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!departureICAO}
              >
                Search
              </button>
            </div>
            {departureData && (
              <div className="glass-panel">
                <WeatherDisplay
                  metar={departureData.metar}
                  taf={departureData.taf}
                  onRefresh={() => handleSearch('departure', departureICAO)}
                />
              </div>
            )}
          </div>

          {/* Arrival Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-lg font-semibold text-gray-700">Arrival:</label>
              <div className="flex-1">
                <input
                  type="text"
                  value={arrivalICAO}
                  onChange={(e) => setArrivalICAO(e.target.value.toUpperCase())}
                  placeholder="Enter ICAO (e.g., KLAX)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={4}
                />
              </div>
              <button
                onClick={() => handleSearch('arrival', arrivalICAO)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!arrivalICAO}
              >
                Search
              </button>
            </div>
            {arrivalData && (
              <div className="glass-panel">
                <WeatherDisplay
                  metar={arrivalData.metar}
                  taf={arrivalData.taf}
                  onRefresh={() => handleSearch('arrival', arrivalICAO)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Additional Flight Info Section */}
        {departureData && arrivalData && (
          <div className="mt-8 glass-panel p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Flight Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Distance</div>
                <div className="text-2xl font-bold text-blue-600">
                  {/* You can add distance calculation here */}
                  --
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Est. Flight Time</div>
                <div className="text-2xl font-bold text-blue-600">
                  {/* You can add flight time estimation here */}
                  --
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Time Zone Change</div>
                <div className="text-2xl font-bold text-blue-600">
                  {/* You can add time zone difference here */}
                  --
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 