// Suppress deprecation warning
process.noDeprecation = true;

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).send("❌ Missing ?number= parameter");
  }

  try {
    const apiUrl = `https://allapiinone.vercel.app/?key=FOR_U&type=m&term=${number}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return res.status(500).send(`❌ API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.results || data.results.length === 0) {
      return res.status(200).send("⚠️ No data found for this number");
    }

    const item = data.results[0];

    const output = `
📱 Mobile: ${item.phoneNumber || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father: ${item.fathersName || "-"}
🏠 Address: ${item.address || "-"}
📞 Alt Mobile: ${item.otherNumber || "-"}
🆔 Aadhar: ${item.aadharNumber || "-"}
📍 District: ${item.district || "-"}
📍 State: ${item.state || "-"}
📍 Pincode: ${item.pincode || "-"}
📍 Town: ${item.town || "-"}
    `.trim();

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output);

  } catch (error) {
    res.status(500).send(`❌ Error: ${error.message}`);
  }
}
