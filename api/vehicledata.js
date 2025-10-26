const { exec } = require("child_process");

export default async function handler(req, res) {
  const vehicle = req.query.vehicle;

  if (!vehicle) {
    return res.status(400).send("❌ Missing ?vehicle= parameter");
  }

  const curlCmd = `curl -s "https://allapiinone.vercel.app/?key=DEMOKEY&type=rc&term=${vehicle}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`❌ Error: ${error.message}`);
    if (stderr) return res.status(500).send(`❌ Stderr: ${stderr}`);

    try {
      const data = JSON.parse(stdout);
      if (!data.success || !data.result?.vehicle_response) {
        return res.status(200).send("⚠️ No vehicle data found for this number");
      }

      const v = data.result.vehicle_response;
      const challans = data.result.challan_response?.data || [];

      let resultText = `
🚗 VEHICLE DETAILS:
📍 Asset Number: ${v.asset_number || "-"}
🏷️ Make/Model: ${v.make_model || "-"}
⛽ Fuel: ${v.fuel_type || "-"}
👤 Owner: ${v.owner_name || "-"}
📅 Registration Date: ${v.registration_date || "-"}
🏠 Address: ${v.permanent_address || "-"}

🔧 ENGINE/CHASSIS:
🔢 Engine No: ${v.engine_number || "-"}
🔢 Chassis No: ${v.chassis_number || "-"}

📋 INSURANCE:
🏢 Previous Insurer: ${v.previous_insurer || "-"}
📆 Expiry: ${v.previous_policy_expiry_date || "-"}

⚠️ CHALLANS:
${challans.length > 0 
  ? challans.map(c => `
🔹 Challan No: ${c.number || "-"}
💰 Amount: ${c.amount?.total || "-"}
📍 Offence: ${c.violations?.details?.[0]?.offence || "-"}
📆 Date: ${c.violations?.date || "-"}
🚦 Status: ${c.challan_status || "-"}
`).join("\n")
  : "✅ No challans found"}
      `.trim();

      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(resultText);
    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
