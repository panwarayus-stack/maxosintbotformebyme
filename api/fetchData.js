const { exec } = require("child_process");

export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).json({ error: "Missing ?number= parameter" });
  }

  const curlCmd = `curl -s "https://allapiinone.vercel.app/?key=DEMOKEY&type=mobile&term=${number}"`;

  exec(curlCmd, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else if (stderr) {
      res.status(500).json({ error: stderr });
    } else {
      try {
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(stdout);
      } catch (e) {
        res.status(500).json({ error: "Invalid JSON" });
      }
    }
  });
}


