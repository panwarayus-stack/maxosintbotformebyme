const { exec } = require("child_process");

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).json({ error: "Missing ?number= parameter" });
  }

  const curlCmd = `curl -s "https://allapiinone.vercel.app/?key=DEMOKEY&type=mobile&term=${number}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    } else if (stderr) {
      return res.status(500).json({ error: stderr });
    } else {
      try {
        const data = JSON.parse(stdout);

        if (!data.success || !data.result || data.result.length === 0) {
          return res.status(200).json({ success: false, message: "No data found" });
        }

        // format result with emojis
        const formatted = data.result.map(item => ({
          "📱 Mobile": item.mobile || "-",
          "👤 Name": item.name || "-",
          "👨‍👩‍👧 Father": item.father_name || "-",
          "🏠 Address": item.address || "-",
          "📞 Alt Mobile": item.alt_mobile || "-",
          "📶 Circle/ISP": item.circle || "-",
          "🆔 Aadhar": item.id_number || "-",
          "✉️ Email": item.email || "-"
        }));

        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ success: true, result: formatted });

      } catch (e) {
        res.status(500).json({ error: "Invalid JSON from API" });
      }
    }
  });
}
