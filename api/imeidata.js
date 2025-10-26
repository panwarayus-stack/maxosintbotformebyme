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
      res.setHeader("Content-Type", "application/json");
      res.status(200).send(JSON.stringify(data));
    } catch (e) {
      res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
