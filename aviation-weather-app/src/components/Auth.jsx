import { useState } from 'react';
import GoogleSignIn from './GoogleSignIn';

export default function Auth({ onLogin, onLogout, isLoggedIn, currentUser }) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const validatePassword = (pass) => {
    const hasMinLength = pass.length >= 6;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return hasMinLength && hasUpperCase && hasNumber;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (isRegistering) {
      // Validate password requirements
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters long, contain at least one uppercase letter and one number');
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
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

  const handleGoogleSuccess = (userData) => {
    onLogin(userData);
    setShowLoginForm(false);
  };

  const handleGoogleError = (error) => {
    setError('Failed to sign in with Google. Please try again.');
    console.error('Google Sign-In Error:', error);
  };

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    onLogout();
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  if (isLoggedIn) {
    return (
      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {currentUser.picture && (
              <img
                src={currentUser.picture}
                alt="Profile"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold">Welcome, {currentUser.name}</h2>
              <p className="text-sm text-gray-600">{currentUser.email}</p>
            </div>
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
      <div className="mb-6 flex justify-center pt-4">
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-light tracking-tight">
              <span className="font-bold">Cloud</span>
              <span className="font-extralight">Deck</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Aviation Weather Platform</p>
          </div>
        </div>
      </div>
      {!showLoginForm ? (
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4 text-center">Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            Log in or create an account to save your favorite airports across devices.
          </p>
          <div className="space-y-3">
            <GoogleSignIn
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            <button 
              onClick={toggleForm}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Continue with Email
            </button>
          </div>
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
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          
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
              {isRegistering && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long, contain at least one uppercase letter and one number
                </p>
              )}
            </div>
            {isRegistering && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isRegistering ? 'Register' : 'Log In'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
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
