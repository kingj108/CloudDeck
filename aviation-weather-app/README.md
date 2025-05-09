# CloudDeck - Aviation Weather Application

CloudDeck is a modern web application designed to provide pilots and aviation enthusiasts with accurate, real-time weather information and flight planning tools.

## 🚀 Features

- **Weather Information**
  - Real-time weather data
  - METAR/TAF reports
  - Weather radar visualization
  - Wind conditions and forecasts

- **Authentication System**
  - Email/password authentication
  - Google Sign-In (coming soon)
  - Secure password requirements
  - User profile management

- **Coming Soon**
  - Flight planning tools
  - Mobile optimization
  - Community features
  - Professional weather briefing
  - Safety enhancements
  - Analytics and reporting
  - Educational resources

## 🛠️ Technical Stack

- Frontend: React + Vite
- Styling: Tailwind CSS
- Authentication: Custom implementation with future Google OAuth
- Testing: Jest
- Deployment: Netlify

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CloudDeck.git
   cd CloudDeck/aviation-weather-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm install concurrently # Required for development
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_API_KEY=your_api_key
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
aviation-weather-app/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── utils/         # Utility functions
│   └── App.jsx        # Main application component
├── public/            # Static assets
├── dist/             # Production build
└── config files      # Configuration files
```

## 🔒 Authentication

The application uses a secure authentication system with the following features:
- Email/password authentication
- Password requirements:
  - Minimum 6 characters
  - At least one uppercase letter
  - At least one number
- Password confirmation
- Error handling and validation
- Google Sign-In (implementation in progress)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Testing

Run the test suite:
```bash
npm run test
```

## 📦 Deployment

The application is configured for deployment on Netlify. The `netlify.toml` file contains the necessary deployment configurations.

## 🔑 API Keys

The application requires several API keys for full functionality:
- Weather API key
- Google OAuth credentials (coming soon)

Contact the project maintainers for access to development API keys.

## 📚 Additional Resources

- [Weather API Documentation](link-to-docs)
- [Contributing Guidelines](link-to-contributing)
- [Code of Conduct](link-to-code-of-conduct)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact [support email].

---

Made with ❤️ by the CloudDeck team
