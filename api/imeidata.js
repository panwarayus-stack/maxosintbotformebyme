const { exec } = require("child_process");

export default async function handler(req, res) {
  const imei = req.query.imei;
  if (!imei) return res.status(400).send("❌ Missing ?imei= parameter");

  const curlCmd = `curl -s "https://osintx.info/API/imei.php?key=EDWARD&term=${imei}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send(`❌ Error: ${error.message}`);
    if (stderr) return res.status(500).send(`❌ Stderr: ${stderr}`);

    try {
      const data = JSON.parse(stdout);

      if (!data.result || !data.result.header) {
        return res.status(200).send("⚠️ No data found for this IMEI");
      }

      const header = data.result.header;
      const items = data.result.items;

      let output = `
📱 Brand: ${header.brand || "-"}
📲 Model: ${header.model || "-"}
🔢 IMEI: ${header.imei || "-"}
`;

      if (header.photo) {
        output += `<img class="phone-img" src="${header.photo}" alt="Phone Image"/>\n`;
      }

      items.forEach(i => {
        if (i.role === "header") {
          output += `\n🟢 ${i.title}\n`;
        } else if (i.role === "item") {
          output += `• ${i.title}: ${i.content || "-"}\n`;
        }
      });

      res.setHeader("Content-Type", "text/html");
      res.status(200).send(output);

    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
