import React from 'react';
import { useNavigate } from 'react-router-dom';
import AviationBackground from '../components/AviationBackground';

export default function WelcomePage({ onSearch }) {
  const navigate = useNavigate();

  const handleQuickSearch = (icao) => {
    onSearch(icao);
    navigate('/weather');
  };

  return (
    <AviationBackground>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 pt-24 text-white">
        <div className="max-w-4xl text-center space-y-8">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/CloudDeckicon.png" alt="CloudDeck Icon" className="w-20 h-20 mr-4" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Welcome to CloudDeck
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Your comprehensive aviation weather platform for safer, smarter flying
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div 
              className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20
                transition-colors duration-200 cursor-pointer"
              onClick={() => navigate('/weather')}
            >
              <h3 className="text-xl font-semibold mb-2">Quick Weather</h3>
              <p className="text-gray-300">Get instant access to METAR and TAF for any airport worldwide</p>
            </div>

            <div 
              className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20
                transition-colors duration-200 cursor-pointer"
              onClick={() => navigate('/flight-planning')}
            >
              <h3 className="text-xl font-semibold mb-2">Flight Planning</h3>
              <p className="text-gray-300">Plan your routes with comprehensive weather insights</p>
            </div>

            <div 
              className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20
                transition-colors duration-200 cursor-pointer"
              onClick={() => navigate('/map')}
            >
              <h3 className="text-xl font-semibold mb-2">Weather Map</h3>
              <p className="text-gray-300">Interactive maps and detailed weather graphics</p>
            </div>
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
                  onClick={() => handleQuickSearch(airport.code)}
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