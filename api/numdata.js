```js
// Suppress deprecation warning
process.noDeprecation = true;
process.env.NODE_NO_WARNINGS = "1";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const number = req.query.number;
  const format = String(req.query.format || "json").toLowerCase();

  if (!number) {
    if (format === "text") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(400).send("❌ Missing ?number= parameter");
    }

    return res.status(400).json({
      success: false,
      error: "Missing ?number= parameter",
      usage: "/api/numdata?number=9193558616&format=text"
    });
  }

  try {
    const apis = [
      `https://numinfo.ai.studio/search?q=${encodeURIComponent(number)}`,
      `https://icmr-and-hitek-cy5k.onrender.com/search?mobile=${encodeURIComponent(number)}`
    ];

    let data = null;

    for (const apiUrl of apis) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });

        if (!response.ok) continue;

        const jsonData = await response.json();

        if (
          jsonData &&
          Array.isArray(jsonData.results) &&
          jsonData.results.length > 0
        ) {
          data = jsonData;
          break;
        }
      } catch (e) {
        console.log("❌ API request failed");
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

    const results = data.results || [];

    // Format every result
    const formattedResults = results.map((item, index) => {
      return `
${results.length > 1 ? `━━━ Result ${index + 1} ━━━` : ""}

📱 Mobile: ${item.phoneNumber || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father: ${item.fathersName || "-"}
🏠 Address: ${item.address || "-"}
📞 Alt Mobile: ${item.otherNumber || "-"}
📶 Circle/ISP: ${item.circle || "-"}
🆔 Aadhar: ${item.aadharNumber || "-"}
✉️ Email: ${item.email || "-"}
      `.trim();
    });

    const output = formattedResults.join("\n\n");

    // ?format=text
    if (format === "text") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.status(200).send(output);
    }

    // Default JSON response
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
    console.error("❌ Error:", error.message);

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
```
