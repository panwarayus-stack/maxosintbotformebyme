// Suppress deprecation warning
process.noDeprecation = true;
process.env.NODE_NO_WARNINGS = '1';

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).send("❌ Missing ?number= parameter");
  }

  try {
    const apiUrl = `https://allapiinone.vercel.app/?key=FOR_U&type=m&term=${number}`;
    
    console.log(`📞 Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`);
      return res.status(500).send(`❌ API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug logging
    console.log(`📊 Response:`, JSON.stringify(data, null, 2));

    // Check if data exists
    if (!data) {
      return res.status(200).send("⚠️ No data received from API");
    }

    // Check for success flag
    if (data.success === false) {
      return res.status(200).send(`⚠️ API returned error: ${data.message || "Unknown error"}`);
    }

    // Check results
    if (!data.results || data.results.length === 0) {
      // Also check for older format 'result'
      if (data.result && data.result.length > 0) {
        const item = data.result[0];
        const output = formatOutput(item);
        return res.status(200).send(output);
      }
      return res.status(200).send(`⚠️ No data found for number: ${number}`);
    }

    // Process results
    const item = data.results[0];
    const output = formatOutput(item);
    
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output);

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).send(`❌ Error: ${error.message}`);
  }
}

function formatOutput(item) {
  return `
📱 Mobile: ${item.phoneNumber || item.mobile || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father: ${item.fathersName || item.father_name || "-"}
🏠 Address: ${item.address || "-"}
📞 Alt Mobile: ${item.otherNumber || item.alt_mobile || "-"}
🆔 Aadhar: ${item.aadharNumber || item.id_number || "-"}
📍 District: ${item.district || "-"}
📍 State: ${item.state || "-"}
📍 Pincode: ${item.pincode || "-"}
📍 Town: ${item.town || "-"}
📊 Source: ${item.source || "-"}
  `.trim();
}
