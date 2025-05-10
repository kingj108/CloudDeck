import { useState } from 'react';

export default function SearchForm({ onSearch }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate ICAO code (4 letters, alphanumeric)
    const icaoCode = code.trim().toUpperCase();
    if (!icaoCode) {
      setError('Please enter an ICAO code');
      return;
    }
    
    if (!/^[A-Z0-9]{4}$/.test(icaoCode)) {
      setError('ICAO code must be 4 characters');
      return;
    }
    
    setError('');
    onSearch(icaoCode);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative">
          <input
            type="text"
            maxLength={4}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError('');
            }}
            placeholder="ICAO code (e.g. KJFK)"
            className="h-10 border border-gray-300 rounded-l px-4 w-40 text-gray-800 
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent shadow-sm"
            aria-label="Airport ICAO code"
          />
          {error && (
            <div className="absolute left-0 -bottom-6 text-xs text-red-500">
              {error}
            </div>
          )}
        </div>
        <button 
          type="submit" 
          className="h-10 px-4 bg-blue-900 text-white border-2 border-white 
            rounded-r font-semibold hover:bg-blue-800 transition-colors 
            duration-200 shadow-sm"
          aria-label="Search for airport weather"
        >
          Search
        </button>
      </form>
    </div>
  );
}
