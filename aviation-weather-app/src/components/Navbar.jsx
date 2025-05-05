import { useState } from 'react';
import SearchForm from './SearchForm';

export default function Navbar({ 
  onSearch, 
  useMockData, 
  setUseMockData, 
  activeTab,
  setActiveTab,
  onOpenSettings,
  isLoggedIn,
  currentUser
}) {

  
  return (
    <nav className="navbar py-2 px-4">
      <div className="container mx-auto max-w-4xl flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-light tracking-tight mr-6">
            <span className="font-bold">Cloud</span>
            <span className="font-extralight">Deck</span>
          </h1>
          <div className="flex space-x-1 ml-2">
            <button
              className={`px-3 py-1 text-sm rounded-t transition-colors ${activeTab === 'weather' ? 'bg-white text-blue-800' : 'text-white hover:bg-blue-700'}`}
              onClick={() => setActiveTab('weather')}
            >
              Weather
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-t transition-colors ${activeTab === 'map' ? 'bg-white text-blue-800' : 'text-white hover:bg-blue-700'}`}
              onClick={() => setActiveTab('map')}
            >
              Weather Map
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-t transition-colors ${activeTab === 'account' ? 'bg-white text-blue-800' : 'text-white hover:bg-blue-700'}`}
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
              <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
              <span className="ml-2 text-sm font-medium text-white">Demo Data</span>
            </label>
          </div>
          
          {/* Settings button */}
          <button 
            onClick={onOpenSettings}
            className="ml-4 bg-blue-700 hover:bg-blue-800 text-white text-sm px-3 py-1 rounded"
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
