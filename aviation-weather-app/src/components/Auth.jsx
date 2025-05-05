import { useState } from 'react';

export default function Auth({ onLogin, onLogout, isLoggedIn, currentUser }) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // In a real app, this would call an authentication API
    // For demo purposes, we'll simulate a successful login/registration
    if (isRegistering) {
      // Simulate registration
      onLogin({ email, id: Date.now(), name: email.split('@')[0] });
      setShowLoginForm(false);
    } else {
      // Simulate login
      onLogin({ email, id: Date.now(), name: email.split('@')[0] });
      setShowLoginForm(false);
    }
  };

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setError('');
  };

  const handleLogout = () => {
    onLogout();
    setEmail('');
    setPassword('');
  };

  if (isLoggedIn) {
    return (
      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Welcome, {currentUser.name}</h2>
            <p className="text-sm text-gray-600">{currentUser.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-700">
          Your favorites are now being saved to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow">
      {!showLoginForm ? (
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Log in or create an account to save your favorite airports across devices.
          </p>
          <button 
            onClick={toggleForm}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Log In / Register
          </button>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isRegistering ? 'Create Account' : 'Log In'}
            </h2>
            <button 
              onClick={toggleForm}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isRegistering ? 'Register' : 'Log In'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isRegistering 
                ? 'Already have an account? Log in' 
                : 'Need an account? Register'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
