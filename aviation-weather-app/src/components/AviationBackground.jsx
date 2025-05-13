import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AviationBackground({ children }) {
  const { darkMode } = useTheme();
  
  return (
    <div className="relative min-h-screen w-full">
      {/* Main background with responsive gradients - changes based on mode */}
      <div className={`fixed inset-0 transition-colors duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-800'
      }
        sm:bg-gradient-to-tr md:bg-gradient-to-r lg:bg-gradient-to-br`}>
        
        {/* Overlay for depth and texture */}
        <div className={`absolute inset-0 bg-gradient-to-t ${
          darkMode ? 'from-black/40 to-transparent' : 'from-black/10 to-transparent'
        }`}></div>
        
        {/* Static cloud-like pattern */}
        <div className={`absolute inset-0 ${
          darkMode ? 'opacity-10' : 'opacity-30'
        } bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_80%)]`}></div>
      </div>

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 