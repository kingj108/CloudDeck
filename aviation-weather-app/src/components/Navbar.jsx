import { useState } from 'react';
import SearchForm from './SearchForm';

export default function Navbar({ 
  onSearch, 
  activeTab,
  setActiveTab,
  onOpenSettings,
  isLoggedIn,
  currentUser
}) {
  return (
    <nav className="bg-blue-900 py-2 px-4">
      <div className="container mx-auto max-w-4xl flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-6">
            <h1 className="text-xl font-light tracking-tight">
              <span className="font-bold text-blue-300">Cloud</span>
              <span className="font-extralight text-white">Deck</span>
            </h1>
          </div>
          <div className="flex space-x-1 ml-2">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'weather' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('weather')}
            >
              Weather
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('map')}
            >
              Weather Map
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'account' 
                  ? 'bg-white text-blue-900' 
                  : 'text-white hover:bg-blue-800'
              }`}
              onClick={() => setActiveTab('account')}
            >
              {isLoggedIn ? 'My Account' : 'Login'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <SearchForm onSearch={onSearch} />
          
          {/* Settings button */}
          <button 
            className="px-4 py-2 bg-blue-800 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={onOpenSettings}
          >
            Settings
          </button>
          
          {isLoggedIn && (
            <div className="text-white text-sm">
              <span className="bg-green-500 rounded-full w-2 h-2 inline-block mr-1"></span>
              {currentUser.name}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
