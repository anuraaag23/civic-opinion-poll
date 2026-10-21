# Mera Vote — Free WhatsApp OTP Baileys Gateway

This microservice connects your phone's WhatsApp account directly to the Mera Vote voting platform using `@whiskeysockets/baileys`.

- **100% Free Forever**: No SMS gateway charges (No Twilio, No MSG91).
- **Zero Raw Phone Storage**: The main voting website never stores phone numbers in the database.
- **Works with Vercel**: Solves the serverless limitation by keeping a persistent WhatsApp Web session alive on a 24/7 host or your local machine.

---

## Quick Start (Run Locally in 2 Minutes)

1. Open a terminal in this folder:
   ```bash
   cd whatsapp-gateway
   npm install
   npm start
   ```

2. A QR code will appear in your terminal.
3. Open WhatsApp on your phone:
   - Go to **Settings** > **Linked Devices** > **Link a Device**
   - Point your camera at the terminal QR code.
4. Once scanned, you will see:
   `✅ WHATSAPP BAILEYS GATEWAY CONNECTED SUCCESSFULLY!`

5. To connect it to your live Vercel site:
   - Expose your local port `3001` using a free tunnel:
     ```bash
     npx ngrok http 3001
     # or using cloudflared:
     npx cloudflared tunnel --url http://localhost:3001
     ```
   - Copy the HTTPS URL (e.g. `https://abc-123.ngrok-free.app`).
   - Add this environment variable in your Vercel Project Dashboard:
     ```
     WHATSAPP_BAILEYS_GATEWAY_URL=https://abc-123.ngrok-free.app
     ```

---

## 24/7 Free Cloud Hosting Options

If you don't want to keep your laptop/PC on:
- **Render.com** (Free Web Service / Background Worker)
- **Railway.app**
- **Koyeb**
- **Any small VPS** (DigitalOcean / Hetzner / AWS EC2 Free Tier)

Deploy this folder, set the persistent storage disk for `baileys_auth_info`, and set the URL in Vercel.
