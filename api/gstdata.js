import fetch from 'node-fetch';

export default async function handler(req, res) {
  const gstin = req.query.gstin;

  if (!gstin) {
    return res.status(400).send("❌ Missing ?gstin= parameter");
  }

  try {
    // Fetch data from the first free API
    const api1 = await fetch(`https://www.trackgst.com/api/gstin/${gstin}`);
    const data1 = await api1.json();

    // Fetch data from the second free API
    const api2 = await fetch(`https://api.gstcheck.co.in/gstin/${gstin}`);
    const data2 = await api2.json();

    // Combine data from both APIs
    const output = `
🧾 GSTIN Info: ${gstin}
🏢 Name: ${data1.tradeName || data2.tradeName || "-"}
🌍 State: ${data1.state || data2.state || "-"}
📅 Registration Date: ${data1.registrationDate || data2.registrationDate || "-"}
✅ Status: ${data1.status || data2.status || "-"}
📝 Constitution: ${data1.constitution || data2.constitution || "-"}
📌 PAN: ${data1.pan || data2.pan || "-"}
🔗 Jurisdiction: ${data1.jurisdiction || data2.jurisdiction || "-"}
    `.trim();

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output);

  } catch (err) {
    res.status(500).send("❌ Error fetching GST info: " + err.message);
  }
}
