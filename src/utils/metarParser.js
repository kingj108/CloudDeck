export const parseMetar = (raw) => {
  if (!raw) return null;
  
  // Basic METAR format: 
  // KATL 052253Z 12008KT 10SM FEW250 24/12 A3008 RMK AO2 SLP185 T02390122
  const parts = raw.split(' ');
  
  try {
    // Parse cloud layers
    const cloudTypes = ['CLR', 'SKC', 'FEW', 'SCT', 'BKN', 'OVC'];
    const clouds = parts.filter(part => 
      cloudTypes.some(type => part.startsWith(type))
    ).map(cloud => {
      const coverage = cloud.slice(0, 3);
      const height = cloud.slice(3);
      return {
        coverage,
        base_feet_agl: height ? parseInt(height) * 100 : null
      };
    });

    return {
      station: parts[0],
      time: parts[1],
      wind: parts[2],
      visibility: parts[3],
      clouds: clouds,
      weather: parts.slice(4).join(' ')
    };
  } catch {
    return { raw };
  }
}; 