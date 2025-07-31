# Component Library Documentation

## Overview

CloudDeck's component library provides a set of reusable React components designed for aviation weather applications. These components follow consistent design patterns and are built with accessibility and performance in mind.

## Core Components

### FlightCategoryIndicator

A component for displaying flight categories with standardized color coding.

```jsx
import FlightCategoryIndicator from '../components/FlightCategoryIndicator';

// Basic usage
<FlightCategoryIndicator category="VFR" />

// With custom size
<FlightCategoryIndicator category="IFR" size="lg" />

// Without colored text
<FlightCategoryIndicator category="MVFR" colorText={false} />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | string | 'VFR' | Flight category (VFR, MVFR, IFR, LIFR) |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size of the indicator |
| `colorText` | boolean | true | Whether to color the text |

### WeatherDisplay

A component for displaying METAR and TAF weather information.

```jsx
import WeatherDisplay from '../components/WeatherDisplay';

<WeatherDisplay
  metar={metarData}
  taf={tafData}
  onRefresh={handleRefresh}
  isRefreshing={false}
  favorites={favorites}
  onToggleFavorite={handleToggleFavorite}
  compact={false}
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `metar` | object | Yes | METAR weather data |
| `taf` | object | No | TAF forecast data |
| `onRefresh` | function | No | Callback for refresh action |
| `isRefreshing` | boolean | No | Loading state for refresh |
| `favorites` | array | No | List of favorite airports |
| `onToggleFavorite` | function | No | Callback for toggling favorites |
| `compact` | boolean | No | Compact display mode |

### LoadingIndicator

A component for displaying loading states.

```jsx
import LoadingIndicator from '../components/LoadingIndicator';

<LoadingIndicator isLoading={true} message="Loading weather data..." />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | boolean | false | Whether to show loading state |
| `message` | string | 'Loading...' | Custom loading message |

### ErrorMessage

A component for displaying error states.

```jsx
import ErrorMessage from '../components/ErrorMessage';

<ErrorMessage message="Failed to load weather data" />
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `message` | string | Yes | Error message to display |

### SearchForm

A reusable search form component.

```jsx
import SearchForm from '../components/SearchForm';

<SearchForm onSearch={handleSearch} placeholder="Enter ICAO code" />
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSearch` | function | Yes | Search callback |
| `placeholder` | string | No | Input placeholder text |
| `className` | string | No | Additional CSS classes |

## Layout Components

### AviationBackground

A component that provides the aviation-themed background.

```jsx
import AviationBackground from '../components/AviationBackground';

<AviationBackground>
  {/* Child content */}
</AviationBackground>
```

### Navbar

The main navigation component.

```jsx
import Navbar from '../components/Navbar';

<Navbar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  onSearch={handleSearch}
  onOpenSettings={handleOpenSettings}
  isLoggedIn={isLoggedIn}
  currentUser={currentUser}
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `activeTab` | string | Yes | Currently active tab |
| `setActiveTab` | function | Yes | Tab change handler |
| `onSearch` | function | Yes | Search handler |
| `onOpenSettings` | function | Yes | Settings handler |
| `isLoggedIn` | boolean | Yes | Authentication state |
| `currentUser` | object | No | Current user data |

## Styling Guidelines

### Color System

The component library uses a consistent color system:

```jsx
const colors = {
  // Flight Categories
  VFR: '#3CB371',    // Green
  MVFR: '#4169E1',   // Blue
  IFR: '#FF4500',    // Red
  LIFR: '#FF69B4',   // Pink
  
  // UI Colors
  primary: '#2563EB',    // Blue
  secondary: '#6B7280',  // Gray
  success: '#059669',    // Green
  warning: '#D97706',    // Orange
  error: '#DC2626',      // Red
  background: '#F3F4F6'  // Light Gray
};
```

### Typography

The library uses a consistent typography scale:

```css
/* Font Sizes */
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */
text-2xl: 1.5rem;    /* 24px */
```

### Spacing

Consistent spacing scale using Tailwind's spacing utilities:

```css
/* Spacing Scale */
space-1: 0.25rem;    /* 4px */
space-2: 0.5rem;     /* 8px */
space-3: 0.75rem;    /* 12px */
space-4: 1rem;       /* 16px */
space-6: 1.5rem;     /* 24px */
space-8: 2rem;       /* 32px */
```

## Accessibility

All components follow these accessibility guidelines:

1. Proper ARIA labels and roles
2. Keyboard navigation support
3. Focus management
4. Color contrast compliance
5. Screen reader compatibility

## Best Practices

1. **Component Composition**
   - Use composition over inheritance
   - Keep components focused and single-purpose
   - Use props for configuration

2. **Performance**
   - Memoize expensive calculations
   - Use React.memo for pure components
   - Implement proper cleanup in useEffect

3. **Error Handling**
   - Provide fallback UI for error states
   - Use error boundaries for component errors
   - Implement proper loading states

4. **Testing**
   - Write unit tests for components
   - Test accessibility features
   - Test edge cases and error states

## Future Improvements

1. Add TypeScript type definitions
2. Create Storybook documentation
3. Add more accessibility features
4. Implement theme customization
5. Add animation utilities
6. Create component playground 