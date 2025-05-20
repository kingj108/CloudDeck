# Weather Parser Documentation

## Overview

The CloudDeck weather parser is a comprehensive utility for parsing aviation weather reports, specifically METAR (Meteorological Aerodrome Report) and TAF (Terminal Aerodrome Forecast) data. This document provides technical details about the parser implementation, its capabilities, and usage.

## METAR Parser

### Function: `parseMetar(raw)`

Parses raw METAR text into a structured JavaScript object.

#### Input
- `raw` (string): Raw METAR text

#### Output
Returns a structured object with the following properties:
- `station` (string): ICAO station identifier
- `time` (string): Observation time in Zulu
- `wind` (string): Wind information
- `visibility` (number): Visibility in statute miles
- `clouds` (array): Array of cloud layer objects
  - `coverage` (string): Cloud coverage (FEW, SCT, BKN, OVC)
  - `base_feet_agl` (number): Cloud base height in feet AGL
- `altimeter` (number): Altimeter setting in inches of mercury
- `temp` (number): Temperature in Celsius
- `dewpoint` (number): Dewpoint in Celsius
- `weather` (string): Additional weather phenomena

#### Example
```javascript
const rawMetar = "KATL 052253Z 12008KT 10SM FEW250 24/12 A3008 RMK AO2 SLP185 T02390122";
const parsed = parseMetar(rawMetar);
```

## TAF Parser

### Function: `parseTaf(raw)`

Parses raw TAF text into a structured JavaScript object.

#### Input
- `raw` (string): Raw TAF text

#### Output
Returns a structured object with the following properties:
- `station` (string): ICAO station identifier
- `issued` (string): Issuance time in Zulu
- `issuedTime` (Date): Parsed issuance time as Date object
- `validPeriod` (string): Valid period (e.g., "0523/0624")
- `validPeriodTimes` (object): Parsed valid period times
  - `start` (Date): Start time
  - `end` (Date): End time
- `forecast` (array): Array of forecast period objects
  - `changeIndicator` (string): Type of change (INITIAL, FROM, TEMPORARY, BECOMING)
  - `changeTime` (Date): Time of change
  - `endTime` (Date): End time of period
  - `rawText` (string): Raw text for the period
  - `wind` (object): Wind information
  - `visibility` (object): Visibility information
  - `clouds` (array): Cloud layers
  - `flight_category` (string): Flight category (VFR, MVFR, IFR, LIFR)

#### Example
```javascript
const rawTaf = "KLAX 152055Z 1521/1624 25012KT P6SM SKC FM160400 25006KT P6SM SCT015";
const parsed = parseTaf(rawTaf);
```

## Helper Functions

### Cloud Layer Parsing
```javascript
const parseCloudLayer = (cloudString) => {
  // Returns { coverage, base_feet_agl }
}
```

### Wind Parsing
```javascript
const parseWind = (windStr) => {
  // Returns { direction, degrees, speed_kts, gust_kts }
}
```

### Visibility Parsing
```javascript
const parseVisibility = (visStr) => {
  // Returns { miles, isPlus }
}
```

### Flight Category Determination
```javascript
const parseFlightCategory = (visibility, clouds) => {
  // Returns 'VFR', 'MVFR', 'IFR', or 'LIFR'
}
```

## Error Handling

Both parsers include robust error handling:
- Returns `null` if input is empty or invalid
- Returns `{ raw }` object if parsing fails
- Logs errors to console for debugging

## Integration with Weather API

The parser is integrated with the weather API service (`weatherApi.js`), which:
- Fetches raw weather data from external sources
- Parses the data using these parser functions
- Caches results for 5 minutes
- Returns structured data for display

## Usage in Components

The parsed weather data is used in various components:
- `WeatherDisplay.jsx`: Main component for displaying weather information
- `FlightCategoryIndicator.jsx`: Visual indicator for flight categories
- Other components that need weather data

## Best Practices

1. Always validate raw input before parsing
2. Handle parsing errors gracefully
3. Use the structured output for consistent data access
4. Consider caching parsed results for performance
5. Update parsers when new weather report formats are introduced

## Future Improvements

Potential enhancements for the weather parser:
- Support for additional weather phenomena
- Enhanced error reporting
- Support for international weather formats
- Performance optimizations for large datasets
- Additional validation and data quality checks 