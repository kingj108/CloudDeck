import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function GoogleSignIn({ onSuccess, onError }) {
  const [isConfigured] = useState(!!import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      // Get user info using the access token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenResponse.access_token}`
        }
      })
      .then(response => response.json())
      .then(userInfo => {
        onSuccess({
          email: userInfo.email,
          name: userInfo.name,
          id: userInfo.sub,
          picture: userInfo.picture
        });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        onError(error);
      });
    },
    onError: error => {
      console.error('Google Login Error:', error);
      onError(error);
    }
  });

  const handleClick = () => {
    if (!isConfigured) {
      onError(new Error('Google Sign-In is not configured. Please set up VITE_GOOGLE_CLIENT_ID.'));
      return;
    }
    login();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium ${
        isConfigured ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'
      }`}
      disabled={!isConfigured}
      title={!isConfigured ? 'Google Sign-In is not configured' : ''}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        className="w-5 h-5 mr-2"
      />
      Continue with Google
      {!isConfigured && <span className="ml-2 text-xs">(Not Configured)</span>}
    </button>
  );
} 