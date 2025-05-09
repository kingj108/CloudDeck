# API Reference

## Authentication API

### User Registration
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "email": string,
  "password": string,
  "confirmPassword": string
}

Response:
{
  "userId": string,
  "token": string,
  "message": string
}
```

### User Login
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": string,
  "password": string
}

Response:
{
  "token": string,
  "user": {
    "id": string,
    "email": string,
    "preferences": object
  }
}
```

## Weather API

### METAR Data
```
GET /api/weather/metar/{station}

Response:
{
  "raw": string,
  "station": string,
  "time": string,
  "wind": {
    "direction": number,
    "speed": number,
    "gust": number
  },
  "visibility": number,
  "conditions": array,
  "temperature": number,
  "dewpoint": number,
  "pressure": number
}
```

### TAF Forecast
```
GET /api/weather/taf/{station}

Response:
{
  "raw": string,
  "station": string,
  "forecasts": [
    {
      "time": string,
      "wind": object,
      "visibility": number,
      "conditions": array
    }
  ]
}
```

### Radar Data
```
GET /api/weather/radar/{coordinates}

Parameters:
- coordinates: string (lat,lon)
- range: number (optional)
- type: string (optional)

Response:
{
  "timestamp": string,
  "data": array,
  "metadata": object
}
```

## User Preferences API

### Get User Preferences
```
GET /api/user/preferences
Authorization: Bearer {token}

Response:
{
  "units": string,
  "defaultLocation": string,
  "alerts": object,
  "displayOptions": object
}
```

### Update Preferences
```
PUT /api/user/preferences
Authorization: Bearer {token}

Request:
{
  "units": string,
  "defaultLocation": string,
  "alerts": object,
  "displayOptions": object
}

Response:
{
  "message": string,
  "preferences": object
}
```

## Error Responses

### Standard Error Format
```
{
  "error": {
    "code": string,
    "message": string,
    "details": object (optional)
  }
}
```

### Common Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Weather data: 60 requests per minute
- User preferences: 30 requests per minute

## WebSocket API

### Weather Updates
```
WebSocket: ws://api.clouddeck.com/weather

Events:
- weather.update
- radar.update
- alerts.new
```

## API Versioning

Current version: v1
Base URL: `https://api.clouddeck.com/v1`

### Version Headers
```
Accept: application/vnd.clouddeck.v1+json
```

## Authentication

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Access tokens: 1 hour
- Refresh tokens: 7 days

## Data Formats

### Timestamps
- All timestamps in ISO 8601 format
- UTC timezone unless specified

### Units
- Temperature: Celsius
- Wind speed: Knots
- Visibility: Statute miles
- Pressure: hPa 