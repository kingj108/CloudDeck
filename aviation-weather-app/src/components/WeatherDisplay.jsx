export default function WeatherDisplay({ metar, taf }) {
  const windSpeed = metar.wind_speed_kt ? parseInt(metar.wind_speed_kt, 10) : 0;
  let windClass = 'text-green-600';
  if (windSpeed > 30) windClass = 'text-red-500';
  else if (windSpeed > 15) windClass = 'text-yellow-500';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-2">{metar.station_id} METAR</h2>
      <p className="font-mono whitespace-pre-wrap">{metar.raw_text}</p>
      <ul className="mt-2 list-disc list-inside space-y-1">
        <li><span className={windClass}>Wind: {metar.wind_dir_degrees}° &nbsp;@&nbsp; {metar.wind_speed_kt} kt</span></li>
        <li>Visibility: {metar.visibility_statute_mi} mi</li>
        <li>Temp / Dew: {metar.temp_c}°C / {metar.dewpoint_c}°C</li>
        <li>Altimeter: {metar.altim_in_hg} inHg</li>
        <li>Category: {metar.flight_category}</li>
      </ul>
      {taf && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-1">TAF</h3>
          <p className="font-mono whitespace-pre-wrap">{taf.raw_text}</p>
          <p className="text-sm text-gray-600">
            Valid: {new Date(taf.valid_time_from).toLocaleString()} – {new Date(taf.valid_time_to).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
