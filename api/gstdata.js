async function lookup() {
  const gstin = document.getElementById('gstin').value.trim();
  const resBox = document.getElementById('result');

  if (!gstin) {
    alert("⚠️ Please enter a GSTIN");
    return;
  }

  resBox.textContent = "⏳ Fetching data...";
  resBox.classList.add("loading");

  try {
    // Fetch data from GSTINCheck.co.in API
    const gstinCheckRes = await fetch(`https://gstincheck.co.in/api/validate?gstin=${gstin}`);
    const gstinCheckData = await gstinCheckRes.json();

    // Fetch data from Cashfree GSTIN Verification API
    const cashfreeRes = await fetch(`https://api.cashfree.com/verification/gstin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': '<your-client-id>',
        'x-client-secret': '<your-client-secret>'
      },
      body: JSON.stringify({ GSTIN: gstin })
    });
    const cashfreeData = await cashfreeRes.json();

    // Fetch data from Jamku GST Return Status API
    const jamkuRes = await fetch(`https://gst-return-status.p.rapidapi.com/free/gstin/${gstin}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '<your-rapidapi-key>',
        'x-rapidapi-host': 'gst-return-status.p.rapidapi.com'
      }
    });
    const jamkuData = await jamkuRes.json();

    // Combine and display the data
    const combinedData = {
      "GSTIN": gstin,
      "Legal Name": gstinCheckData.data.lgnm,
      "Business Constitution": gstinCheckData.data.ctb,
      "State Jurisdiction": gstinCheckData.data.stj,
      "Registration Date": gstinCheckData.data.rgdt,
      "GST Status": gstinCheckData.data.sts,
      "Return Filing Status": jamkuData.data.sts,
      "Trade Name": jamkuData.data.tradeName,
      "HSN Codes": jamkuData.data.hsn.join(', '),
      "Taxpayer Type": jamkuData.data.dty,
      "PAN": jamkuData.data.pan,
      "GSTIN Status": cashfreeData.status
    };

    resBox.classList.remove("loading");
    resBox.textContent = JSON.stringify(combinedData, null, 2);
  } catch (err) {
    resBox.classList.remove("loading");
    resBox.textContent = "❌ Error: " + err.message;
  }
}
