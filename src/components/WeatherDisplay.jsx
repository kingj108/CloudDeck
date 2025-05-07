  {/* Timestamp */}
  {metar.timestamp && (
    <p className="text-sm text-gray-500 mt-1">
      Updated: {new Date(metar.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}
    </p>
  )} 