import { useState } from 'react';

export default function SearchForm({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim().toUpperCase());
      setSearchTerm('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter ICAO (e.g., KJFK)"
        className="px-3 py-2 rounded-l-md border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={4}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
        disabled={!searchTerm.trim()}
      >
        Search
      </button>
    </form>
  );
} 