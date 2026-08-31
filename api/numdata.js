const { exec } = require("child_process");

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).send("❌ Missing ?number= parameter");
  }

  const curlCmd = `curl -s "https://numinfo.ai.studio/search?q=${number}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`❌ Error: ${error.message}`);
    if (stderr) return res.status(500).send(`❌ Stderr: ${stderr}`);

    try {
      const data = JSON.parse(stdout);

      if (!data.success || !data.result || data.result.length === 0) {
        return res.status(200).send("⚠️ No data found for this number");
      }

      // Take first result only
      const item = data.result[0];

      const output = `
📱 Mobile: ${item.phoneNumber || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father: ${item.fathersName || "-"}
🏠 Address: ${item.address || "-"}
📞 Alt Mobile: ${item.otherNumber || "-"}
📶 Circle/ISP: ${item.circle || "-"}
🆔 Aadhar: ${item.aadharNumber || "-"}
✉️ Email: ${item.email || "-"}
      `.trim();

      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(output);

    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
