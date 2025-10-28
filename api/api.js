import fetch from "node-fetch";

export default async function handler(req, res) {
  const { key, type, term } = req.query;

  if (!key || !type || !term) {
    return res.status(400).json({ status: false, error: "Missing key/type/term" });
  }

  // whitelist of valid keys (use Vercel env vars for safety)
  const allowedKeys = (process.env.ALLOWED_KEYS || "").split(",");

  if (!allowedKeys.includes(key)) {
    return res.status(403).json({ status: false, error: "Invalid API key" });
  }

  try {
    const target = `https://daphine-unconstraining-lenora.ngrok-free.dev/api?key=${key}&type=${type}&term=${term}`;
    const response = await fetch(target, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
