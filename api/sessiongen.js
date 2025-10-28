import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  const { step, apiId, apiHash, phone, otp } = req.body;
  const scriptPath = path.join(process.cwd(), "telethon_session_gen.py");

  if (!fs.existsSync(scriptPath)) {
    fs.writeFileSync(
      scriptPath,
      `
from telethon.sync import TelegramClient
import sys, json

data = json.loads(sys.stdin.read())
step = data.get("step")
api_id = int(data.get("apiId"))
api_hash = data.get("apiHash")
phone = data.get("phone")
otp = data.get("otp")

if step == "send_code":
    client = TelegramClient("temp", api_id, api_hash)
    client.connect()
    client.send_code_request(phone)
    print(json.dumps({"success": True, "message": "OTP sent to your Telegram!"}))
    client.disconnect()

elif step == "verify_otp":
    client = TelegramClient("temp", api_id, api_hash)
    client.connect()
    client.sign_in(phone, otp)
    session = client.session.save()
    print(json.dumps({"success": True, "session_string": session}))
    client.disconnect()
`
    );
  }

  const py = spawn("python3", [scriptPath]);
  let output = "";

  py.stdin.write(JSON.stringify({ step, apiId, apiHash, phone, otp }));
  py.stdin.end();

  py.stdout.on("data", (d) => (output += d.toString()));
  py.stderr.on("data", (err) => console.error("Python Error:", err.toString()));

  py.on("close", () => {
    try {
      res.status(200).json(JSON.parse(output));
    } catch (e) {
      res.status(500).json({ success: false, message: "Internal error" });
    }
  });
}
