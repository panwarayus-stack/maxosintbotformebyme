js
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  const number = req.query?.number;
  const format = String(req.query?.format || "json").toLowerCase();

  if (!number) {
    if (format === "text") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(400).send("❌ Missing ?number= parameter");
    }

    return res.status(400).json({
      success: false,
      error: "Missing ?number= parameter"
    });
  }

  try {
    const encodedNumber = encodeURIComponent(String(number));

    const apis = [
      `https://numinfo.ai.studio/search?q=${encodedNumber}`,
      `https://icmr-and-hitek-cy5k.onrender.com/search?mobile=${encodedNumber}`
    ];

    let data = null;

    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
          }
        });

        if (!response.ok) {
          continue;
        }

        const json = await response.json();

        if (json && Array.isArray(json.results) && json.results.length > 0) {
          data = json;
          break;
        }
      } catch (err) {
        console.error("Upstream request failed:", err.message);
      }
    }

    if (!data) {
      if (format === "text") {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(404).send(
          `❌ No data found\n📱 Mobile: ${number}`
        );
      }

      return res.status(404).json({
        success: false,
        error: "No data found"
      });
    }

    const results = data.results;

    /*
     * Format the results.
     * Only values returned by the upstream service are displayed;
     * masked values remain masked.
     */
    const output = results.map((item, index) => {
      return [
        results.length > 1 ? `━━━ Result ${index + 1} ━━━` : "",
        `📱 Mobile: ${item.phoneNumber || "-"}`,
        `👤 Name: ${item.name || "-"}`,
        `👨‍👩‍👧 Father: ${item.fathersName || "-"}`,
        `🏠 Address: ${item.address || "-"}`,
        `📞 Alt Mobile: ${item.otherNumber || "-"}`,
        `📶 Circle/ISP: ${item.circle || "-"}`,
        `🆔 Aadhar: ${item.aadharNumber || "-"}`,
        `✉️ Email: ${item.email || "-"}`
      ]
        .filter(Boolean)
        .join("\n");
    }).join("\n\n");

    // Text response
    if (format === "text") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(output);
    }

    // JSON response
    return res.status(200).json({
      success: true,
      number: data.number || number,
      count: results.length,
      results: results.map((item) => ({
        mobile: item.phoneNumber || "-",
        name: item.name || "-",
        father: item.fathersName || "-",
        address: item.address || "-",
        altMobile: item.otherNumber || "-",
        circle: item.circle || "-",
        aadhar: item.aadharNumber || "-",
        email: item.email || "-"
      }))
    });

  } catch (error) {
    console.error("FUNCTION ERROR:", error);

    if (format === "text") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(500).send("❌ Internal server error");
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}
