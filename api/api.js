export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { type, term } = req.body;
    
    // Validate input
    if (!type || !term) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and term'
      });
    }
    
    // Valid API types
    const validTypes = [
      "upiinfo", "vh", "num", "adhar", "imei", "pak", "ifsc", 
      "ip", "pwned", "like", "fb", "bomb", "stop", "tg", 
      "familyinfo", "familyinfo2", "reset", "pan"
    ];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API type'
      });
    }
    
    // Construct the ngrok API URL
    const apiUrl = `https://daphine-unconstraining-lenora.ngrok-free.dev/api?key=key20&type=${type}&term=${encodeURIComponent(term)}`;
    
    console.log(`Making request to: ${apiUrl}`);
    
    // Make request to ngrok API with proper headers to bypass ngrok warning
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ngrok API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data from ngrok API
    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        type: type,
        term: term,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Proxy API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch from ngrok API: ' + error.message
    });
  }
}

// Additional endpoint for direct API access (optional)
export async function directHandler(req, res) {
  if (req.method === 'GET') {
    const { type, term } = req.query;
    
    if (!type || !term) {
      return res.status(400).json({
        success: false,
        error: 'Missing type or term parameters'
      });
    }
    
    try {
      const apiUrl = `https://daphine-unconstraining-lenora.ngrok-free.dev/api?key=key20&type=${type}&term=${encodeURIComponent(term)}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return res.status(200).json({
        success: true,
        data: data
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
