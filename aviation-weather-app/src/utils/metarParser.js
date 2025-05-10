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
