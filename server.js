import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const AWC_BASE_URL = 'https://aviationweather.gov/adds/dataserver_current/httpparam';

const fetchOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Accept': 'application/xml,text/xml,*/*',
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

// Helper function to build AWC API URL
function buildAwcUrl(dataType, stationId) {
  const url = `${AWC_BASE_URL}?dataSource=${dataType}&requestType=retrieve&format=xml&stationString=${stationId}&hoursBeforeNow=2`;
  console.log('Built AWC URL:', url);
  return url;
}

// Add debug logging helper
function debugLog(label, data) {
  console.log(`[DEBUG] ${label}:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

// XML to JSON converter helper
function xmlToJson(xml) {
  try {
    // Skip empty text nodes and comments
    if (xml.nodeType === 3 && !xml.nodeValue.trim()) {
      return null;
    }
    if (xml.nodeType === 8) { // Comment node
      return null;
    }

    const result = {};
    
    // Element node
    if (xml.nodeType === 1) {
      debugLog('Processing element node', xml.nodeName);
      // Handle attributes
      if (xml.attributes.length > 0) {
        result['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          result['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
        debugLog('Processed attributes', result['@attributes']);
      }
    } 
    // Text node
    else if (xml.nodeType === 3) {
      const text = xml.nodeValue.trim();
      debugLog('Processing text node', text);
      return text ? text : null;
    }

    // Handle child nodes
    if (xml.hasChildNodes()) {
      const children = {};
      debugLog('Processing child nodes for', xml.nodeName);
      
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        
        if (nodeName === '#text') {
          const text = item.nodeValue.trim();
          if (text) {
            debugLog('Found text content', text);
            return text;
          }
          continue;
        }
        
        const child = xmlToJson(item);
        if (child !== null) {
          if (children[nodeName]) {
            if (!Array.isArray(children[nodeName])) {
              children[nodeName] = [children[nodeName]];
            }
            children[nodeName].push(child);
          } else {
            children[nodeName] = child;
          }
          debugLog(`Processed child node ${nodeName}`, child);
        }
      }
      
      // Merge children into result
      Object.assign(result, children);
      debugLog('Final result for node', { nodeName: xml.nodeName, result });
    }
    
    return result;
  } catch (error) {
    console.error('Error converting XML to JSON:', error);
    return null;
  }
}

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Add a test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const testUrl = buildAwcUrl('metars', 'KJFK');
    debugLog('Test request URL', testUrl);
    
    const response = await fetch(testUrl, fetchOptions);
    debugLog('Test response status', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    debugLog('Raw XML response', text);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const jsonData = xmlToJson(xmlDoc);
    debugLog('Parsed JSON data', jsonData);
    
    res.json({ message: 'Test endpoint working', data: jsonData });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for METAR data
app.get('/api/metar/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const url = buildAwcUrl('metars', stationId);
    
    debugLog('Fetching METAR from', url);
    
    const response = await fetch(url, fetchOptions);
    debugLog('METAR response status', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    debugLog('Raw XML response', text);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const jsonData = xmlToJson(xmlDoc);
    
    debugLog('Parsed JSON data', jsonData);
    
    if (!jsonData || !jsonData.response || !jsonData.response.data || !jsonData.response.data.METAR) {
      res.status(404).json({ error: 'No METAR data found for station' });
      return;
    }
    
    const metarData = jsonData.response.data.METAR[0];
    debugLog('METAR data', metarData);
    
    const result = {
      data: [{
        raw: metarData.raw_text,
        station: {
          icao: metarData.station_id,
          name: metarData.station_id
        },
        flight_category: metarData.flight_category,
        temp: {
          celsius: parseFloat(metarData.temp_c || '0')
        },
        dewpoint: {
          celsius: parseFloat(metarData.dewpoint_c || '0')
        },
        wind: {
          degrees: parseInt(metarData.wind_dir_degrees || '0'),
          speed_kts: parseInt(metarData.wind_speed_kt || '0'),
          gust_kts: metarData.wind_gust_kt ? parseInt(metarData.wind_gust_kt) : null
        },
        visibility: {
          miles: parseFloat(metarData.visibility_statute_mi || '0')
        },
        altim_in_hg: parseFloat(metarData.altim_in_hg || '29.92'),
        timestamp: metarData.observation_time
      }]
    };
    
    debugLog('Sending response', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching METAR:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for TAF data
app.get('/api/taf/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const url = buildAwcUrl('tafs', stationId);
    
    debugLog('Fetching TAF from', url);
    
    const response = await fetch(url, fetchOptions);
    debugLog('TAF response status', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    debugLog('Raw XML response', text);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const jsonData = xmlToJson(xmlDoc);
    
    debugLog('Parsed JSON data', jsonData);
    
    if (!jsonData || !jsonData.response || !jsonData.response.data || !jsonData.response.data.TAF) {
      res.status(404).json({ error: 'No TAF data found for station' });
      return;
    }
    
    const tafData = jsonData.response.data.TAF[0];
    debugLog('TAF data', tafData);
    
    const result = {
      data: [{
        raw: tafData.raw_text,
        station: {
          icao: tafData.station_id,
          name: tafData.station_id
        },
        timestamp: {
          issued: tafData.issue_time,
          from: tafData.valid_time_from,
          to: tafData.valid_time_to
        },
        forecast: tafData.forecast || []
      }]
    };
    
    debugLog('Sending TAF response', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching TAF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
}); 