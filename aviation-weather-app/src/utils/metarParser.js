//METAR Parser
export const parseMetar = (raw) => {
  if (!raw) return null;
  
  // Basic METAR format: 
  // KATL 052253Z 12008KT 10SM FEW250 24/12 A3008 RMK AO2 SLP185 T02390122
  const parts = raw.split(' ');
  
  try {
    // Parse cloud layers
    const cloudTypes = ['CLR', 'SKC', 'FEW', 'SCT', 'BKN', 'OVC'];
    const clouds = parts
      .filter(part => cloudTypes.some(type => part.startsWith(type)))
      .map(cloud => {
        if (cloud === 'CLR' || cloud === 'SKC') {
          return null;
        }
        const coverage = cloud.slice(0, 3);
        const height = parseInt(cloud.slice(3)) * 100;
        return {
          coverage,
          base_feet_agl: height
        };
      })
      .filter(cloud => cloud !== null);

    // Find visibility
    const visibilityPart = parts.find(part => part.endsWith('SM'));
    const visibility = visibilityPart ? parseFloat(visibilityPart.replace('SM', '')) : null;

    // Find altimeter setting - improved parsing with fixed decimal places
    const altimeterPart = parts.find(part => /^A\d{4}$/.test(part));
    const altimeter = altimeterPart ? 
      Number((parseInt(altimeterPart.substring(1)) / 100).toFixed(2)) : 
      null;

    // Find temperature/dewpoint
    const tempPart = parts.find(part => /^[M]?\d{2}\/[M]?\d{2}$/.test(part));
    let temp = null;
    let dewpoint = null;
    if (tempPart) {
      const [tempStr, dewStr] = tempPart.split('/');
      temp = parseInt(tempStr.replace('M', '-'));
      dewpoint = parseInt(dewStr.replace('M', '-'));
    }

    return {
      station: parts[0],
      time: parts[1],
      wind: parts[2],
      visibility: visibility,
      clouds: clouds,
      altimeter: altimeter,
      temp: temp,
      dewpoint: dewpoint,
      weather: parts.slice(4).join(' ')
    };
  } catch (error) {
    console.error('Error parsing METAR:', error);
    return { raw };
  }
};

// Helper function to parse TAF time periods
const parseTafTimePeriod = (timeStr) => {
  if (!timeStr) return null;
  
  // Format: DDhh/DDhh (e.g., 1520/1624)
  const [start, end] = timeStr.split('/');
  if (!start || !end) return null;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Parse start time
  const startDay = parseInt(start.slice(0, 2));
  const startHour = parseInt(start.slice(2, 4));
  const startDate = new Date(Date.UTC(currentYear, currentMonth, startDay, startHour, 0, 0));
  
  // Parse end time
  const endDay = parseInt(end.slice(0, 2));
  const endHour = parseInt(end.slice(2, 4));
  const endDate = new Date(Date.UTC(currentYear, currentMonth, endDay, endHour, 0, 0));
  
  // If end date is before start date, it's in the next month
  if (endDate < startDate) {
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  }
  
  return {
    start: startDate,
    end: endDate
  };
};

// Helper function to parse issuance time (Z time)
const parseIssuanceTime = (timeStr) => {
  if (!timeStr || !timeStr.endsWith('Z')) return null;
  
  // Format: DDhhmmZ (e.g., 152055Z)
  const day = parseInt(timeStr.slice(0, 2));
  const hour = parseInt(timeStr.slice(2, 4));
  const minute = parseInt(timeStr.slice(4, 6));
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  return new Date(Date.UTC(currentYear, currentMonth, day, hour, minute, 0));
};

