const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { phoneNumber, ipAddress = '192.168.1.1' } = body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Simplified APIs for testing
    const apis = [
      {
        endpoint: "https://httpbin.org/post",
        method: "POST",
        payload: { test: "data", phone: phoneNumber },
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      },
      {
        endpoint: "https://jsonplaceholder.typicode.com/posts",
        method: "POST",
        payload: { title: "test", body: "test", userId: 1, phone: phoneNumber },
        headers: {
          "Content-Type": "application/json"
        }
      }
    ];

    // Send requests to APIs
    const requests = apis.map(async (api) => {
      try {
        const options = {
          method: api.method,
          headers: {
            ...api.headers,
            'X-Forwarded-For': ipAddress,
            'Client-IP': ipAddress
          }
        };

        if (api.method === 'POST') {
          if (api.headers['Content-Type'] === 'application/json') {
            options.body = JSON.stringify(api.payload);
          } else {
            options.body = api.payload;
          }
        }

        const response = await fetch(api.endpoint, options);
        const status = response.status;
        
        return {
          endpoint: api.endpoint,
          status: status,
          success: status === 200 || status === 201
        };
      } catch (error) {
        console.error(`Error for ${api.endpoint}:`, error.message);
        return {
          endpoint: api.endpoint,
          status: null,
          error: error.message,
          success: false
        };
      }
    });

    const results = await Promise.all(requests);
    const activeAPIs = results.filter(result => result.success).length;

    res.json({
      success: true,
      activeAPIs,
      totalAPIs: apis.length,
      results
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
