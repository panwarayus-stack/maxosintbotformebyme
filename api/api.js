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
    
    // Make request to ngrok API with multiple bypass headers
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'ngrok-skip-browser-warning': '69420',
        'X-Forwarded-For': '123.123.123.123',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Referer': 'https://daphine-unconstraining-lenora.ngrok-free.dev/'
      }
    });
    
    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: `Ngrok API responded with status: ${response.status}`,
        status: response.status
      });
    }
    
    // Get the response as text first
    const responseText = await response.text();
    
    // Check if it's the ngrok warning page
    if (responseText.includes('ngrok.com') || 
        responseText.includes('The page') || 
        responseText.includes('51.75.118.149') ||
        responseText.trim().startsWith('<!DOCTYPE') || 
        responseText.trim().startsWith('<html')) {
      
      return res.status(400).json({
        success: false,
        error: 'NGROK_WARNING_PAGE',
        message: 'Ngrok is showing warning page instead of API response',
        suggestion: 'Try accessing the API directly with bypass headers',
        raw_preview: responseText.substring(0, 300)
      });
    }
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      // If it's not JSON, return the raw text
      return res.status(200).json({
        success: true,
        data: {
          raw_response: responseText,
          note: 'Response was not valid JSON, returning raw text'
        },
        meta: {
          type: type,
          term: term,
          timestamp: new Date().toISOString(),
          response_type: 'raw_text'
        }
      });
    }
    
    // Return the successful JSON data
    return res.status(200).json({
      success: true,
      data: data,
      meta: {
        type: type,
        term: term,
        timestamp: new Date().toISOString(),
        response_type: 'json'
      }
    });
    
  } catch (error) {
    console.error('Proxy API Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch from ngrok API: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Additional GET endpoint for direct testing
export async function GET(req) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const term = url.searchParams.get('term');
  
  if (!type || !term) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing type or term parameters'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
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
    
    const text = await response.text();
    
    return new Response(JSON.stringify({
      success: true,
      raw_response: text,
      url: apiUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