// Helper function to parse TAF change indicators with exact dates
const parseTafChangeIndicator = (line, baseDate) => {
  // Extract FM time indicator (e.g., FM160100)
  const fmMatch = line.match(/FM(\d{6})/);
  if (fmMatch) {
    const timeStr = fmMatch[1];
    const day = parseInt(timeStr.slice(0, 2));
    const hour = parseInt(timeStr.slice(2, 4));
    const minute = parseInt(timeStr.slice(4, 6));
    
    // Use the current year and month as the base
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const changeTime = new Date(Date.UTC(
      currentYear,
      currentMonth,
      day,
      hour,
      minute,
      0
    ));
    
    // If baseDate is provided and changeTime is before it, it might be for next month
    if (baseDate && changeTime < baseDate) {
      changeTime.setUTCMonth(changeTime.getUTCMonth() + 1);
    }
    
    return {
      type: 'FROM',
      time: changeTime
    };
  }
  
  // Handle other change indicators
  const changeTypes = {
    'TEMPO': 'TEMPORARY',
    'BECMG': 'BECOMING',
    'PROB': 'PROBABILITY'
  };
  
  for (const [code, type] of Object.entries(changeTypes)) {
    if (line.includes(code)) {
      // Extract time if present (e.g., TEMPO 0523/0602)
      const timeMatch = line.match(new RegExp(`${code}\\s+(\\d{4})/(\\d{4})`));
      if (timeMatch) {
        const startStr = timeMatch[1];
        const endStr = timeMatch[2];
        
        const startDay = parseInt(startStr.slice(0, 2));
        const startHour = parseInt(startStr.slice(2, 4));
        
        const endDay = parseInt(endStr.slice(0, 2));
        const endHour = parseInt(endStr.slice(2, 4));
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        const startTime = new Date(Date.UTC(
          currentYear,
          currentMonth,
          startDay,
          startHour,
          0,
          0
        ));
        
        const endTime = new Date(Date.UTC(
          currentYear,
          currentMonth,
          endDay,
          endHour,
          0,
          0
        ));
        
        // If end time is before start time, it's likely in the next month
        if (endTime < startTime) {
          endTime.setUTCMonth(endTime.getUTCMonth() + 1);
        }
        
        return {
          type,
          time: startTime,
          endTime
        };
      }
      return { type };
    }
  }
  
  return { type: 'INITIAL' };
};

// Helper function to parse wind information
const parseWind = (windStr) => {
  if (!windStr) return null;
  
  // Handle variable wind format (VRBssKT)
  if (windStr.startsWith('VRB')) {
    const speedMatch = windStr.match(/VRB(\d{2,3})(?:G(\d{2,3}))?KT/);
    if (speedMatch) {
      return {
        direction: 'VRB',
        degrees: null,
        speed_kts: parseInt(speedMatch[1]),
        gust_kts: speedMatch[2] ? parseInt(speedMatch[2]) : null
      };
    }
    return null;
  }
  
  // Format: dddssKT or dddssGssKT (e.g., 24010KT or 24010G18KT)
  const windMatch = windStr.match(/^(\d{3})(\d{2,3})(?:G(\d{2,3}))?KT$/);
  if (!windMatch) return null;
  
  return {
    direction: null,
    degrees: parseInt(windMatch[1]),
    speed_kts: parseInt(windMatch[2]),
    gust_kts: windMatch[3] ? parseInt(windMatch[3]) : null
  };
};

// Helper function to parse visibility
const parseVisibility = (visStr) => {
  if (!visStr) return null;
  
  // Handle P6SM format
  if (visStr.startsWith('P')) {
    return {
      miles: 10,
      isPlus: true
    };
  }
  
  // Handle regular visibility (e.g., 6SM)
  const visMatch = visStr.match(/^(\d+)(?:SM)?$/);
  if (visMatch) {
    return {
      miles: parseInt(visMatch[1]),
      isPlus: false
    };
  }
  
  return null;
};

// Helper function to parse clouds
const parseClouds = (parts) => {
  const cloudTypes = ['FEW', 'SCT', 'BKN', 'OVC'];
  return parts
    .filter(part => cloudTypes.some(type => part.startsWith(type)))
    .map(cloud => {
      const coverage = cloud.slice(0, 3);
      const height = parseInt(cloud.slice(3)) * 100;
      return {
        coverage,
        base_feet_agl: height
      };
    });
};

// Helper function to parse flight category
const parseFlightCategory = (visibility, clouds) => {
  // Extract the ceiling (lowest broken or overcast layer)
  let ceiling = null;
  if (clouds && clouds.length > 0) {
    const significantClouds = clouds.filter(cloud => 
      cloud.coverage === 'BKN' || cloud.coverage === 'OVC'
    );
    
    if (significantClouds.length > 0) {
      significantClouds.sort((a, b) => a.base_feet_agl - b.base_feet_agl);
      ceiling = significantClouds[0].base_feet_agl;
    }
  }

  const visibilityValue = visibility?.miles || 0;

  if ((ceiling !== null && ceiling < 500) || visibilityValue < 1) {
    return 'LIFR';
  }
  if ((ceiling !== null && ceiling >= 500 && ceiling < 1000) || 
      (visibilityValue >= 1 && visibilityValue < 3)) {
    return 'IFR';
  }
  if ((ceiling !== null && ceiling >= 1000 && ceiling <= 3000) || 
      (visibilityValue >= 3 && visibilityValue <= 5)) {
    return 'MVFR';
  }
  return 'VFR';
};

