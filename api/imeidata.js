const { exec } = require("child_process");

export default async function handler(req, res) {
  const imei = req.query.imei ? String(req.query.imei).trim() : "";

  if (!imei) {
    return res.status(400).send("❌ Missing ?imei= parameter");
  }

  // Basic safety: only digits and 14-16 chars allowed
  if (!/^\d{14,16}$/.test(imei)) {
    // still allow but warn
    // return res.status(400).send("❌ Invalid IMEI format (expected 14-16 digits)");
  }

  // IMEI_API_TEMPLATE should be something like:
  // https://example.com/lookup?imei={imei}&key=APIKEY
  // Set it in Vercel Environment Variables if you have a provider.
  const template = process.env.IMEI_API_TEMPLATE || "";

  if (!template) {
    // No real API configured — return a demo/mock response so frontend can show format
    const demo = {
      imei,
      brand: "DemoBrand",
      model: "DemoModel X",
      manufacturer: "DemoCorp",
      device_type: "Smartphone",
      radio: "GSM / LTE",
      status: "demo",
      notes: "No external API configured. Set IMEI_API_TEMPLATE env var to use real provider."
    };

    const lines = [
      `🔎 IMEI Lookup — by MR WEIRDO`,
      ``,
      `🔢 IMEI: ${demo.imei}`,
      `🏷️ Brand: ${demo.brand}`,
      `📱 Model: ${demo.model}`,
      `🏭 Manufacturer: ${demo.manufacturer}`,
      `📦 Device type: ${demo.device_type}`,
      `📡 Radio: ${demo.radio}`,
      `ℹ️ Status: ${demo.status}`,
      `📝 Notes: ${demo.notes}`
    ].join("\n");

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(lines);
  }

  // Build URL by replacing {imei} placeholder
  const url = template.replace(/{imei}/g, encodeURIComponent(imei));

  // call external API via curl (timeout 8s)
  const curlCmd = `curl -m 8 -s "${url}"`;

  exec(curlCmd, { timeout: 9000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("IMEI lookup error:", error.message);
      return res.status(500).send("❌ Something went wrong. Try again later.");
    }
    if (stderr) {
      // log internally, do not leak
      console.error("IMEI lookup stderr:", stderr);
    }

    // Try to parse JSON — if provider returns JSON. If not JSON, return raw text safely.
    let parsed = null;
    try {
      parsed = JSON.parse(stdout);
    } catch (e) {
      // Not JSON — return raw text but safe
      const safeText = String(stdout).trim();
      if (!safeText) {
        return res.status(200).send("⚠️ No data found for this IMEI");
      }
      // Show raw text as-is (still prefixed)
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(`🔎 IMEI Lookup — by MR WEIRDO\n\n${safeText}`);
    }

    // parsed JSON — format keys nicely
    try {
      const lines = [];
      lines.push(`🔎 IMEI Lookup — by MR WEIRDO`);
      lines.push('');

      // Helper: transform common keys into friendly labels
      const labelMap = {
        imei: '🔢 IMEI',
        brand: '🏷️ Brand',
        model: '📱 Model',
        manufacturer: '🏭 Manufacturer',
        device_type: '📦 Device type',
        radio: '📡 Radio',
        status: 'ℹ️ Status',
        carrier: '📶 Carrier',
        country: '🌍 Country',
        vendor: '🏷️ Vendor',
        tac: 'TAC',
        reporting_date: 'Reported',
        notes: '📝 Notes'
      };

      // If provider returns an array or nested object, try to find first object with data
      let obj = parsed;
      if (Array.isArray(parsed) && parsed.length) obj = parsed[0];
      if (parsed && parsed.data) obj = parsed.data;

      // iterate keys in obj
      for (const [k, v] of Object.entries(obj || {})) {
        const label = labelMap[k.toLowerCase()] || (k.toUpperCase().length <= 6 ? k.toUpperCase() : k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
        const val = (v === null || v === '' ? '-' : v);
        lines.push(`${label}: ${val}`);
      }

      // If nothing found, show whole JSON prettified
      if (lines.length <= 2) {
        lines.push(JSON.stringify(parsed, null, 2));
      }

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(lines.join('\n'));
    } catch (e) {
      console.error("IMEI format error:", e.message);
      return res.status(500).send("❌ Something went wrong formatting response");
    }
  });
}
