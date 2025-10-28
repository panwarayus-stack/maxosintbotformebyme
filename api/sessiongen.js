import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST method allowed" });
  }

  const { step, apiId, apiHash, phone, otp } = req.body;
  
  // Validate required fields
  if (!step || !apiId || !apiHash || !phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: step, apiId, apiHash, phone" 
    });
  }

  const scriptPath = path.join(process.cwd(), "telethon_session_gen.py");

  // Create Python script if it doesn't exist
  if (!fs.existsSync(scriptPath)) {
    const pythonScript = `
from telethon.sync import TelegramClient
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError, PhoneCodeExpiredError
import sys, json

try:
    data = json.loads(sys.stdin.read())
    step = data.get("step")
    api_id = int(data.get("apiId"))
    api_hash = data.get("apiHash")
    phone = data.get("phone")
    otp = data.get("otp")

    if step == "send_code":
        client = TelegramClient("temp_session", api_id, api_hash)
        await client.connect()
        result = await client.send_code_request(phone)
        print(json.dumps({
            "success": True, 
            "message": "Verification code sent to your Telegram!",
            "phone_code_hash": result.phone_code_hash
        }))
        await client.disconnect()

    elif step == "verify_otp":
        client = TelegramClient("temp_session", api_id, api_hash)
        await client.connect()
        
        try:
            # Sign in with the code
            await client.sign_in(phone, otp)
            session_string = await client.session.save()
            
            print(json.dumps({
                "success": True, 
                "session_string": session_string,
                "message": "Session generated successfully!"
            }))
            
        except SessionPasswordNeededError:
            print(json.dumps({
                "success": False,
                "message": "2FA password required. Please disable 2FA or use another account."
            }))
        except PhoneCodeInvalidError:
            print(json.dumps({
                "success": False,
                "message": "Invalid verification code. Please try again."
            }))
        except PhoneCodeExpiredError:
            print(json.dumps({
                "success": False,
                "message": "Verification code expired. Please request a new code."
            }))
        except Exception as e:
            print(json.dumps({
                "success": False,
                "message": f"Error during verification: {str(e)}"
            }))
        
        await client.disconnect()

except Exception as e:
    print(json.dumps({
        "success": False,
        "message": f"Unexpected error: {str(e)}"
    }))
`;
    fs.writeFileSync(scriptPath, pythonScript.trim());
  }

  return new Promise((resolve) => {
    const py = spawn("python3", [scriptPath]);
    let output = "";
    let errorOutput = "";

    py.stdin.write(JSON.stringify({ step, apiId, apiHash, phone, otp }));
    py.stdin.end();

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("Python stderr:", data.toString());
    });

    py.on("close", (code) => {
      try {
        if (output) {
          const result = JSON.parse(output);
          res.status(200).json(result);
        } else {
          res.status(500).json({
            success: false,
            message: "No response from session generator",
            error: errorOutput
          });
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        res.status(500).json({
          success: false,
          message: "Failed to parse response",
          output: output,
          error: errorOutput
        });
      }
      resolve();
    });

    py.on("error", (error) => {
      console.error("Spawn error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start session generator",
        error: error.message
      });
      resolve();
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      py.kill();
      res.status(500).json({
        success: false,
        message: "Session generation timeout"
      });
      resolve();
    }, 30000);
  });
}
