import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from '../components/Auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    navigate('/'); // Redirect to home page after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Auth
          onLogin={handleLogin}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
} 