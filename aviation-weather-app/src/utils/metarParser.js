export const parseMetar = (raw) => {
  if (!raw) return null;
  
  // Basic METAR format: 
  // KATL 052253Z 12008KT 10SM FEW250 24/12 A3008 RMK AO2 SLP185 T02390122
  const parts = raw.split(' ');
  
  try {
    return {
      station: parts[0],
      time: parts[1],
      wind: parts[2],
      visibility: parts[3],
      weather: parts.slice(4).join(' ')
    };
  } catch {
    return { raw };
  }
};

export const parseTaf = (raw) => {
  if (!raw) return null;
  
  // Basic TAF format example:
  // KATL 052324Z 0523/0624 12008KT P6SM SCT250 FM052300 13010KT P6SM BKN250
  const lines = raw.split('\n');
  const header = lines[0].split(' ');
  
  try {
    return {
      station: header[0],
      issued: header[1],
      validPeriod: header[2],
      forecast: lines.slice(1).map(line => ({
        changeIndicator: line.includes('FM') ? 'FROM' : 
                         line.includes('TEMPO') ? 'TEMPORARY' : 'BECOMING',
        conditions: line
      }))
    };
  } catch {
    return { raw };
  }
};
