import { PythonShell } from 'python-shell';
import path from 'path';
import fs from 'fs';

// POST /api/sessiongen -> { api_id, api_hash, phone, code? }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Only POST allowed' });
  }

  const { api_id, api_hash, phone, code } = req.body || {};
  if (!api_id || !api_hash || !phone) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }

  // Write temporary Python file to handle Telethon session generation
  const pyPath = path.join('/tmp', `tg_session_${Date.now()}.py`);
  const pyCode = `
from telethon.sync import TelegramClient
from telethon.sessions import StringSession
import sys, json

api_id = ${api_id}
api_hash = "${api_hash}"
phone = "${phone}"

try:
    client = TelegramClient(StringSession(), api_id, api_hash)
    client.connect()
    if not client.is_user_authorized():
        client.send_code_request(phone)
        print(json.dumps({"success": True, "step": "code_sent"}))
        sys.exit(0)
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

  fs.writeFileSync(pyPath, pyCode);

  // Run Python
  PythonShell.run(pyPath, { pythonOptions: ['-u'] }, function (err, results) {
    fs.unlinkSync(pyPath);
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Server error running Python' });
    }

    try {
      const output = JSON.parse(results.join(''));
      return res.status(200).json(output);
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Invalid Python output' });
    }
  });
}
