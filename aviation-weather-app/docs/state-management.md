# State Management Documentation

## Overview

CloudDeck uses a hybrid state management approach combining React hooks, Context API, and local storage for persistence. The system is designed to be scalable, performant, and maintainable while providing a smooth user experience.

## Architecture

### State Management Layers

1. **Local Component State** - useState for component-specific data
2. **Global Context State** - React Context for app-wide state
3. **Persistent State** - localStorage for user preferences
4. **Server State** - API data with caching and error handling

## Global State Management

### App-Level State (`App.jsx`)

The main application state is managed in the `AppContent` component:

```jsx
function AppContent() {
  // Weather data state
  const [metar, setMetar] = useState(null);
  const [taf, setTaf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
}
```

### State Categories

#### Weather Data State
```jsx
const [metar, setMetar] = useState(null);      // Current METAR data
const [taf, setTaf] = useState(null);          // Current TAF data
const [loading, setLoading] = useState(false); // Loading state
const [error, setError] = useState('');        // Error messages
```

#### UI State
```jsx
const [activeTab, setActiveTab] = useState('home');     // Current navigation tab
const [isRefreshing, setIsRefreshing] = useState(false); // Refresh state
const [showSettings, setShowSettings] = useState(false); // Settings modal state
```

#### User Preferences State
```jsx
const [favorites, setFavorites] = useState([]); // User's favorite airports
```

#### Authentication State
```jsx
const [isLoggedIn, setIsLoggedIn] = useState(false); // Login status
const [currentUser, setCurrentUser] = useState(null); // User data
```

## Context-Based State

### Theme Context (`ThemeContext.jsx`)

Manages global theme state with persistence:

```jsx
export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Context Usage Pattern

```jsx
// Using theme context
const { darkMode, toggleDarkMode } = useTheme();

// Conditional styling based on theme
<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
```

## State Persistence

### Local Storage Strategy

The application uses localStorage for persistent user preferences:

```jsx
// Saving state to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Loading state from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};
```

### Persistent State Examples

#### Theme Preferences
```jsx
// Initialize theme state from localStorage
const [darkMode, setDarkMode] = useState(() => {
  const savedMode = localStorage.getItem('darkMode');
  return savedMode ? JSON.parse(savedMode) : false;
});

// Save theme changes
useEffect(() => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
}, [darkMode]);
```

#### Favorites Management
```jsx
// Load favorites on component mount
useEffect(() => {
  const savedFavorites = localStorage.getItem('favorites');
  if (savedFavorites) {
    setFavorites(JSON.parse(savedFavorites));
  }
}, []);

