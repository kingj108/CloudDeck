import React from 'react';

export default function AviationBackground({ children }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Main background with responsive gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-sky-700 via-blue-600 to-indigo-800
        sm:bg-gradient-to-tr md:bg-gradient-to-r lg:bg-gradient-to-br
        transition-colors duration-500">
        
        {/* Overlay for depth and texture */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        
        {/* Static cloud-like pattern */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_80%)]"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 