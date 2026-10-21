import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import express from 'express';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.WHATSAPP_BAILEYS_API_KEY || process.env.API_KEY || '';

let sock = null;
let isConnected = false;

async function startWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('\n========================================================');
        console.log('📲 SCAN THIS QR CODE WITH WHATSAPP TO LINK SENDER NUMBER:');
        console.log('Open WhatsApp on your phone > Settings > Linked Devices > Link a Device');
        console.log('========================================================\n');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`WhatsApp connection closed (Code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
        isConnected = false;
        if (shouldReconnect) {
          setTimeout(startWhatsApp, 3000);
        } else {
          console.log('Session logged out. Please restart the gateway to scan a new QR code.');
        }
      } else if (connection === 'open') {
        console.log('\n✅ WHATSAPP BAILEYS GATEWAY CONNECTED SUCCESSFULLY!');
        console.log('Ready to dispatch real 100% free voting OTPs to voters.\n');
        isConnected = true;
      }
    });
  } catch (err) {
    console.error('Failed to initialize Baileys:', err);
    setTimeout(startWhatsApp, 5000);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: isConnected ? 'connected' : 'waiting_for_qr_scan',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
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
      error: 'WhatsApp bot is not connected yet. Please scan the QR code first.',
    });
  }

  const targetJid = jid || (phoneNumber ? `${String(phoneNumber).replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
  const content = message || text;

  if (!targetJid || !content) {
    return res.status(400).json({ success: false, error: 'Missing target jid/phoneNumber or message text.' });
  }

  try {
    const sent = await sock.sendMessage(targetJid, { text: content });
    console.log(`[Baileys Gateway] OTP dispatched to ${targetJid} (MsgID: ${sent?.key?.id})`);
    return res.json({
      success: true,
      messageId: sent?.key?.id || `msg-${Date.now()}`,
    });
  } catch (err) {
    console.error(`[Baileys Gateway] Error sending to ${targetJid}:`, err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`Mera Vote WhatsApp Baileys Gateway listening on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/send-message`);
  console.log(`========================================================`);
  startWhatsApp();
});
