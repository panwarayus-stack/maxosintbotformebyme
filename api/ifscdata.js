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

      // Icon mapping based on key
      const icons = {
        BANK: "🏦",
        BRANCH: "🏢",
        DISTRICT: "📍",
        CITY: "🏙️",
        STATE: "🌍",
        ADDRESS: "📮",
        IFSC: "✅",
        MICR: "💳",
        NEFT: "💸 NEFT",
        RTGS: "⚡ RTGS",
        IMPS: "📲 IMPS",
        UPI: "📱 UPI",
        SWIFT: "🌐 SWIFT",
        CONTACT: "📞 Contact",
        CENTRE: "📌",
        ISO3166: "🗺️ Country Code",
        BANKCODE: "🏷️ Code"
      };

      // Generating formatted lines
      let output = "";
      for (const [key, value] of Object.entries(item)) {
        const icon = icons[key] || "🔹";
        output += `${icon} ${key}: ${value === null || value === "" ? "-" : value}\n`;
      }

      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(output.trim());

    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
