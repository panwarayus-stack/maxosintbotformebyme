<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMEI INFO</title>
  <style>
    body {
      background: #000;
      color: #00eaff;
      font-family: monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    h1 {
      font-size: 2em;
      margin-bottom: 20px;
      text-shadow: 0 0 15px #00eaff;
    }
    .box {
      background: #111;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 0 15px #00eaff;
      width: 100%;
      max-width: 700px;
      text-align: center;
      animation: fadeIn 1s ease-in-out;
    }
    input {
      width: 70%;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      outline: none;
      text-align: center;
    }
    button {
      padding: 10px 20px;
      margin-top: 15px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: bold;
      background: #00eaff;
      color: #000;
      cursor: pointer;
      transition: 0.3s;
    }
    button:hover {
      background: #00bcd4;
    }
    .loading {
      animation: blink 1s infinite alternate;
    }
    @keyframes blink {
      from {opacity: 0.3;}
      to {opacity: 1;}
    }
    .imei-photo {
      margin: 15px 0;
      max-width: 200px;
      border-radius: 8px;
      border: 1px solid #00eaff;
    }
    .section-title {
      font-weight: bold;
      margin-top: 15px;
      text-decoration: underline;
      font-size: 1.1em;
    }
    .item {
      margin-left: 10px;
    }
    .item span {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>📱 IMEI INFO - BY MR WEIRDO</h1>
  <div class="box">
    <input type="text" id="imei" placeholder="Enter IMEI e.g. 356938035643809" />
    <br>
    <button onclick="lookup()">🔍 Lookup</button>
    <div id="result">Result will appear here...</div>
  </div>

  <script>
    async function lookup() {
      const imei = document.getElementById('imei').value.trim();
      const resBox = document.getElementById('result');

      if (!imei) {
        alert("⚠️ Please enter an IMEI number");
        return;
      }

      resBox.innerHTML = "⏳ Fetching data...";
      resBox.classList.add("loading");

      try {
        const res = await fetch(`/api/imeidata.js?imei=${imei}`);
        const data = await res.json();

        resBox.classList.remove("loading");
        resBox.innerHTML = "";

        if (!data.result) {
          resBox.textContent = "⚠️ No data found";
          return;
        }

        const header = data.result.header;

        // Show device image
        if (header.photo) {
          const img = document.createElement('img');
          img.src = header.photo;
          img.alt = header.model;
          img.className = "imei-photo";
          resBox.appendChild(img);
        }

        // Show header info with emojis
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
          <div class="section-title">💡 Basic Info</div>
          <div class="item">📱 Brand: <span>${header.brand || "-"}</span></div>
          <div class="item">🔧 Model: <span>${header.model || "-"}</span></div>
          <div class="item">🆔 IMEI: <span>${header.imei || "-"}</span></div>
        `;
        resBox.appendChild(headerDiv);

        // Loop through items
        let currentSection = null;
        data.result.items.forEach(i => {
          if (i.role === "header") {
            currentSection = document.createElement('div');
            let emoji = "ℹ️";
            if(i.title.toLowerCase().includes("dimension")) emoji="📐";
            if(i.title.toLowerCase().includes("display")) emoji="🖥️";
            if(i.title.toLowerCase().includes("network")) emoji="📶";
            if(i.title.toLowerCase().includes("battery")) emoji="🔋";
            if(i.title.toLowerCase().includes("camera")) emoji="📸";
            currentSection.innerHTML = `<div class="section-title">${emoji} ${i.title}</div>`;
            resBox.appendChild(currentSection);
          } else if (i.role === "item" && currentSection) {
            const div = document.createElement('div');
            div.className = "item";
            div.textContent = `${i.title}: ${i.content || "-"}`;
            currentSection.appendChild(div);
          }
        });

      } catch (err) {
        resBox.classList.remove("loading");
        resBox.textContent = "❌ Error: " + err.message;
      }
    }
  </script>
</body>
</html>
