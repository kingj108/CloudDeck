import { useState } from 'react';

export default function SearchForm({ onSearch }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) onSearch(code.trim().toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex">
      <input
        type="text"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter ICAO code e.g. KJFK"
        className="border rounded-l px-3 py-2 w-32"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 rounded-r">
        Search
      </button>
    </form>
  );
}
