const { exec } = require("child_process");

export default async function handler(req, res) {
  // Accept either ?ip= or empty (server will look up client's IP from ip-api)
  const ip = req.query.ip ? String(req.query.ip).trim() : "";

  // Validate simple ip format (IPv4) if provided
  if (ip && !/^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/.test(ip)) {
    return res.status(400).send("❌ Invalid IP format");
  }

  // ip-api.com: free endpoint; leave ip empty to get caller IP (server IP though)
  const target = ip ? ip : "json";
  // fields: choose a compact set; you can expand if needed
  const fields = "status,message,query,country,regionName,city,zip,lat,lon,timezone,isp,org,as,reverse,proxy,mobile,hosting";
  const url = ip ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${fields}` : `http://ip-api.com/${target}?fields=${fields}`;

  const curlCmd = `curl -m 8 -s "${url}"`;

  exec(curlCmd, { timeout: 9000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("IP lookup curl error:", error.message);
      return res.status(500).send("❌ Something went wrong. Try again later.");
    }
    if (stderr) {
      // don't leak stderr to user; just log
      console.error("IP lookup stderr:", stderr);
    }

    try {
      const data = JSON.parse(stdout);

      if (!data || data.status !== "success") {
        // ip-api returns { status: "fail", message: "reserved range", ... }
        const msg = data && data.message ? `⚠️ ${data.message}` : "⚠️ No data found for this IP";
        return res.status(200).send(msg);
      }

      // Format all useful fields
      const lines = [];
      lines.push(`🌐 IP: ${data.query || "-"}`);
      lines.push(`🏳️ Country: ${data.country || "-"}`);
      lines.push(`🏷️ Region: ${data.regionName || "-"}`);
      lines.push(`🏙️ City: ${data.city || "-"}`);
      lines.push(`🏤 ZIP: ${data.zip || "-"}`);
      lines.push(`📍 Location: ${data.lat !== undefined && data.lon !== undefined ? data.lat + ", " + data.lon : "-"}`);
      lines.push(`⏱️ Timezone: ${data.timezone || "-"}`);
      lines.push(`📡 ISP: ${data.isp || "-"}`);
      lines.push(`🏢 Org: ${data.org || "-"}`);
      lines.push(`🔗 AS: ${data.as || "-"}`);
      lines.push(`🔁 Reverse DNS: ${data.reverse || "-"}`);
      lines.push(`🔒 Proxy: ${data.proxy === true ? "Yes" : "No"}`);
      lines.push(`📱 Mobile: ${data.mobile === true ? "Yes" : "No"}`);
      lines.push(`🖥️ Hosting: ${data.hosting === true ? "Yes" : "No"}`);

      // Final output string
      const output = `🔎 IP Lookup — by MR WEIRDO\n\n` + lines.join("\n");

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(output);
    } catch (e) {
      console.error("IP lookup parse error:", e.message);
      return res.status(500).send("❌ Something went wrong parsing response");
    }
  });
}
