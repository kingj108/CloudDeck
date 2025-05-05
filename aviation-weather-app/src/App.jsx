import { useState } from 'react';
import SearchForm from './components/SearchForm';
import WeatherDisplay from './components/WeatherDisplay';

// Mock data for testing when API is unavailable
const MOCK_METAR = {
  raw_text: "KJFK 051651Z 33015G25KT 10SM FEW050 SCT250 16/M04 A3012 RMK AO2 SLP199 T01561044",
  station_id: "KJFK",
  observation_time: "2025-05-05T16:51:00Z",
  latitude: 40.64,
  longitude: -73.76,
  temp_c: 15.6,
  dewpoint_c: -4.4,
  wind_dir_degrees: 330,
  wind_speed_kt: 15,
  wind_gust_kt: 25,
  visibility_statute_mi: 10.0,
  altim_in_hg: 30.12,
  sea_level_pressure_mb: 1019.9,
  flight_category: "VFR",
  three_hr_pressure_tendency_mb: 0.5,
  maxT_c: 17.0,
  minT_c: 10.0,
  precip_in: 0.0,
  pcp3hr_in: 0.0,
  pcp6hr_in: 0.0,
  pcp24hr_in: 0.0,
  snow_in: 0.0,
  vert_vis_ft: 0,
  metar_type: "METAR",
  elevation_m: 4.0
};

const MOCK_TAF = {
  raw_text: "KJFK 051730Z 0518/0624 33015G25KT P6SM SCT050 BKN250\n     FM052000 34010KT P6SM FEW050 SCT250\n     FM060600 35008KT P6SM FEW050",
  station_id: "KJFK",
  issue_time: "2025-05-05T17:30:00Z",
  bulletin_time: "2025-05-05T17:30:00Z",
  valid_time_from: "2025-05-05T18:00:00Z",
  valid_time_to: "2025-05-06T24:00:00Z",
  latitude: 40.64,
  longitude: -73.76,
  elevation_m: 4.0
};

// Use a reliable CORS proxy for API requests
const PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://aviationweather.gov/adds/dataserver_current/httpparam';

function App() {
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMockData, setUseMockData] = useState(false); // Toggle for mock data

  const fetchWeather = async (code) => {
    setError('');
    setLoading(true);
    
    try {
      // Use mock data if toggle is on
      if (useMockData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Use mock data but update station_id to match search
        const mockMetarData = {...MOCK_METAR, station_id: code.toUpperCase()};
        const mockTafData = code.length === 4 ? {...MOCK_TAF, station_id: code.toUpperCase()} : null;
        
        setMetar(mockMetarData);
        setTaf(mockTafData);
        return;
      }
      
      // Otherwise use real API
      const [metarRes, tafRes] = await Promise.all([
        fetch(
          `${PROXY}${BASE_URL}?dataSource=metars&requestType=retrieve&format=JSON&stationString=${code}&hoursBeforeNow=2`
        ).then(async (res) => {
          if (!res.ok) {
            throw new Error(`METAR API error: ${res.status}`);
          }
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse METAR response:', text.substring(0, 100));
            throw new Error('Invalid METAR data received');
          }
        }),
        fetch(
          `${PROXY}${BASE_URL}?dataSource=tafs&requestType=retrieve&format=JSON&stationString=${code}&hoursBeforeNow=6`
        ).then(async (res) => {
          if (!res.ok) {
            throw new Error(`TAF API error: ${res.status}`);
          }
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse TAF response:', text.substring(0, 100));
            throw new Error('Invalid TAF data received');
          }
        }),
      ]);
      
      const metarData = metarRes.response?.data?.METAR?.[0] || null;
      const tafData = tafRes.response?.data?.TAF?.[0] || null;
      if (!metarData) throw new Error('No METAR data found');
      setMetar(metarData);
      setTaf(tafData);
    } catch (e) {
      setError(e.message);
      setMetar(null);
      setTaf(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Aviation Weather App</h1>
      <SearchForm onSearch={fetchWeather} />
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {metar && <WeatherDisplay metar={metar} taf={taf} />}
    </div>
  );
}

export default App;
