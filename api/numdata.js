const { exec } = require("child_process");

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).send("❌ Missing ?number= parameter");
  }

  const curlCmd =
    `curl -s "https://allapiinone.vercel.app/?key=FOR_U&type=m&term=${encodeURIComponent(number)}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`❌ Error: ${error.message}`);
    }

    if (stderr) {
      return res.status(500).send(`❌ Stderr: ${stderr}`);
    }

    try {
      const data = JSON.parse(stdout);

      // API returns "results", not "result"
      if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
        return res.status(200).send("⚠️ No data found for this number");
      }

      const item = data.results[0];

      const output = `
📱 Mobile: ${item.phoneNumber || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father's Name: ${item.fathersName || "-"}
📶 Source: ${item.source || "-"}
      `.trim();

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(output);

    } catch (e) {
      return res.status(500).send("❌ Invalid JSON from API");
    }
  });
}
