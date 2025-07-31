# Theme System Documentation

## Overview

CloudDeck implements a comprehensive theme system that provides dark and light mode support with smooth transitions and persistent user preferences. The system is built using React Context and Tailwind CSS with a class-based dark mode strategy.

## Architecture

### Theme Context (`ThemeContext.jsx`)

The theme system is built around a React Context that manages the global theme state:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### Theme Provider

The `ThemeProvider` component wraps the application and provides theme functionality:

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

## Usage

### Basic Theme Hook Usage

```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <button onClick={toggleDarkMode}>
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### Conditional Styling

```jsx
// Using conditional classes
<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>

// Using Tailwind's dark: modifier
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
```

## Color System

### Light Mode Colors

```css
/* Primary Colors */
--color-primary: #2563EB;      /* Blue */
--color-secondary: #6B7280;    /* Gray */
--color-success: #059669;      /* Green */
--color-warning: #D97706;      /* Orange */
--color-error: #DC2626;        /* Red */

/* Background Colors */
--color-bg-primary: #FFFFFF;   /* White */
--color-bg-secondary: #F3F4F6; /* Light Gray */
--color-bg-tertiary: #E5E7EB;  /* Lighter Gray */

/* Text Colors */
--color-text-primary: #111827; /* Dark Gray */
--color-text-secondary: #6B7280; /* Medium Gray */
--color-text-muted: #9CA3AF;   /* Light Gray */
```

### Dark Mode Colors

```css
/* Primary Colors */
--color-primary: #3B82F6;      /* Blue */
--color-secondary: #9CA3AF;    /* Gray */
--color-success: #10B981;      /* Green */
--color-warning: #F59E0B;      /* Orange */
--color-error: #EF4444;        /* Red */

/* Background Colors */
--color-bg-primary: #111827;   /* Dark Gray */
--color-bg-secondary: #1F2937; /* Medium Dark Gray */
--color-bg-tertiary: #374151;  /* Lighter Dark Gray */

/* Text Colors */
--color-text-primary: #F9FAFB; /* White */
--color-text-secondary: #D1D5DB; /* Light Gray */
--color-text-muted: #9CA3AF;   /* Medium Gray */
```

## Component Integration

### Aviation Background Component

The `AviationBackground` component demonstrates advanced theme integration:

```jsx
export default function AviationBackground({ children }) {
  const { darkMode } = useTheme();
  
  return (
    <div className="relative min-h-screen w-full">
      <div className={`fixed inset-0 transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-800'
      }`}>
        
        <div className={`absolute inset-0 bg-gradient-to-t ${
          darkMode ? 'from-black/40 to-transparent' : 'from-black/10 to-transparent'
        }`}></div>
        
        <div className={`absolute inset-0 ${
          darkMode ? 'opacity-10' : 'opacity-30'
        } bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_80%)]`}></div>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

### Settings Component

The settings component includes theme controls:

```jsx
export default function Settings({ onClose, clearFavorites, isPage = false }) {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Dark Mode</label>
        <button
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            darkMode ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );
}
```

## Tailwind Configuration

### Dark Mode Setup

The Tailwind configuration uses the `class` strategy for dark mode:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Use class strategy for toggle-able dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        sky: colors.sky,
        cyan: colors.cyan,
      },
    },
  },
  plugins: [],
};
```

### Custom Animations

The theme system includes custom animations for smooth transitions:

```css
/* Slide-in animation for theme transitions */
@keyframes slideInRight {
  0% { 
    transform: translateX(100%); 
    opacity: 0; 
  }
  100% { 
    transform: translateX(0); 
    opacity: 1; 
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out forwards;
}
```

## Best Practices

### 1. Consistent Theme Usage

```jsx
// Good: Use consistent theme patterns
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// Avoid: Inconsistent theme application
<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
```

### 2. Smooth Transitions

```jsx
// Add transition classes for smooth theme changes
<div className="bg-white dark:bg-gray-800 transition-colors duration-300">
```

### 3. Accessibility Considerations

```jsx
// Ensure proper contrast ratios
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
```

### 4. Component Isolation

```jsx
// Components should handle their own theming
function Card({ children }) {
  const { darkMode } = useTheme();
  
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
      {children}
    </div>
  );
}
```

## State Persistence

### Local Storage

Theme preferences are automatically saved to localStorage:

```javascript
// Save theme preference
localStorage.setItem('darkMode', JSON.stringify(darkMode));

// Load theme preference
const savedMode = localStorage.getItem('darkMode');
const initialDarkMode = savedMode ? JSON.parse(savedMode) : false;
```

### Session Persistence

Theme changes persist across browser sessions and page refreshes.

## Performance Considerations

### 1. Efficient Re-renders

The theme context is optimized to prevent unnecessary re-renders:

```jsx
// Use React.memo for components that don't need theme updates
const StaticComponent = React.memo(() => {
  return <div>Static content</div>;
});
```

### 2. CSS Transitions

Use CSS transitions instead of JavaScript animations for better performance:

```css
/* Efficient theme transitions */
.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## Future Enhancements

### 1. Custom Theme Support

```jsx
// Future: Support for custom themes
const themes = {
  light: { /* light theme colors */ },
  dark: { /* dark theme colors */ },
  aviation: { /* aviation-specific theme */ },
  highContrast: { /* accessibility theme */ }
};
```

### 2. System Theme Detection

```jsx
// Future: Auto-detect system theme preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

### 3. Theme Presets

```jsx
// Future: Predefined theme presets
const themePresets = {
  classic: { /* classic aviation theme */ },
  modern: { /* modern flat design */ },
  retro: { /* retro aviation theme */ }
};
```

## Troubleshooting

### Common Issues

1. **Theme not persisting**
   - Check localStorage permissions
   - Verify ThemeProvider is wrapping the app

2. **Inconsistent styling**
   - Ensure all components use theme classes
   - Check for hardcoded colors

3. **Performance issues**
   - Use CSS transitions instead of JavaScript
   - Implement proper memoization

### Debug Tools

```jsx
// Debug theme state
const { darkMode } = useTheme();
console.log('Current theme:', darkMode ? 'dark' : 'light');
``` 