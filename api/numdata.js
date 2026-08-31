js
export default async function handler(req, res) {
  try {
    const number = req.query?.number;

    if (!number) {
      return res.status(400).json({
        success: false,
        error: "Missing ?number= parameter"
      });
    }

    const url =
      "https://numinfo.ai.studio/search?q=" +
      encodeURIComponent(String(number));

    const response = await fetch(url);

    const text = await response.text();

    if (!response.ok) {
      console.error("Upstream error:", response.status, text);

      return res.status(502).json({
        success: false,
        error: "Upstream API error",
        status: response.status
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON:", text);

      return res.status(502).json({
        success: false,
        error: "Upstream API returned invalid JSON"
      });
    }

    // API response uses "results"
    if (
      !data.success ||
      !Array.isArray(data.results) ||
      data.results.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "No data found",
        results: []
      });
    }

    const item = data.results[0];

    return res.status(200).json({
      success: true,
      result: {
        phoneNumber: item.phoneNumber || null,
        name: item.name || null,
        circle: item.circle || null,
        email: item.email || null
      }
    });

  } catch (error) {
    console.error("Function error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
