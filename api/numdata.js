// Suppress deprecation warning
process.noDeprecation = true;
process.env.NODE_NO_WARNINGS = '1';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const number = req.query.number;

  if (!number) {
    return res.status(400).json({
      success: false,
      error: "Missing ?number= parameter",
      usage: "/api/numdata?number=9193558616"
    });
  }

  try {
    // Try multiple API endpoints
    const apis = [
      `https://allapiinone.vercel.app/?key=FOR_U&type=m&term=${number}`,
      `https://allapiinone.vercel.app/?key=FOR_U&type=mob&term=${number}`,
      `https://icmr-and-hitek-cy5k.onrender.com/search?mobile=${number}`,
    ];

    let data = null;
    let usedApi = '';

    for (const apiUrl of apis) {
      console.log(`📞 Trying: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData && (jsonData.results || jsonData.result)) {
            data = jsonData;
            usedApi = apiUrl;
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Failed: ${apiUrl}`);
      }
    }

    if (!data) {
      return res.status(200).json({
        success: false,
        error: "No data found for this number",
        number: number,
        message: "Try another number or check the API"
      });
    }

    // Extract data
    const results = data.results || data.result || [];
    
    if (results.length === 0) {
      return res.status(200).json({
        success: false,
        error: "No results found",
        number: number,
        raw: data
      });
    }

    const item = results[0];

    // Format response
    const formattedData = {
      success: true,
      number: number,
      data: {
        mobile: item.phoneNumber || item.mobile || item.phone || "-",
        name: item.name || "-",
        father: item.fathersName || item.father_name || "-",
        address: item.address || "-",
        altMobile: item.otherNumber || item.alt_mobile || "-",
        aadhar: item.aadharNumber || item.id_number || "-",
        district: item.district || "-",
        state: item.state || "-",
        pincode: item.pincode || "-",
        town: item.town || "-",
        source: item.source || "-"
      },
      raw: data,
      usedApi: usedApi
    };

    // Return JSON response (easier for debugging)
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(formattedData);

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
