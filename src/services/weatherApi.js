const result = {
  data: [{
    raw: rawMetar,
    station: {
      icao: icaoUpper,
      name: metarData.station?.name || icaoUpper
    },
    flight_category: parsedData.category || metarData.flight_category || determineFlightCategory(parsedData.visibility),
    temp: {
      celsius: parsedData.temp || metarData.temperature?.celsius || metarData.temp?.celsius || metarData.temp_c
    },
    wind: {
      degrees: parsedData.windDir || metarData.wind?.degrees || metarData.wind_direction?.value,
      speed_kts: parsedData.windSpeed || metarData.wind?.speed_kts || metarData.wind?.speed?.knots,
      gust_kts: parsedData.windGust || metarData.wind?.gust_kts || metarData.wind?.gust?.knots
    },
    visibility: {
      miles: parsedData.visibility || metarData.visibility?.miles || metarData.visibility?.miles_float
    },
    altimeter: {
      inHg: parsedData.altimeter || metarData.barometer?.inHg || metarData.altim_in_hg
    },
    timestamp: new Date().toISOString() // Use current time as fallback
  }]
}; 