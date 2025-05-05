export default function FavoritesList({ favorites, onSelectAirport }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="mt-4 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Favorites</h2>
        <p className="text-gray-500">No favorite airports saved yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Favorites</h2>
      <div className="flex flex-wrap gap-2">
        {favorites.map(code => (
          <button
            key={code}
            onClick={() => onSelectAirport(code)}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 flex items-center"
          >
            <span className="favorite-btn active mr-1">★</span>
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}
