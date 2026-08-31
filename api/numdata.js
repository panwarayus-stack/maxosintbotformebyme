```js
export default async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).send("❌ Missing ?number= parameter");
  }

  try {
    const apiUrl = `https://numinfo.ai.studio/search?q=${encodeURIComponent(number)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res
        .status(502)
        .send(`❌ API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Your API returns "results", not "result"
    if (
      !data.success ||
      !Array.isArray(data.results) ||
      data.results.length === 0
    ) {
      return res.status(200).send("⚠️ No data found for this number");
    }

    // Take first result
    const item = data.results[0];

    const output = `
📱 Mobile: ${item.phoneNumber || "-"}
👤 Name: ${item.name || "-"}
👨‍👩‍👧 Father: ${item.fathersName || "-"}
🏠 Address: ${item.address || "-"}
📞 Alt Mobile: ${item.otherNumber || "-"}
📶 Circle/ISP: ${item.circle || "-"}
🆔 Aadhar: ${item.aadharNumber || "-"}
✉️ Email: ${item.email || "-"}
    `.trim();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(output);

  } catch (error) {
    console.error(error);
    return res.status(500).send(`❌ Error: ${error.message}`);
  }
}
```
