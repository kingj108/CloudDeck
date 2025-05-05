import { useState } from 'react';

export default function SearchForm({ onSearch }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) onSearch(code.trim().toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter ICAO code e.g. KJFK"
        className="border border-transparent rounded-l px-3 py-1 w-36 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <button 
        type="submit" 
        className="bg-blue-400 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded-r"
      >
        Search
      </button>
    </form>
  );
}
