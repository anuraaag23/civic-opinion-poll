import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import express from 'express';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.WHATSAPP_BAILEYS_API_KEY || process.env.API_KEY || '';
const AUTH_DIR = process.env.AUTH_DIR || path.join(process.cwd(), 'baileys_auth_info');

let sock = null;
let isConnected = false;
let latestRawQr = null;
let latestQrDataUrl = null;
let connectedUser = null;

async function startWhatsApp() {
  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Mera-Vote Cloud Gateway', 'Chrome', '124.0.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        latestRawQr = qr;
        try {
          latestQrDataUrl = await QRCode.toDataURL(qr, {
            width: 340,
            margin: 2,
            color: { dark: '#0F172A', light: '#FFFFFF' },
          });
        } catch (e) {
          console.error('Failed to generate QR DataURL:', e);
        }

        console.log('\n========================================================');
        console.log('📲 SCAN THIS QR CODE WITH WHATSAPP TO LINK SENDER NUMBER:');
        console.log('Open WhatsApp on your phone > Settings > Linked Devices > Link a Device');
        console.log('Or view web QR in browser at: http://localhost:' + PORT);
        console.log('========================================================\n');
        qrcodeTerminal.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`WhatsApp connection closed (Code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
        isConnected = false;
        connectedUser = null;
        if (shouldReconnect) {
          setTimeout(startWhatsApp, 3000);
        } else {
          console.log('Session logged out. Clearing auth directory to generate a new QR code.');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch {}
          setTimeout(startWhatsApp, 2000);
        }
      } else if (connection === 'open') {
        console.log('\n✅ WHATSAPP BAILEYS GATEWAY CONNECTED SUCCESSFULLY!');
        console.log(`Linked Phone: ${sock.user?.id}`);
        console.log('Ready to dispatch real 100% free voting OTPs 24/7 on server.\n');
        isConnected = true;
        latestRawQr = null;
        latestQrDataUrl = null;
        connectedUser = sock.user;
      }
    });
  } catch (err) {
    console.error('Failed to initialize Baileys:', err);
    setTimeout(startWhatsApp, 5000);
  }
}

// JSON Status Endpoint for polling
app.get('/status', (req, res) => {
  res.json({
    success: true,
    connected: isConnected,
    phone: connectedUser ? (connectedUser.id || '').split(':')[0] : null,
    hasQr: Boolean(latestQrDataUrl),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Backward-compatible health check
app.get('/health', (req, res) => {
  res.json({
    status: isConnected ? 'connected' : 'waiting_for_qr_scan',
    connected: isConnected,
    phone: connectedUser ? (connectedUser.id || '').split(':')[0] : null,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Interactive Web UI to view QR Code & Monitor Server 24/7
app.get(['/', '/qr'], (req, res) => {
  const phoneFormatted = connectedUser ? (connectedUser.id || '').split(':')[0] : '';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mera-Vote WhatsApp Server Gateway</title>
  <style>
    :root {
      --bg: #0B0F19;
      --surface: #131A29;
      --card: #1B2438;
      --border: rgba(255, 255, 255, 0.1);
      --accent: #2563EB;
      --accent-hover: #1D4ED8;
      --success: #10B981;
      --warning: #F59E0B;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .container {
      width: 100%;
      max-width: 520px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .badge.connected { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge.waiting { background: rgba(245, 158, 11, 0.15); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.3); }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    p.subtitle { color: var(--text-muted); font-size: 0.875rem; line-height: 1.4; margin-bottom: 1.5rem; }
    .qr-card {
      background: #FFFFFF;
      padding: 1.25rem;
      border-radius: 1.25rem;
      display: inline-block;
      margin: 1rem 0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    }
    .qr-card img { display: block; max-width: 100%; height: auto; border-radius: 0.5rem; }
    .steps { text-align: left; background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1rem 1.25rem; margin: 1.25rem 0; font-size: 0.8125rem; }
    .steps ol { padding-left: 1.25rem; color: var(--text-muted); }
    .steps li { margin-bottom: 0.5rem; line-height: 1.4; }
    .steps li strong { color: var(--text); }
    .steps li:last-child { margin-bottom: 0; }
    .info-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.25rem;
      margin: 1.5rem 0;
      text-align: left;
    }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 0.8125rem; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: var(--text-muted); }
    .info-val { font-weight: 700; font-family: monospace; }
    .form-group { margin-top: 1.25rem; text-align: left; }
    .form-group label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.35rem; text-transform: uppercase; }
    .input-row { display: flex; gap: 0.5rem; }
    input[type="text"] {
      flex: 1;
      padding: 0.65rem 0.85rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--text);
      font-size: 0.875rem;
      outline: none;
    }
    input[type="text"]:focus { border-color: var(--accent); }
    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 0.75rem;
      border: none;
      background: var(--accent);
      color: #FFF;
      font-weight: 700;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn:hover { background: var(--accent-hover); }
    .btn-danger { background: #DC2626; }
    .btn-danger:hover { background: #B91C1C; }
    .footer { margin-top: 1.5rem; font-size: 0.75rem; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="container">
    <div id="status-badge" class="badge ${isConnected ? 'connected' : 'waiting'}">
      <span class="pulse-dot"></span>
      <span id="status-text">${isConnected ? 'Server Online • 24/7 Connected' : 'Waiting for WhatsApp Scan'}</span>
    </div>

    <h1>Mera-Vote WhatsApp Server</h1>
    <p class="subtitle">Cloud-hosted WhatsApp OTP Dispatcher for verified citizen voting.</p>

    <div id="content-area">
      ${
        isConnected
          ? `
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Connected WhatsApp ID</span>
            <span class="info-val" style="color: var(--success);">+${phoneFormatted}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Server Mode</span>
            <span class="info-val">Cloud Daemon (24/7)</span>
          </div>
          <div class="info-row">
            <span class="info-label">Dispatch Endpoint</span>
            <span class="info-val">POST /send-message</span>
          </div>
        </div>

        <div class="form-group">
          <label>Send Quick Test Message</label>
          <form id="test-form" onsubmit="sendTestMessage(event)">
            <div class="input-row">
              <input type="text" id="test-phone" placeholder="91XXXXXXXXXX" required />
              <button type="submit" class="btn" id="test-btn">Send Test</button>
            </div>
            <p id="test-result" style="font-size: 0.75rem; margin-top: 0.5rem;"></p>
          </form>
        </div>

        <form method="POST" action="/disconnect" onsubmit="return confirm('Disconnect WhatsApp session?');" style="margin-top: 1.5rem;">
          <button type="submit" class="btn btn-danger" style="width: 100%;">Disconnect & Switch Phone Number</button>
        </form>
      `
          : latestQrDataUrl
          ? `
        <div class="qr-card">
          <img id="qr-img" src="${latestQrDataUrl}" alt="WhatsApp Scan QR Code" />
        </div>

        <div class="steps">
          <ol>
            <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
            <li>Tap <strong>Settings</strong> (or 3 dots) &rarr; <strong>Linked Devices</strong></li>
            <li>Tap <strong>Link a Device</strong> & point your camera at the QR code above</li>
          </ol>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted);">QR Code refreshes automatically every few seconds.</p>
      `
          : `
        <div style="padding: 3rem 1rem;">
          <div class="pulse-dot" style="width: 16px; height: 16px; margin: 0 auto 1rem auto; color: var(--accent);"></div>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Initializing WhatsApp Engine & generating secure QR code...</p>
        </div>
      `
      }
    </div>

    <div class="footer">
      Mera-Vote Independent Civic Polling Infrastructure &bull; Zero ID Storage
    </div>
  </div>

  <script>
    // Real-time status polling every 3 seconds
    let wasConnected = ${isConnected};

    async function pollStatus() {
      try {
        const res = await fetch('/status');
        const data = await res.json();

        if (data.connected !== wasConnected) {
          window.location.reload();
          return;
        }

        if (!data.connected && data.hasQr) {
          // Check if we need to reload to show new QR
          const qrImg = document.getElementById('qr-img');
          if (!qrImg) {
            window.location.reload();
          }
        }
      } catch (e) {}
    }

    setInterval(pollStatus, 3000);

    async function sendTestMessage(e) {
      e.preventDefault();
      const phoneInput = document.getElementById('test-phone');
      const btn = document.getElementById('test-btn');
      const result = document.getElementById('test-result');
      const phone = phoneInput.value.trim().replace(/[^0-9]/g, '');

      btn.disabled = true;
      btn.innerText = 'Sending...';
      result.innerText = '';

      try {
        const res = await fetch('/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: phone,
            message: '🇮🇳 Mera-Vote Test Message: WhatsApp Cloud Server Gateway is working 24/7!'
          })
        });
        const d = await res.json();
        if (d.success) {
          result.style.color = 'var(--success)';
          result.innerText = '✅ Test message dispatched successfully! Message ID: ' + d.messageId;
        } else {
          result.style.color = '#EF4444';
          result.innerText = '❌ Failed: ' + (d.error || 'Unknown error');
        }
      } catch (err) {
        result.style.color = '#EF4444';
        result.innerText = '❌ Error sending: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerText = 'Send Test';
      }
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Send message endpoint called by Mera-Vote on Vercel
app.post('/send-message', async (req, res) => {
  const { jid, phoneNumber, message, text } = req.body;

  // Optional API key authorization
  if (API_KEY) {
    const authHeader = req.headers.authorization || req.headers['x-api-key'];
    if (authHeader !== API_KEY && authHeader !== `Bearer ${API_KEY}`) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid API key' });
    }
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      success: false,
      error: 'WhatsApp bot is not connected yet. Please visit the server web portal and scan the QR code first.',
    });
  }

  const cleanDigits = String(phoneNumber || '').replace(/[^0-9]/g, '');
  const targetJid = jid || (cleanDigits ? (cleanDigits.startsWith('91') ? `${cleanDigits}@s.whatsapp.net` : `91${cleanDigits}@s.whatsapp.net`) : null);
  const content = message || text;

  if (!targetJid || !content) {
    return res.status(400).json({ success: false, error: 'Missing target jid/phoneNumber or message text.' });
  }

  try {
    const sent = await sock.sendMessage(targetJid, { text: content });
    console.log(`[Baileys Cloud Gateway] OTP dispatched to ${targetJid} (MsgID: ${sent?.key?.id})`);
    return res.json({
      success: true,
      messageId: sent?.key?.id || `msg-${Date.now()}`,
    });
  } catch (err) {
    console.error(`[Baileys Cloud Gateway] Error sending to ${targetJid}:`, err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// Disconnect / Clear Session Endpoint
app.post('/disconnect', async (req, res) => {
  try {
    if (sock) {
      await sock.logout().catch(() => {});
    }
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    } catch {}
    isConnected = false;
    connectedUser = null;
    latestQrDataUrl = null;
    console.log('Session disconnected by administrator. Restarting socket...');
    setTimeout(startWhatsApp, 1500);
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Failed to disconnect: ' + String(err));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================`);
  console.log(`Mera Vote WhatsApp Baileys Gateway Server running on port ${PORT}`);
  console.log(`Web Portal & QR Code: http://localhost:${PORT}`);
  console.log(`Send Endpoint: http://localhost:${PORT}/send-message`);
  console.log(`========================================================`);
  startWhatsApp();
});
