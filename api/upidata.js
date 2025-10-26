const { exec } = require("child_process");

export default async function handler(req, res) {
  const upi = req.query.upi;

  if (!upi) {
    return res.status(400).send("❌ Missing ?upi= parameter");
  }

  const curlCmd = `curl -s "https://a55196f81c1d.ngrok-free.app/upiinfo?key=FUCKYOU&term=${encodeURIComponent(upi)}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`❌ Error: ${error.message}`);
    if (stderr) return res.status(500).send(`❌ Stderr: ${stderr}`);

    try {
      const data = JSON.parse(stdout);

      if (!data.success || !data.result) {
        return res.status(200).send("⚠️ No data found for this UPI ID");
      }

      const item = data.result;

      const output = `
👤 Name: ${item.name || "-"}
📱 Mobile: ${item.mobile || "-"}
💸 UPI ID: ${item.upi || upi}
🏦 Bank: ${item.bank || "-"}
🏠 Address: ${item.address || "-"}
      `.trim();

      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(output);

    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
