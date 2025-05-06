import { useState } from 'react';
import SearchForm from './SearchForm';

export default function Navbar({ 
  onSearch, 
  activeTab,
  setActiveTab,
  onOpenSettings,
  isLoggedIn,
  currentUser,
  useMockData,
  setUseMockData
}) {
  
  const navButtonStyle = {
    backgroundColor: '#002366', // Dark navy blue
    color: 'white',
    border: '1px solid white',
    padding: '8px 20px',
    borderRadius: '4px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#003399', // Slightly lighter blue on hover
    }
  };

  return (
    <nav className="navbar py-2 px-4">
      <div className="container mx-auto max-w-4xl flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-6">
            <h1 className="text-xl font-light tracking-tight">
              <span className="font-bold text-blue-500">Cloud</span>
              <span className="font-extralight text-white">Deck</span>
            </h1>
          </div>
          <div className="flex space-x-1 ml-2">
            <button
              style={{
                ...navButtonStyle,
                backgroundColor: activeTab === 'weather' ? 'white' : '#002366',
                color: activeTab === 'weather' ? '#002366' : 'white'
              }}
              onClick={() => setActiveTab('weather')}
            >
              Weather
            </button>
            <button
              style={{
                ...navButtonStyle,
                backgroundColor: activeTab === 'map' ? 'white' : '#002366',
                color: activeTab === 'map' ? '#002366' : 'white'
              }}
              onClick={() => setActiveTab('map')}
            >
              Weather Map
            </button>
            <button
              style={{
                ...navButtonStyle,
                backgroundColor: activeTab === 'account' ? 'white' : '#002366',
                color: activeTab === 'account' ? '#002366' : 'white'
              }}
              onClick={() => setActiveTab('account')}
            >
              {isLoggedIn ? 'My Account' : 'Login'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <SearchForm onSearch={onSearch} />
          
          <div className="ml-4">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={useMockData}
                onChange={() => setUseMockData(!useMockData)}
              />
              <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              <span className="ml-2 text-sm font-medium text-white">Demo Data</span>
            </label>
          </div>
          
          {/* Settings button */}
          <button 
            style={navButtonStyle}
            onClick={onOpenSettings}
          >
            Settings
          </button>
          
          {isLoggedIn && (
            <div className="ml-3 text-white text-sm">
              <span className="bg-green-500 rounded-full w-2 h-2 inline-block mr-1"></span>
              {currentUser.name}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
