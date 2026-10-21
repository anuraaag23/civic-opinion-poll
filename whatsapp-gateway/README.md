# 🇮🇳 Mera-Vote — Server-Side WhatsApp OTP Infrastructure

Run WhatsApp OTP verification **100% on the server side (24/7 in the cloud)** so you **NEVER** need to keep your personal PC, laptop, or terminal running!

---

## 🚀 Choose Your Preferred Server Setup:

| Method | Where It Runs | Requires PC? | Cost | Setup Time |
| :--- | :--- | :--- | :--- | :--- |
| **Option A: Render.com (Recommended)** | Cloud Web Service | ❌ No | 100% Free | 3 Minutes |
| **Option B: Railway.app** | Cloud Container | ❌ No | Free / $5 trial | 2 Minutes |
| **Option C: Meta WhatsApp Cloud API** | Serverless on Vercel | ❌ No | 1,000 free/mo | 5 Minutes |
| **Option D: Cloud VPS / Docker / PM2** | Your Linux Server | ❌ No | Free Tier / $3 | 3 Minutes |

---

## Option A: Deploy to Render.com (100% Free Forever, Zero PC Needed)

Render provides a 24/7 cloud container that runs independently of your computer.

### Step 1: Create a Render Web Service
1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** &rarr; **Web Service**.
3. Select your repository: `civic-opinion-poll`.
4. Configure the settings:
   - **Name**: `meravote-wa-gateway` (or any name you prefer)
   - **Region**: Singapore or nearest to India
   - **Root Directory**: `whatsapp-gateway`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.mjs`
   - **Instance Type**: **Free**
5. (Optional) Under **Disks**, add a disk mounted to `/app/baileys_auth_info` so session persists across redeploys.
6. Click **Deploy Web Service**.

### Step 2: Scan the Web QR Code from Your Phone
1. Once deployed, Render will give you a permanent HTTPS address, e.g.:
   `https://meravote-wa-gateway.onrender.com`
2. Open that URL on your phone or computer browser.
3. You will see the **Mera-Vote WhatsApp Server Web Portal** displaying a live QR code.
4. On your mobile phone:
   - Open WhatsApp &rarr; **Settings** (or ⋮ menu) &rarr; **Linked Devices** &rarr; **Link a Device**.
   - Point your camera at the screen and scan the QR code.
5. The web portal will automatically switch to:
   `✅ Server Online • 24/7 Connected (+91 XXXXXXXXXX)`
6. You can use the built-in "Send Test Message" box right on the page to verify it immediately!

### Step 3: Connect to your Vercel Project
In your **Vercel Project Settings** &rarr; **Environment Variables**, add:
```env
WHATSAPP_BAILEYS_GATEWAY_URL=https://meravote-wa-gateway.onrender.com
```
*(And optionally `WHATSAPP_BAILEYS_API_KEY=your-secret-key` if you set one).*

🎉 **Done!** Your server-side WhatsApp OTP is now live 24/7. Your laptop/PC can be shut down completely!

---

## Option B: Deploy to Railway.app (1-Click Docker)

1. Go to [https://railway.app](https://railway.app) and click **New Project** &rarr; **Deploy from GitHub repo**.
2. Select your repository and set the **Root Directory** to `whatsapp-gateway`.
3. In **Settings** &rarr; **Networking**, click **Generate Domain** (gives you `https://...up.railway.app`).
4. In **Volumes**, add a volume mounted to `/app/baileys_auth_info`.
5. Open the generated domain in your browser, scan the QR code once, and you are connected 24/7!
6. Add `WHATSAPP_BAILEYS_GATEWAY_URL=https://your-domain.up.railway.app` to Vercel.

---

## Option C: Official Meta WhatsApp Business Cloud API (100% Serverless)

If you prefer **NO server at all** (pure serverless directly from Vercel):
Mera-Vote has native support built-in for Meta's official WhatsApp Business Cloud API!

1. Go to [developers.facebook.com](https://developers.facebook.com) and create an App &rarr; select **Other** &rarr; **Business** &rarr; add **WhatsApp**.
2. Under **WhatsApp** &rarr; **API Setup**, you will get:
   - **Temporary/Permanent Access Token**
   - **Phone number ID**
3. Add these two environment variables to your Vercel project:
   ```env
   WHATSAPP_CLOUD_API_TOKEN=EAAG...
   WHATSAPP_PHONE_NUMBER_ID=1029384756...
   ```
4. Next.js on Vercel will directly deliver OTPs to voters via Meta's global cloud network (1,000 free service conversations every month). Zero servers to run!

---

## Option D: Self-Host on Any Linux VPS / Docker

If you have an Ubuntu/Debian VPS (AWS EC2, DigitalOcean, Hetzner):

```bash
# 1. Clone repository
git clone https://github.com/anuraaag23/civic-opinion-poll.git
cd civic-opinion-poll/whatsapp-gateway

# 2. Run with Docker
docker build -t whatsapp-gateway .
docker run -d --name wa-server --restart always -p 3001:3001 -v $(pwd)/baileys_auth_info:/app/baileys_auth_info whatsapp-gateway

# 3. Or run with PM2
npm install
npm install -g pm2
pm2 start server.mjs --name "wa-gateway"
pm2 save
pm2 startup
```

Open `http://YOUR_SERVER_IP:3001` in your browser, scan the QR code once, and point Vercel to `http://YOUR_SERVER_IP:3001`.

---

## Verification & Health Check

You can ping your server health anytime:
```bash
curl https://your-server-url/status
```
Returns:
```json
{
  "success": true,
  "connected": true,
  "phone": "919876543210",
  "hasQr": false,
  "uptime": 86400
}
```