// Save favorites when they change
useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);
```

## State Update Patterns

### Async State Updates

```jsx
const handleSearch = async (icao) => {
  setLoading(true);
  setError('');
  
  try {
    const [metarData, tafData] = await Promise.all([
      fetchMetar(icao),
      fetchTaf(icao)
    ]);
    
    setMetar(metarData.data[0]);
    setTaf(tafData.data[0]);
  } catch (err) {
    setError(err.message || 'Failed to fetch weather data');
    setMetar(null);
    setTaf(null);
  } finally {
    setLoading(false);
  }
};
```

### Optimistic Updates

```jsx
const toggleFavorite = (icao) => {
  // Optimistic update
  const newFavorites = favorites.includes(icao)
    ? favorites.filter(fav => fav !== icao)
    : [...favorites, icao];
  
  setFavorites(newFavorites);
  
  // Persist to localStorage
  localStorage.setItem('favorites', JSON.stringify(newFavorites));
};
```

### Batch State Updates

```jsx
const handleRefresh = async () => {
  if (!metar?.station?.icao || isRefreshing) return;
  
  setIsRefreshing(true);
  try {
    await handleSearch(metar.station.icao);
  } finally {
    setIsRefreshing(false);
  }
};
```

## Component State Management

### Local Component State

```jsx
// WeatherMap component state
const [mapData, setMapData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [lastUpdate, setLastUpdate] = useState(null);
const [intervalId, setIntervalId] = useState(null);
```

### Derived State

```jsx
// Memoized derived state
const formattedMapData = useMemo(() => {
  return mapData.map((airport) => ({
    id: airport.icao,
    icao: airport.icao,
    name: airport.name || airport.icao,
    lat: airport.lat,
    lon: airport.lon,
    category: airport.flight_category,
    details: formatWeatherDetails(airport),
  }));
}, [mapData]);
```

## State Synchronization

### Route-Based State Updates

```jsx
// Sync active tab with current route
useEffect(() => {
  const path = location.pathname;
  if (path === '/') setActiveTab('home');
  else if (path === '/weather') setActiveTab('weather');
  else if (path === '/map') setActiveTab('map');
  else if (path === '/flight-planning') setActiveTab('flight-planning');
  else if (path === '/settings') setActiveTab('settings');
  else if (path === '/glossary') setActiveTab('glossary');
}, [location]);
```

### Timer-Based State Updates

```jsx
// Update Zulu time every second
useEffect(() => {
  const timer = setInterval(() => {
    setZuluTime(getZuluTime());
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

## Error Handling

### Error State Management

```jsx
// Centralized error handling
const handleError = (error, context = '') => {
  console.error(`${context} error:`, error);
  setError(error.message || 'An unexpected error occurred');
};

// Error recovery
const clearError = () => {
  setError('');
};
```

### Loading State Management

```jsx
// Loading state for async operations
const [loading, setLoading] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);

// Loading indicators
if (loading) {
  return <LoadingIndicator isLoading={true} message="Loading..." />;
}
```

## Performance Optimizations

### State Memoization

```jsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

### Conditional Rendering

```jsx
// Only render when component is active
if (!isActive) {
  return null;
}

// Conditional loading states
if (loading && !mapData.length) {
  return <LoadingIndicator />;
}
```

## Best Practices

### 1. State Organization

```jsx
// Group related state
const [weatherData, setWeatherData] = useState({
  metar: null,
  taf: null,
  loading: false,
  error: ''
});

// Or use separate state for better granularity
const [metar, setMetar] = useState(null);
const [taf, setTaf] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

### 2. State Updates

```jsx
// Use functional updates for state that depends on previous value
setCount(prevCount => prevCount + 1);

// Batch related state updates
const updateWeatherData = (newData) => {
  setMetar(newData.metar);
  setTaf(newData.taf);
  setLoading(false);
  setError('');
};
```

### 3. Cleanup

```jsx
// Clean up intervals and subscriptions
useEffect(() => {
  const interval = setInterval(() => {
    // Update logic
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### 4. Error Boundaries

```jsx
// Implement error boundaries for component error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## Future Improvements

### 1. State Management Library

Consider implementing a more robust state management solution:

```jsx
// Potential Redux Toolkit implementation
import { createSlice, configureStore } from '@reduxjs/toolkit';

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    metar: null,
    taf: null,
    loading: false,
    error: ''
  },
  reducers: {
    setMetar: (state, action) => {
      state.metar = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});
```

### 2. Server State Management

Implement React Query or SWR for better server state management:

```jsx
// React Query example
const { data: metar, isLoading, error } = useQuery(
  ['metar', icao],
  () => fetchMetar(icao),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

### 3. State Persistence Enhancement

```jsx
// Implement more sophisticated persistence
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    return loadFromStorage(key, defaultValue);
  });

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState];
};
```

## Troubleshooting

### Common Issues

1. **State not updating**
   - Check for proper dependencies in useEffect
   - Verify state update functions are being called
   - Ensure components are re-rendering

2. **Performance issues**
   - Use React.memo for expensive components
   - Implement proper memoization
   - Avoid unnecessary re-renders

3. **Persistence problems**
   - Check localStorage permissions
   - Verify JSON serialization/deserialization
   - Handle storage quota exceeded errors

### Debug Tools

```jsx
// Debug state changes
useEffect(() => {
  console.log('State changed:', { metar, taf, loading, error });
}, [metar, taf, loading, error]);

// Debug localStorage
const debugStorage = () => {
  console.log('localStorage contents:', {
    darkMode: localStorage.getItem('darkMode'),
    favorites: localStorage.getItem('favorites')
  });
};
``` 