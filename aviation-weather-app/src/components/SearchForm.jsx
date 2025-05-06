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

  const searchButtonStyle = {
    backgroundColor: '#002366',
    color: 'white',
    border: '1px solid white',
    padding: '8px 20px',
    borderRadius: '0 4px 4px 0',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#003399',
    }
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
            className="border border-gray-300 rounded-l px-4 py-2 w-40 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
          style={searchButtonStyle}
          aria-label="Search for airport weather"
        >
          Search
        </button>
      </form>
    </div>
  );
}
