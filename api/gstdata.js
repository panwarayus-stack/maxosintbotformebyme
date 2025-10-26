export default async function handler(req, res) {
  const gstNumber = req.query.gst;

  if (!gstNumber) {
    return res.status(400).send("❌ Missing ?gst= parameter");
  }

  try {
    const apiRes = await fetch(`https://gstlookup.hideme.eu.org/?gstNumber=${gstNumber}`);
    const json = await apiRes.json();

    if (!json || json.status !== "success" || !json.data) {
      return res.status(404).send("⚠️ No data found for this GSTIN");
    }

    const data = json.data;

    // Format the output with emojis
    const output = `
🆔 GSTIN: ${data.Gstin || "-"}
🏢 Trade Name: ${data.TradeName || "-"}
👤 Legal Name: ${data.LegalName || "-"}
📍 Address: ${data.AddrBnm || ""} ${data.AddrBno || ""} ${data.AddrFlno || ""}, ${data.AddrSt || ""} ${data.AddrLoc || ""}
🌐 State Code: ${data.StateCode || "-"}
📮 Pincode: ${data.AddrPncd || "-"}
💼 Taxpayer Type: ${data.TxpType || "-"}
✅ Status: ${data.Status || "-"}
⛔ Block Status: ${data.BlkStatus || "-"}
📅 Registration Date: ${data.DtReg || "-"}
📆 De-registration Date: ${data.DtDReg || "-"}
    `.trim();

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(output);

  } catch (err) {
    res.status(500).send("❌ Error fetching GST data: " + err.message);
  }
}
