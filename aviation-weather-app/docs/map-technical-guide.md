# Weather Map Technical Guide

## Component Overview

The `WeatherMap` component is a core feature of CloudDeck that visualizes aviation weather data on an interactive map. This document provides technical details for developers working with this component.

## File Structure

- **Main Component**: `src/components/WeatherMap.jsx`
- **API Service**: `src/services/weatherApi.js`
- **Parser Utilities**: `src/utils/metarParser.js`

## Dependencies

- **React Leaflet**: Map rendering library
- **Leaflet**: Core mapping library
- **React Hooks**: useState, useEffect, useMemo for state management
- **Tailwind CSS**: Styling and layout

## Component Architecture

### State Management

The component uses several state variables:
```jsx
const [mapData, setMapData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [lastUpdate, setLastUpdate] = useState(null);
const [intervalId, setIntervalId] = useState(null);
```

| State Variable | Purpose |
|----------------|---------|
| `mapData` | Stores the processed weather data for all airports |
| `loading` | Indicates when data is being fetched |
| `error` | Stores any error messages |
| `lastUpdate` | Timestamp of the last successful data update |
| `intervalId` | Reference to the auto-refresh interval timer |

### Key Functions

#### Custom Icon Creation
```jsx
const createCustomIcon = (category) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${flightCategoryColors[category] || flightCategoryColors.UNKNOWN}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7],
  });
};
```

#### Data Fetching
```jsx
const fetchWeatherData = async () => {
  if (!isActive) return;
  
  setLoading(true);
  try {
    const response = await fetchMapData();
    if (response && response.data) {
      setMapData(response.data);
      setLastUpdate(new Date());
      setError('');
    } else {
      throw new Error('Invalid data format');
    }
  } catch (err) {
    setError('Failed to load weather map data');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

#### Data Formatting
```jsx
const formatWeatherDetails = (airport) => {
  // Format temperature with both Celsius and Fahrenheit
  let tempDisplay = 'N/A';
  if (airport.temp?.celsius !== undefined) {
    const celsius = airport.temp.celsius;
    const fahrenheit = Math.round((celsius * 9/5) + 32);
    tempDisplay = `${celsius}°C (${fahrenheit}°F)`;
  }
  
  const wind = airport.wind ? 
    `${airport.wind.degrees || 0}° @ ${airport.wind.speed_kts || 0}${airport.wind.gust_kts ? 'G' + airport.wind.gust_kts : ''} kt` 
    : 'Calm';
  const visibility = formatVisibility(airport.visibility);
  const clouds = formatCloudLayers(airport.clouds);
  const category = airport.flight_category || 'UNKNOWN';
  const categoryColor = flightCategoryColors[category] || flightCategoryColors.UNKNOWN;

  return (
    <div className="text-sm">
      <div className="font-bold mb-1">{airport.icao}</div>
      <div className="text-gray-600 mb-2">{airport.name}</div>
      <div><strong>Temperature:</strong> {tempDisplay}</div>
      <div><strong>Wind:</strong> {wind}</div>
      <div><strong>Visibility:</strong> {visibility}</div>
      <div><strong>Clouds:</strong> {clouds}</div>
      <div>
        <strong>Category:</strong>{' '}
        <span style={{ color: categoryColor, fontWeight: 'bold' }}>
          {category}
        </span>
      </div>
    </div>
  );
};
```

### Lifecycle Management

The component uses `useEffect` to manage data fetching and refresh intervals:

```jsx
useEffect(() => {
  if (isActive) {
    fetchWeatherData();
    // Start auto-refresh when tab is active
    const newIntervalId = setInterval(fetchWeatherData, REFRESH_INTERVAL);
    setIntervalId(newIntervalId);
  } else {
    // Clear interval when tab is inactive
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [isActive]);
```

## Data Flow

1. Component mounts or becomes active
2. `fetchWeatherData()` is called
3. API request is made to fetch weather data for all major airports
4. Response is processed and stored in state
5. Data is formatted and rendered on the map
6. Auto-refresh interval is set up
7. When component unmounts or becomes inactive, interval is cleared

## Performance Considerations

### Optimizations
- Uses `useMemo` to prevent unnecessary re-renders of formatted data
- Only fetches data when the component is active
- Cleans up intervals when component is inactive or unmounts
- Parallel fetching of weather data for multiple airports
- Caching of weather data for 5 minutes

### Potential Bottlenecks
- Large datasets with many airports can slow rendering
- Frequent API calls may hit rate limits
- Network latency when fetching data for multiple airports

## Customization Options

### Flight Category Colors
The colors used for flight categories are defined in the `flightCategoryColors` object:

```jsx
const flightCategoryColors = {
  VFR: '#3CB371',  // Green
  MVFR: '#4169E1', // Blue
  IFR: '#FF4500',  // Red
  LIFR: '#FF69B4', // Pink
  UNKNOWN: '#808080', // Gray
};
```

### Refresh Interval
The auto-refresh interval is defined as a constant:

```jsx
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
```

## Map Features

### Base Map
The map uses OpenStreetMap as the base layer:

```jsx
<TileLayer
  attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### Airport Markers
- Each airport is represented by a colored dot marker
- Color indicates flight category
- Clicking a marker shows a popup with detailed weather information
- Markers are positioned using airport coordinates from the MAJOR_AIRPORTS list

### Legend
The map includes a legend showing:
- Flight category colors
- Last update time
- Interactive controls for map zoom and pan

## Error Handling

The component implements several error handling mechanisms:
1. Graceful degradation when weather data is unavailable
2. Visual error indicators for failed data fetches
3. Fallback to cached data when available
4. Automatic retry on data fetch failures

## Testing

### Manual Testing
1. Verify markers appear in correct locations
2. Check that popups display correct information
3. Test auto-refresh functionality
4. Verify error handling works correctly
5. Test map interaction (zoom, pan, marker clicks)

### Automated Testing
Example test case using Jest and React Testing Library:

```jsx
test('displays loading state when fetching data', () => {
  // Mock the API call
  jest.spyOn(weatherApi, 'fetchMapData').mockImplementation(() => 
    new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
  );
  
  const { getByText } = render(<WeatherMap isActive={true} />);
  expect(getByText('Loading map data...')).toBeInTheDocument();
});
```

## Future Development

### Planned Features
1. Multiple base map layers
2. Weather radar overlay
3. Wind barbs on markers
4. Route planning tools
5. Historical data visualization
6. Custom airport selection
7. Weather alerts overlay

### Code Improvements
1. Separate marker rendering into a dedicated component
2. Implement React context for weather data
3. Add TypeScript type definitions
4. Improve error handling and retry logic
5. Add unit tests for data formatting functions
6. Implement progressive loading for large datasets 