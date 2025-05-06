# CloudDeck
CloudDeck is a web app that provides real-time METARs, TAFs, and airport weather data. Built for pilots and aviation enthusiasts, it lets users search by airport code to view current conditions and forecasts in a clean, responsive interface.

![CloudDeckBanner](https://github.com/user-attachments/assets/608db1b1-1a2b-4369-a048-43c2b544b7b8)

CloudDeck is a modern web application that provides real-time aviation weather data for airports worldwide. Designed with pilots, dispatchers, and aviation enthusiasts in mind, it delivers up-to-date METARs, TAFs, and a visual weather map, all wrapped in a responsive and intuitive interface.

🌐 Features
🔍 Search by ICAO Code – Instantly look up live METAR and TAF reports for any airport.

🌤️ Live Weather Data – Real-time aviation weather from trusted APIs.

💾 Favorite Airports – Save frequently checked airports for quick access.

🗺️ Weather Map View – Visualize current airport weather conditions.

🧪 Mock Data Mode – Toggle mock data for testing or demo purposes.

📱 Fully Responsive – Seamless experience on mobile, tablet, and desktop.

🧰 Tech Stack
Frontend: React, Tailwind CSS

API Integration: Custom weatherApi service for METAR and TAF data

Component-Based Design: Clean and reusable components (Navbar, WeatherDisplay, WeatherMap, etc.)

🚀 Getting Started
Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/clouddeck.git
cd clouddeck
Install dependencies:

bash
Copy
Edit
npm install
Start the app:

bash
Copy
Edit
npm run dev
Visit http://localhost:5173 in your browser.

📁 Folder Structure
bash
Copy
Edit
.
├── components/           # Reusable UI components
├── services/             # API calls (METAR, TAF, mock toggling)
├── assets/               # Logo, images, favicon
├── App.jsx               # Main application logic and layout
├── index.html            # Root HTML
└── main.jsx              # Entry point
🧪 Mock Data
You can toggle mock data in the UI for demo/testing purposes. This is useful when the API is down or rate-limited.

📸 Social Preview

📄 License
MIT License — feel free to fork, build, and fly with it 🚁

Let me know if you'd like the README exported to a .md file or want to add contributor info, a changelog, or deploy instructions (e.g. Vercel, Netlify).







