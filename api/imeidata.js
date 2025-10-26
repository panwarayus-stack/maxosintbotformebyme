import fetch from "node-fetch";

export default async function handler(req, res){
  const imei = req.query.imei;
  if(!imei) return res.status(400).send("❌ Missing ?imei= parameter");

  const API_KEY = "92a6c86b-6d99-41bc-aff7-766912f81cb0";
  const url = `https://api.imei.info/v1/lookup?api_key=${API_KEY}&imei=${imei}`;

  try{
    const r = await fetch(url);
    if(!r.ok) return res.status(500).send(`❌ API Error: ${r.statusText}`);
    const json = await r.json();

    if(!json.success) return res.status(200).send("⚠️ No data found for this IMEI");

    const d = json.data || {};

    // formatted output
    const output = `
IMEI: ${d.imei || "-"}
Brand: ${d.brand || "-"}
Model: ${d.model || "-"}
Manufacturer: ${d.manufacturer || "-"}
Device Type: ${d.device_type || "-"}
OS: ${d.os || "-"}
Color: ${d.color || "-"}
Status: ${d.status || "-"}
Carrier: ${d.carrier || "-"}
Purchase Date: ${d.purchase_date || "-"}
    `.trim();

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output);

  }catch(e){
    res.status(500).send("❌ Fetch error: "+e.message);
  }
}
