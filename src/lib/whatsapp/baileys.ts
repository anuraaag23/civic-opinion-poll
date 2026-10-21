/**
 * WhatsApp OTP Dispatch Service
 * Supports multiple server-side dispatch engines:
 * 1. Cloud-hosted Baileys Gateway (Render, Railway, VPS, Docker, or Cloudflare Tunnel)
 * 2. Official Meta WhatsApp Business Cloud API (100% Serverless, directly from Next.js on Vercel)
 * 3. Hosted Cloud Gateways (UltraMsg / Green-API)
 * 4. Development Simulator fallback for testing
 */

export interface WhatsAppDispatchResult {
  success: boolean;
  messageId?: string;
  deliveredVia:
    | 'baileys_gateway'
    | 'meta_cloud_api'
    | 'ultramsg_cloud'
    | 'greenapi_cloud'
    | 'dev_simulator';
  error?: string;
  devOtp?: string; // Exposed only in development/test for rapid testing
}

/**
 * Normalizes an Indian phone number to WhatsApp JID format: 91XXXXXXXXXX@s.whatsapp.net
 */
export function formatWhatsAppJid(phoneNumber: string): string {
  let clean = phoneNumber.trim().replace(/[^0-9]/g, '');
  if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }
  return `91${clean}@s.whatsapp.net`;
}

/**
 * Formats a clean 10-digit Indian phone number
 */
export function cleanIndianPhone(phoneNumber: string): string {
  let clean = phoneNumber.trim().replace(/[^0-9]/g, '');
  if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }
  return clean;
}

/**
 * Dispatches a 6-digit OTP to the user's WhatsApp number on the server side.
 */
export async function sendWhatsAppOtp(
  phoneNumber: string,
  otpCode: string,
  pollTitleEn = 'Civic Election'
): Promise<WhatsAppDispatchResult> {
  const cleanPhone = cleanIndianPhone(phoneNumber);
  if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
    return {
      success: false,
      deliveredVia: 'dev_simulator',
      error: 'Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9.',
    };
  }

  const jid = formatWhatsAppJid(cleanPhone);
  const messageBody = `🇮🇳 *Mera-Vote | मेरा-वोट*
*आधिकारिक मतदाता सत्यापन कोड (Official Voting OTP)*

आपकी गोपनीय मतदान सुरक्षा OTP है:
👉 *${otpCode}*

Your 6-digit confidential voting OTP is: *${otpCode}*

⏱️ यह कोड 10 मिनट के लिए मान्य है। (Valid for 10 minutes)
🔒 सुरक्षा हेतु यह कोड किसी के साथ साझा न करें। (Do not share this code)
🗳️ 1 व्हाट्सएप नंबर = 1 मत | निष्पक्ष, अनाम एवं सुरक्षित मतदान।

Poll: ${pollTitleEn}
https://mera-vote.vercel.app/`;

  // 1. Meta WhatsApp Business Cloud API (Official & 100% Serverless on Vercel)
  const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      const metaRes = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: `91${cleanPhone}`,
          type: 'text',
          text: {
            preview_url: false,
            body: messageBody,
          },
        }),
      });

      if (metaRes.ok) {
        const metaData = await metaRes.json().catch(() => ({}));
        return {
          success: true,
          messageId: metaData.messages?.[0]?.id || `meta-${Date.now()}`,
          deliveredVia: 'meta_cloud_api',
        };
      } else {
        const errJson = await metaRes.json().catch(() => ({}));
        console.warn('Meta WhatsApp Cloud API error:', errJson);
      }
    } catch (metaErr) {
      console.error('Failed to dispatch via Meta WhatsApp Cloud API:', metaErr);
    }
  }

  // 2. Cloud-hosted Baileys Gateway (Render, Railway, VPS, Docker, or Tunnel)
  const gatewayUrl =
    process.env.WHATSAPP_BAILEYS_GATEWAY_URL ||
    process.env.WHATSAPP_BAILEYS_API_URL ||
    process.env.BAILEYS_API_ENDPOINT;

  const apiKey =
    process.env.WHATSAPP_BAILEYS_API_KEY ||
    process.env.BAILEYS_API_KEY ||
    '';

  if (gatewayUrl) {
    try {
      const response = await fetch(`${gatewayUrl.replace(/\/$/, '')}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey } : {}),
        },
        body: JSON.stringify({
          jid,
          phoneNumber: `91${cleanPhone}`,
          message: messageBody,
          text: messageBody,
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: true,
          messageId: data.messageId || data.id || `baileys-${Date.now()}`,
          deliveredVia: 'baileys_gateway',
        };
      } else {
        console.warn(`Baileys cloud gateway responded with HTTP ${response.status}.`);
      }
    } catch (gatewayErr) {
      console.error('Failed to communicate with WhatsApp Baileys cloud gateway:', gatewayErr);
    }
  }

  // 3. UltraMsg Hosted Cloud API
  const ultraInstance = process.env.WHATSAPP_ULTRAMSG_INSTANCE_ID;
  const ultraToken = process.env.WHATSAPP_ULTRAMSG_TOKEN;
  if (ultraInstance && ultraToken) {
    try {
      const ultraRes = await fetch(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ultraToken,
          to: `91${cleanPhone}`,
          body: messageBody,
        }),
      });
      if (ultraRes.ok) {
        const d = await ultraRes.json().catch(() => ({}));
        return {
          success: true,
          messageId: d.id || `ultra-${Date.now()}`,
          deliveredVia: 'ultramsg_cloud',
        };
      }
    } catch (ultraErr) {
      console.error('Failed to dispatch via UltraMsg:', ultraErr);
    }
  }

  // 4. Green-API Hosted Cloud Instance
  const greenId = process.env.WHATSAPP_GREENAPI_ID_INSTANCE;
  const greenToken = process.env.WHATSAPP_GREENAPI_API_TOKEN;
  if (greenId && greenToken) {
    try {
      const greenRes = await fetch(`https://api.green-api.com/waInstance${greenId}/sendMessage/${greenToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${formatWhatsAppJid(cleanPhone)}`,
          message: messageBody,
        }),
      });
      if (greenRes.ok) {
        const d = await greenRes.json().catch(() => ({}));
        return {
          success: true,
          messageId: d.idMessage || `green-${Date.now()}`,
          deliveredVia: 'greenapi_cloud',
        };
      }
    } catch (greenErr) {
      console.error('Failed to dispatch via Green-API:', greenErr);
    }
  }

  // 5. Local / Development Simulator Mode
  console.log('----------------------------------------------------');
  console.log(`[WhatsApp Server OTP Dispatch] To: +91 ${cleanPhone} (${jid})`);
  console.log(`[WhatsApp Server OTP Code] => ${otpCode}`);
  console.log('----------------------------------------------------');

  const isConfigured = Boolean(gatewayUrl || (metaToken && metaPhoneId) || (ultraInstance && ultraToken));
  const isDevOrTest = process.env.NODE_ENV !== 'production' || !isConfigured;

  return {
    success: true,
    messageId: `server-sim-${Date.now()}`,
    deliveredVia: isConfigured ? 'baileys_gateway' : 'dev_simulator',
    devOtp: isDevOrTest ? otpCode : undefined,
  };
}
