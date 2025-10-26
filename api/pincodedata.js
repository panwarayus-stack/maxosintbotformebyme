const { exec } = require('child_process');

export default async function handler(req, res) {
  const pin = req.query.pin ? String(req.query.pin).trim() : '';

  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).send('❌ Missing or invalid ?pin= parameter (expected 6 digits)');
  }

  const url = `https://api.postalpincode.in/pincode/${encodeURIComponent(pin)}`;
  const curlCmd = `curl -s --max-time 8 "${url}"`;

  exec(curlCmd, { timeout: 9000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Pincode curl error:', error.message);
      return res.status(500).send('❌ Something went wrong. Try again later.');
    }
    if (stderr) {
      // log internally, don't show to user
      console.error('Pincode stderr:', stderr);
    }

    try {
      const data = JSON.parse(stdout);
      if (!Array.isArray(data) || data.length === 0) {
        return res.status(200).send('⚠️ No data found for this PIN');
      }

      const entry = data[0];

      if (entry.Status && entry.Status !== 'Success') {
        // API returns Status: "Error" or message
        return res.status(200).send(`⚠️ ${entry.Message || entry.Status || 'No data found'}`);
      }

      const postOffices = entry.PostOffice || [];
      if (!postOffices.length) {
        return res.status(200).send('⚠️ No post office data found for this PIN');
      }

      // We'll format one primary post office (first) and list others
      const p = postOffices[0];

      const lines = [];
      lines.push(`📮 PIN Lookup — by MR WEIRDO`);
      lines.push('');
      lines.push(`🔢 PIN: ${pin}`);
      lines.push(`🏤 Name: ${p.Name || '-'}`);
      lines.push(`🏙️ District: ${p.District || entry.District || '-'}`);
      lines.push(`📍 Division: ${p.Division || '-'}`);
      lines.push(`📮 Region: ${p.Region || '-'}`);
      lines.push(`🌍 State: ${p.State || '-'}`);
      lines.push(`📦 Country: ${p.Country || '-'}`);
      lines.push(`🔢 Branch Type: ${p.BranchType || '-'}`);
      lines.push(`📬 Delivery Status: ${p.DeliveryStatus || '-'}`);
      lines.push('');
      // list other Post Offices (name + branch type)
      if (postOffices.length > 1) {
        lines.push('📚 Other Post Offices in this PIN:');
        postOffices.slice(0, 10).forEach(po => {
          lines.push(`  • ${po.Name || '-'} (${po.BranchType || '-'})`);
        });
        if (postOffices.length > 10) lines.push(`  ...and ${postOffices.length - 10} more`);
      }

      const out = lines.join('\n');

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(out);

    } catch (e) {
      console.error('Pincode parse error:', e.message);
      return res.status(500).send('❌ Something went wrong parsing response');
    }
  });
}