// Helper function to parse TAF conditions
const parseTafConditions = (line) => {
  const parts = line.split(' ');
  const result = {
    wind: null,
    visibility: null,
    clouds: [],
    flight_category: null
  };

  // Find wind
  const windPart = parts.find(part => part.endsWith('KT'));
  if (windPart) {
    result.wind = parseWind(windPart);
  }

  // Find visibility
  const visPart = parts.find(part => part.endsWith('SM') || part.startsWith('P'));
  if (visPart) {
    result.visibility = parseVisibility(visPart);
  }

  // Find clouds
  result.clouds = parseClouds(parts);

  // Determine flight category
  result.flight_category = parseFlightCategory(result.visibility, result.clouds);

  return result;
};

//TAF Parser
export const parseTaf = (raw) => {
  if (!raw) return null;
  
  try {
    // Basic TAF format example:
    // KLAX 152055Z 1521/1624 25012KT P6SM SKC FM160400 25006KT P6SM SCT015 FM160700 VRB03KT P6SM OVC012
    const lines = raw.split('\n');
    const fullText = lines.join(' ');
    
    // Extract header information
    const headerMatch = fullText.match(/^(\w+)\s+(\d{6}Z)\s+(\d{4}\/\d{4})/);
    if (!headerMatch) {
      console.error('Invalid TAF format');
      return { raw };
    }
    
    const station = headerMatch[1];
    const issuedRaw = headerMatch[2];
    const validPeriodRaw = headerMatch[3];
    
    // Parse issued time and valid period
    const issuedTime = parseIssuanceTime(issuedRaw);
    const validPeriodTimes = parseTafTimePeriod(validPeriodRaw);
    
    // Find all FROM (FM) indicators
    const fmIndices = [];
    const fmMatches = [...fullText.matchAll(/FM\d{6}/g)];
    fmMatches.forEach(match => {
      fmIndices.push(match.index);
    });
    
    // Split the TAF into forecast periods
    const periods = [];
    
    // Extract the initial conditions (from valid period until first FM)
    let initialConditionsText = '';
    const validPeriodIndex = fullText.indexOf(validPeriodRaw);
    if (validPeriodIndex > 0) {
      const endIndex = fmIndices.length > 0 ? fmIndices[0] : fullText.length;
      initialConditionsText = fullText.substring(
        validPeriodIndex + validPeriodRaw.length, 
        endIndex
      ).trim();
    }
    
    // Parse initial conditions if available
    if (initialConditionsText) {
      const initialConditions = parseTafConditions(initialConditionsText);
      periods.push({
        changeIndicator: 'INITIAL',
        changeTime: validPeriodTimes?.start,
        rawText: initialConditionsText,
        wind: initialConditions.wind,
        visibility: initialConditions.visibility,
        clouds: initialConditions.clouds,
        flight_category: initialConditions.flight_category
      });
    }
    
    // Extract and parse each FM period
    for (let i = 0; i < fmIndices.length; i++) {
      const startIndex = fmIndices[i];
      const endIndex = i < fmIndices.length - 1 ? fmIndices[i + 1] : fullText.length;
      const periodText = fullText.substring(startIndex, endIndex).trim();
      
      // Parse change indicator
      const changeInfo = parseTafChangeIndicator(
        periodText, 
        validPeriodTimes?.start
      );
      
      // Parse conditions
      const conditions = parseTafConditions(periodText);
      
      periods.push({
        changeIndicator: changeInfo.type,
        changeTime: changeInfo.time,
        endTime: changeInfo.endTime,
        rawText: periodText,
        wind: conditions.wind,
        visibility: conditions.visibility,
        clouds: conditions.clouds,
        flight_category: conditions.flight_category
      });
    }
    
    return {
      station,
      issued: issuedRaw,
      issuedTime,
      validPeriod: validPeriodRaw,
      validPeriodTimes,
      forecast: periods
    };
  } catch (error) {
    console.error('Error parsing TAF:', error);
    return { raw };
  }
};
