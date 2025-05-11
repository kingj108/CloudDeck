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
  // Formats raw airport data into user-friendly display format
  // Returns JSX for popup content
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
3. API request is made to fetch weather data
4. Response is processed and stored in state
5. Data is formatted and rendered on the map
6. Auto-refresh interval is set up
7. When component unmounts or becomes inactive, interval is cleared

## Performance Considerations

### Optimizations
- Uses `useMemo` to prevent unnecessary re-renders of formatted data
- Only fetches data when the component is active
- Cleans up intervals when component is inactive or unmounts

### Potential Bottlenecks
- Large datasets with many airports can slow rendering
- Frequent API calls may hit rate limits

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

## Extension Points

### Adding New Map Layers
To add additional map layers:

1. Import the required components from react-leaflet:
```jsx
import { LayersControl } from 'react-leaflet';
```

2. Define the layer in the render method:
```jsx
<LayersControl position="topright">
  <LayersControl.BaseLayer name="OpenStreetMap" checked>
    <TileLayer
      attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>
  <LayersControl.BaseLayer name="Satellite">
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution="&copy; Esri"
    />
  </LayersControl.BaseLayer>
</LayersControl>
```

### Adding Weather Overlays
To add weather overlays like precipitation:

1. Create a new component for the overlay
2. Use the Leaflet API to add the overlay to the map
3. Add it as an overlay in the LayersControl

```jsx
<LayersControl.Overlay name="Precipitation">
  <PrecipitationLayer />
</LayersControl.Overlay>
```

## Common Issues and Solutions

### Markers Not Appearing
- Check that the latitude and longitude data is valid
- Verify the data format from the API
- Ensure the map is centered on a region with data

### Performance Issues
- Limit the number of markers rendered at once
- Use clustering for dense marker groups
- Implement virtualization for large datasets

### API Rate Limiting
- Implement caching of weather data
- Increase the refresh interval
- Add error handling for rate limit responses

## Testing

### Manual Testing
1. Verify markers appear in correct locations
2. Check that popups display correct information
3. Test auto-refresh functionality
4. Verify error handling works correctly

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

### Code Improvements
1. Separate marker rendering into a dedicated component
2. Implement React context for weather data
3. Add TypeScript type definitions
4. Improve error handling and retry logic 