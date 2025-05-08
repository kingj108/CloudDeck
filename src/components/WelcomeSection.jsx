import React from 'react';

export default function WelcomeSection({ onSearch }) {
  const popularAirports = [
    { icao: 'KJFK', name: 'New York JFK' },
    { icao: 'KLAX', name: 'Los Angeles' },
    { icao: 'KORD', name: 'Chicago O\'Hare' },
    { icao: 'KATL', name: 'Atlanta' },
  ];

  return (
    <div className="weather-card">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">Cloud</span>Deck
        </h1>
        <p className="text-xl text-gray-600">
          Your comprehensive aviation weather platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 gap-4">
            {popularAirports.map((airport) => (
              <button
                key={airport.icao}
                onClick={() => onSearch(airport.icao)}
                className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="font-semibold text-blue-600">{airport.icao}</div>
                <div className="text-sm text-gray-600">{airport.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              Real-time METAR and TAF data
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              Interactive weather map
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              Flight planning tools
            </li>
            <li className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              Favorite airports tracking
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-blue-600 mb-2">New Feature</div>
            <h3 className="font-semibold mb-2">Flight Planning</h3>
            <p className="text-sm text-gray-600">Compare weather conditions for departure and arrival airports.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-green-600 mb-2">Enhancement</div>
            <h3 className="font-semibold mb-2">Weather Map</h3>
            <p className="text-sm text-gray-600">Interactive map with real-time weather conditions.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-purple-600 mb-2">Coming Soon</div>
            <h3 className="font-semibold mb-2">Route Weather</h3>
            <p className="text-sm text-gray-600">Weather conditions along your entire flight route.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 