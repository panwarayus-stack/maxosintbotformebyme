const { exec } = require("child_process");

export default async function handler(req, res) {
  const adhar = req.query.adhar; // match the frontend

  if (!adhar) {
    return res.status(400).send("❌ Missing ?adhar= parameter");
  }

  const curlCmd = `curl -s "https://allapiinone.vercel.app/?key=DEMOKEY&type=id_number&term=${adhar}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`❌ Error: ${error.message}`);
    if (stderr) return res.status(500).send(`❌ Stderr: ${stderr}`);

    try {
      const data = JSON.parse(stdout);

      if (!data.success || !data.result || data.result.length === 0) {
        return res.status(200).send("⚠️ No data found for this Aadhar");
      }

      // Take first result only
      const item = data.result[0];

      const output = `
📱 Mobile: ${item.mobile || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father: ${item.father_name || "-"}
🏠 Address: ${item.address || "-"}
📞 Alt Mobile: ${item.alt_mobile || "-"}
📶 Circle/ISP: ${item.circle || "-"}
🆔 Aadhar: ${item.id_number || "-"}
✉️ Email: ${item.email || "-"}
      `.trim();

      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(output);

    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
