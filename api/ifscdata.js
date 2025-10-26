const { exec } = require("child_process");

export default async function handler(req, res) {
  const ifsc = req.query.ifsc;

  if (!ifsc) {
    return res.status(400).send("❌ Missing ?ifsc= parameter");
  }

  const url = `https://ifsc.razorpay.com/${encodeURIComponent(ifsc)}`;

  const curlCmd = `curl -s "${url}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`❌ Error: ${error.message}`);
    if (stderr) return res.status(500).send(`❌ Stderr: ${stderr}`);

    try {
      const item = JSON.parse(stdout);

      if (item.error) {
        return res.status(200).send("⚠️ Invalid IFSC or no data found");
      }

      const output = `
🏦 Bank: ${item.BANK || "-"}
📍 Branch: ${item.BRANCH || "-"}
📮 Address: ${item.ADDRESS || "-"}
📍 City: ${item.CITY || "-"}
📍 District: ${item.DISTRICT || "-"}
📍 State: ${item.STATE || "-"}
✅ IFSC: ${item.IFSC || ifsc}
💳 MICR: ${item.MICR || "-"}
      `.trim();

      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(output);

    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
