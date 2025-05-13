import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import AviationBackground from '../components/AviationBackground';

export default function GlossaryPage() {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  
  // Aviation weather glossary data
  const glossaryTerms = [
    { term: 'METAR', definition: 'METeorological Aerodrome Report - A routine weather report issued at hourly or half-hourly intervals. It is a description of the meteorological elements observed at an airport at a specific time.' },
    { term: 'TAF', definition: 'Terminal Aerodrome Forecast - A concise statement of the expected meteorological conditions at an airport during a specified period (usually 24 hours).' },
    { term: 'BKN', definition: 'Broken - Cloud coverage of 5/8 to 7/8 of the sky (51-87%).' },
    { term: 'SCT', definition: 'Scattered - Cloud coverage of 3/8 to 4/8 of the sky (38-50%).' },
    { term: 'OVC', definition: 'Overcast - Cloud coverage of 8/8 of the sky (100%).' },
    { term: 'FEW', definition: 'Few - Cloud coverage of 1/8 to 2/8 of the sky (12-25%).' },
    { term: 'SKC', definition: 'Sky Clear - No clouds present.' },
    { term: 'CLR', definition: 'Clear - No clouds below 12,000 feet (automated stations).' },
    { term: 'VFR', definition: 'Visual Flight Rules - Basic weather minimums for flying under visual flight rules, typically visibility greater than 5 miles and ceiling greater than 3,000 feet.' },
    { term: 'MVFR', definition: 'Marginal Visual Flight Rules - Weather conditions that are close to, but still meet, the minimums for VFR flight.' },
    { term: 'IFR', definition: 'Instrument Flight Rules - Weather conditions that require pilots to fly primarily by reference to instruments, typically visibility less than 3 miles or ceiling less than 1,000 feet.' },
    { term: 'LIFR', definition: 'Low Instrument Flight Rules - Weather conditions with very low ceilings (below 500 feet) and/or very low visibility (less than 1 mile).' },
    { term: 'BR', definition: 'Mist - Visibility of at least 5/8 statute miles, but not more than 6 statute miles.' },
    { term: 'FG', definition: 'Fog - Visibility less than 5/8 statute miles.' },
    { term: 'RA', definition: 'Rain - Liquid precipitation that falls as water drops from clouds.' },
    { term: 'SN', definition: 'Snow - Frozen precipitation in the form of white or translucent ice crystals.' },
    { term: 'DZ', definition: 'Drizzle - Very small water drops, smaller than rain drops, that fall from stratus clouds.' },
    { term: 'TS', definition: 'Thunderstorm - A local storm produced by a cumulonimbus cloud and accompanied by lightning and thunder.' },
    { term: 'SH', definition: 'Shower - Precipitation that is characterized by the suddenness with which it starts and stops, by the rapid changes of intensity, and usually by rapid changes in the appearance of the sky.' },
    { term: 'GR', definition: 'Hail - Precipitation in the form of balls or irregular lumps of ice, always produced by convective clouds.' },
    { term: 'IC', definition: 'Ice Crystals - Tiny, unbranched ice crystals in the form of needles, columns, or plates; or in-cloud lightning.' },
    { term: 'PL', definition: 'Ice Pellets - Precipitation consisting of transparent or translucent pellets of ice.' },
    { term: 'GS', definition: 'Small Hail and/or Snow Pellets - Precipitation consisting of white, opaque grains of ice.' },
    { term: 'TEMPO', definition: 'Temporary - Temporary fluctuations in weather conditions expected to last less than an hour at a time, and in total, less than half of the forecast period.' },
    { term: 'PROB', definition: 'Probability - Used to indicate the probability of occurrence of an element, followed by a percentage.' },
    { term: 'BECMG', definition: 'Becoming - A permanent change in meteorological conditions expected to reach the specified threshold values at either a regular or irregular rate.' },
    { term: 'FM', definition: 'From - Used to indicate a complete and sustained change in the forecast weather.' },
    { term: 'CAVOK', definition: 'Ceiling And Visibility OK - Visibility is 10 km or more, no cloud below 5,000 ft or below the minimum sector altitude and no cumulonimbus or towering cumulus at any level, and no weather of significance.' },
    { term: 'SPECI', definition: 'Special Report - A special weather report issued when significant changes in airport weather conditions occur off the hourly schedule.' },
    { term: 'ATIS', definition: 'Automatic Terminal Information Service - Continuous broadcast of recorded information on a specific frequency containing essential operational information for arriving and departing aircraft.' },
    { term: 'QNH', definition: 'Altimeter setting that will cause the altimeter to read airfield elevation when on the airfield. In the US, this is given in inches of mercury (inHg).' },
    { term: 'KT', definition: 'Knots - Unit of speed equal to one nautical mile per hour.' },
    { term: 'CB', definition: 'Cumulonimbus - A principal cloud type in the form of a dense tower, often with an anvil top. Associated with thunderstorms and potentially severe turbulence, icing, and wind shear.' },
    { term: 'TCU', definition: 'Towering Cumulus - A rapidly growing cumulus cloud with considerable vertical development.' },
    { term: 'NSW', definition: 'No Significant Weather - Used in TAFs to indicate that no significant weather phenomena are expected during a specific time period.' },
    { term: 'RVR', definition: 'Runway Visual Range - The maximum distance in the direction of takeoff or landing at which the runway or specified lights or markers can be seen from a position above a specified point on its center line.' },
    { term: 'WS', definition: 'Wind Shear - A change in wind speed and/or direction over a short distance.' },
    { term: 'RMK', definition: 'Remarks - The section of a METAR where additional information is added.' },
    { term: 'TWRINC', definition: 'Tower In Clouds - The control tower is in the clouds, indicating very low ceiling conditions.' },
    { term: 'CIG', definition: 'Ceiling - The height of the lowest layer of clouds above the ground that is broken or overcast.' },
    { term: 'VIS', definition: 'Visibility - The greatest horizontal distance at which select objects can be seen and identified.' },
    { term: 'SLP', definition: 'Sea Level Pressure - Atmospheric pressure at mean sea level.' },
    { term: 'FROPA', definition: 'Frontal Passage - Indicates that a frontal passage is occurring at the station.' },
    { term: 'AO1', definition: 'Automated Station without Precipitation Discriminator - An automated weather reporting station that cannot determine the type of precipitation.' },
    { term: 'AO2', definition: 'Automated Station with Precipitation Discriminator - An automated weather reporting station that can determine the type of precipitation.' },
    { term: 'PK WND', definition: 'Peak Wind - The maximum instantaneous wind speed since the last regular observation.' },
    { term: 'WSHFT', definition: 'Wind Shift - A sudden change in wind direction of 45 degrees or more in less than 15 minutes with sustained winds of 10 knots or more.' },
    { term: '-', definition: 'Light Intensity - When used with precipitation, indicates light intensity.' },
    { term: '+', definition: 'Heavy Intensity - When used with precipitation, indicates heavy intensity; also used as a separator between temperature and dew point data.' },
    { term: 'ACC', definition: 'Altocumulus Castellanus - A middle-level cloud with vertical development indicating atmospheric instability.' },
    { term: 'ACFT MSHP', definition: 'Aircraft Mishap - Indicates an aircraft accident or incident.' },
    { term: 'ACSL', definition: 'Altocumulus Standing Lenticular Cloud - A stationary, lens-shaped cloud that forms at high altitudes, usually over mountains.' },
    { term: 'ALP', definition: 'Airport Location Point - The designated geographic location of an airport.' },
    { term: 'APCH', definition: 'Approach - The flight path an aircraft follows when landing.' },
    { term: 'APRNT', definition: 'Apparent - As it appears to the observer; used when there is some uncertainty.' },
    { term: 'APRX', definition: 'Approximately - Used when values are estimated rather than precise measurements.' },
    { term: 'ATCT', definition: 'Airport Traffic Control Tower - The facility at an airport that provides air traffic control services.' },
    { term: 'AUTO', definition: 'Fully Automated Report - Indicates the METAR was generated by automated equipment without human intervention.' },
    { term: 'B', definition: 'Began - Indicates when a weather phenomenon started.' },
    { term: 'BC', definition: 'Patches - Indicates fog or other phenomena occurring in patches rather than continuously.' },
    { term: 'BL', definition: 'Blowing - Indicates particles lifted by the wind to a height of 6 feet or more above the ground.' },
    { term: 'C', definition: 'Center - Used with reference to runway designation.' },
    { term: 'CA', definition: 'Cloud-Air Lightning - Lightning that occurs between a cloud and clear air.' },
    { term: 'CBMAM', definition: 'Cumulonimbus Mammatus Cloud - Hanging pouch-like structures that extend from the base of a cumulonimbus cloud.' },
    { term: 'CC', definition: 'Cloud-Cloud Lightning - Lightning that occurs between clouds.' },
    { term: 'CCSL', definition: 'Cirrocumulus Standing Lenticular Cloud - High-altitude, lens-shaped cloud indicating strong winds aloft.' },
    { term: 'CG', definition: 'Cloud-Ground Lightning - Lightning that occurs between a cloud and the ground.' },
    { term: 'CHI', definition: 'Cloud-Height Indicator - Equipment used to measure the height of clouds.' },
    { term: 'CHINO', definition: 'Sky Condition at Secondary Location Not Available - Indicates that cloud height information is not available at a secondary observing location.' },
    { term: 'CONS', definition: 'Continuous - Weather phenomena occurring without interruption.' },
    { term: 'COR', definition: 'Correction - Indicates that a previously disseminated observation is being corrected.' },
    { term: 'DR', definition: 'Low Drifting - Particles raised by the wind to less than 6 feet above the ground.' },
    { term: 'DS', definition: 'Duststorm - Strong winds carrying large amounts of dust, reducing visibility significantly.' },
    { term: 'DSIPTG', definition: 'Dissipating - Weather phenomena in the process of breaking up or ending.' },
    { term: 'DSNT', definition: 'Distant - Weather phenomena observed at a distance from the station, typically beyond 10 miles.' },
    { term: 'DU', definition: 'Widespread Dust - Fine particles of earth suspended in the air, reducing visibility.' },
    { term: 'DVR', definition: 'Dispatch Visual Range - The reported visual range used for dispatch purposes.' },
    { term: 'E', definition: 'East - Compass direction; or "Ended" when referring to a weather phenomenon; or "Estimated" when referring to ceiling height in an observation.' },
    { term: 'FC', definition: 'Funnel Cloud - A rotating, cone-shaped cloud extending downward from the base of a thunderstorm but not reaching the ground.' },
    { term: 'FIBI', definition: 'Filed But Impracticable to Transmit - Indicates an observation was taken but could not be transmitted at that time.' },
    { term: 'FIRST', definition: 'First Observation After a Break - The first weather observation after a period when no observations were made at a manual station.' },
    { term: 'FRQ', definition: 'Frequent - Used to describe lightning or other weather phenomena occurring often within a certain time period.' },
    { term: 'FT', definition: 'Feet - Unit of measurement for altitude or vertical distance.' },
    { term: 'FU', definition: 'Smoke - Suspension of small particles produced by combustion.' },
    { term: 'FZ', definition: 'Freezing - Indicates that liquid precipitation is freezing upon impact with the ground or other surfaces.' },
    { term: 'FZRANO', definition: 'Freezing Rain Sensor Not Available - Indicates that the freezing rain sensor is inoperative.' },
    { term: 'HLSTO', definition: 'Hailstone - A pellet of ice formed in thunderstorms.' },
    { term: 'INCRG', definition: 'Increasing - Weather phenomena becoming more intense or more frequent.' },
    { term: 'INTMT', definition: 'Intermittent - Weather phenomena that starts and stops repeatedly.' },
    { term: 'L', definition: 'Left - Used with reference to runway designation.' },
    { term: 'LAST', definition: 'Last Observation Before a Break - The last weather observation before a period when no observations were made at a manual station.' },
    { term: 'LST', definition: 'Local Standard Time - The time in the local time zone.' },
    { term: 'LTG', definition: 'Lightning - The visible discharge of electricity in the atmosphere. Often followed by codes indicating type of lightning: IC (in-cloud), CC (cloud-to-cloud), CG (cloud-to-ground), or combinations.' },
    { term: 'LTGICCG', definition: 'Lightning In-Cloud and Cloud-to-Ground - Code used in METAR/TAF reports to indicate both in-cloud lightning and cloud-to-ground lightning are observed.' },
    { term: 'LWR', definition: 'Lower - Refers to decreasing height or altitude of a weather phenomenon.' },
    { term: 'M', definition: 'Minus, Less Than - Indicates a value less than what can be measured by instruments; often used with temperatures below zero.' },
    { term: 'MAX', definition: 'Maximum - The highest value of a meteorological element during a specified time period.' },
    { term: 'MI', definition: 'Shallow - Indicates fog or other phenomena extending only a short distance above the ground.' },
    { term: 'MIN', definition: 'Minimum - The lowest value of a meteorological element during a specified time period.' },
    { term: 'MOV', definition: 'Moved/Moving/Movement - Indicates the motion of weather systems or phenomena.' },
    { term: 'MT', definition: 'Mountains - Used in terrain descriptions.' },
    { term: 'N', definition: 'North - Compass direction.' },
    { term: 'N/A', definition: 'Not Applicable - Information that does not apply in the current context.' },
    { term: 'NE', definition: 'Northeast - Compass direction.' },
    { term: 'NOSPECI', definition: 'No SPECI Reports - Indicates that special reports are not taken at the station.' },
    { term: 'NOTAM', definition: 'Notice to Airmen - Official notice containing information concerning the establishment, condition, or change in any aeronautical facility, service, procedure, or hazard.' },
    { term: 'NW', definition: 'Northwest - Compass direction.' },
    { term: 'OCNL', definition: 'Occasional - Weather phenomena occurring infrequently or irregularly during a specified time period.' },
    { term: 'OHD', definition: 'Overhead - Directly above the observation point.' },
    { term: 'OVR', definition: 'Over - Indicates something located above or beyond a specified point.' },
    { term: 'P', definition: 'Greater Than - Indicates a value exceeding the highest reportable value of an instrument.' },
    { term: 'PCPN', definition: 'Precipitation - Any form of water particles that fall from the atmosphere and reach the ground.' },
    { term: 'PNO', definition: 'Precipitation Amount Not Available - Indicates that the precipitation measurement is not available.' },
    { term: 'PO', definition: 'Dust/Sand Whirls - Small, rapidly rotating columns of air carrying dust, sand, and debris (dust devils).' },
    { term: 'PR', definition: 'Partial - Covering part but not all of the specified area, often used with fog (PRFG).' },
    { term: 'PRESFR', definition: 'Pressure Falling Rapidly - A substantial decrease in barometric pressure over a short period of time.' },
    { term: 'PRESRR', definition: 'Pressure Rising Rapidly - A substantial increase in barometric pressure over a short period of time.' },
    { term: 'PWINO', definition: 'Precipitation Identifier Sensor Not Available - Indicates that the sensor to identify the type of precipitation is inoperative.' },
    { term: 'PY', definition: 'Spray - Water particles driven from a body of water by strong winds.' },
    { term: 'R', definition: 'Right (with reference to runway designation), or Runway.' },
    { term: 'RTD', definition: 'Routine Delayed - An observation that was taken at the scheduled time but transmitted late.' },
    { term: 'RV', definition: 'Reportable Value - A value that meets the criteria for reporting.' },
    { term: 'RVRNO', definition: 'RVR System Values Not Available - Indicates that Runway Visual Range values are not available.' },
    { term: 'RY', definition: 'Runway - The defined rectangular area on an airport prepared for the landing and takeoff of aircraft.' },
    { term: 'S', definition: 'South - Compass direction; or "Snow" when referring to precipitation.' },
    { term: 'SA', definition: 'Sand - Particles of rock broken down by weathering and erosion, raised from the surface by strong winds.' },
    { term: 'SCSL', definition: 'Stratocumulus Standing Lenticular Cloud - A lens-shaped stratocumulus cloud, often associated with mountain waves.' },
    { term: 'SE', definition: 'Southeast - Compass direction.' },
    { term: 'SFC', definition: 'Surface - The ground or water level at the observation point.' },
    { term: 'SG', definition: 'Snow Grains - Precipitation consisting of very small, white, opaque ice particles.' },
    { term: 'SLPNO', definition: 'Sea-Level Pressure Not Available - Indicates that sea-level pressure measurements are not available.' },
    { term: 'SM', definition: 'Statute Miles - Unit of distance used to report visibility in the US.' },
    { term: 'SNINCR', definition: 'Snow Increasing Rapidly - A significant increase in snowfall rate or accumulation over a short period of time.' },
    { term: 'SP', definition: 'Snow Pellets - White, opaque, round or conical ice particles about 2-5mm in diameter that bounce when hitting a hard surface.' },
    { term: 'SQ', definition: 'Squalls - A sudden increase in wind speed by at least 16 knots, rising to 22 knots or more and lasting for at least one minute.' },
    { term: 'SS', definition: 'Sandstorm - Strong winds carrying large amounts of sand, significantly reducing visibility.' },
    { term: 'STN', definition: 'Station - The location where weather observations are taken.' },
    { term: 'SW', definition: 'Southwest - Compass direction; or "Snow Shower" when referring to precipitation.' },
    { term: 'TSNO', definition: 'Thunderstorm Information Not Available - Indicates that thunderstorm detection equipment is inoperative.' },
    { term: 'TWR', definition: 'Tower - Air traffic control tower.' },
    { term: 'UNKN', definition: 'Unknown - Information that cannot be determined.' },
    { term: 'UP', definition: 'Unknown Precipitation - Precipitation detected by automated systems that cannot determine the type.' },
    { term: 'UTC', definition: 'Coordinated Universal Time - The primary time standard by which the world regulates clocks and time, formerly known as GMT.' },
    { term: 'V', definition: 'Variable - Used to indicate changeable wind direction or other variable elements.' },
    { term: 'VA', definition: 'Volcanic Ash - Fine particles of rock ejected by a volcano.' },
    { term: 'VISNO', definition: 'Visibility at Secondary Location Not Available - Indicates that visibility information at a secondary observing location is not available.' },
    { term: 'VRB', definition: 'Variable - Used to report variable wind directions when no single direction can be determined.' },
    { term: 'VV', definition: 'Vertical Visibility - Used when the sky is obscured and a ceiling cannot be determined, reporting the vertical distance into the obscuration.' },
    { term: 'W', definition: 'West - Compass direction.' },
    { term: 'WND', definition: 'Wind - The horizontal movement of air relative to the earth\'s surface.' },
    { term: 'Z', definition: 'Zulu - Another term for Coordinated Universal Time (UTC).' },
  ];

  useEffect(() => {
    // Initialize filtered terms with all terms
    setFilteredTerms(glossaryTerms);
  }, []);

  // Filter terms when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTerms(glossaryTerms);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = glossaryTerms.filter(
        item => 
          item.term.toLowerCase().includes(lowercasedSearch) || 
          item.definition.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredTerms(filtered);
    }
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <AviationBackground>
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-8 transition-colors duration-300`}>
            <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Aviation Weather Glossary
            </h1>
            
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search terms or definitions..."
                  className={`w-full px-4 py-3 rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredTerms.length} terms found
              </p>
            </div>
            
            {filteredTerms.length > 0 ? (
              <div className={`overflow-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-1/4`}>
                        Term
                      </th>
                      <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider w-3/4`}>
                        Definition
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
                    {filteredTerms.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.term}
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.definition}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No terms found matching "{searchTerm}". Try a different search term.
              </div>
            )}
          </div>
        </div>
      </AviationBackground>
    </div>
  );
} 