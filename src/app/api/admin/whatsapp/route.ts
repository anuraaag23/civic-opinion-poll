import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { sendWhatsAppOtp, pingBaileysGateway } from '@/lib/whatsapp/baileys';
import { WhatsAppGatewayConfig } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const siteSettings = await db.getSiteSettings();
    const gw = siteSettings.whatsappGateway || {
      provider: 'baileys_gateway',
      baileysGatewayUrl: process.env.WHATSAPP_BAILEYS_GATEWAY_URL || '',
      baileysApiKey: process.env.WHATSAPP_BAILEYS_API_KEY || '',
      fallbackToSimulator: true,
      status: 'STANDBY',
    };

    // If ping action requested:
    if (action === 'ping') {
      const targetProvider = (searchParams.get('provider') || gw.provider || 'baileys_gateway') as WhatsAppGatewayConfig['provider'];

      // A) Simulator Ping
      if (targetProvider === 'dev_simulator') {
        return NextResponse.json({
          success: true,
          ping: {
            online: true,
            status: 'SIMULATOR_ACTIVE',
            latencyMs: 1,
            details: { mode: 'Local Simulator (Zero Network)' },
          },
        });
      }

      // B) Meta WhatsApp Cloud API Ping (Option C)
      if (targetProvider === 'meta_cloud_api') {
        const metaPhoneId = searchParams.get('metaPhoneNumberId') || gw.metaPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
        const metaToken = searchParams.get('metaCloudToken') || gw.metaCloudToken || process.env.WHATSAPP_CLOUD_API_TOKEN;

        if (!metaPhoneId || !metaToken) {
          return NextResponse.json({
            success: true,
            ping: {
              online: false,
              status: 'UNCONFIGURED',
              error: 'Missing Meta Phone Number ID or Permanent Access Token',
            },
          });
        }

        const startTime = Date.now();
        try {
          const res = await fetch(`https://graph.facebook.com/v20.0/${metaPhoneId}?access_token=${metaToken}`);
          const latencyMs = Date.now() - startTime;
          if (res.ok) {
            const data = await res.json();
            return NextResponse.json({
              success: true,
              ping: {
                online: true,
                status: 'CONNECTED',
                latencyMs,
                details: {
                  verifiedName: data.verified_name || 'Meta WhatsApp Business',
                  displayPhone: data.display_phone_number || data.id,
                  qualityRating: data.quality_rating || 'GREEN',
                },
              },
            });
          } else {
            const err = await res.json().catch(() => ({}));
            return NextResponse.json({
              success: true,
              ping: {
                online: false,
                status: 'META_API_ERROR',
                latencyMs,
                error: err.error?.message || `Meta API HTTP ${res.status}`,
              },
            });
          }
        } catch (err: unknown) {
          return NextResponse.json({
            success: true,
            ping: {
              online: false,
              status: 'NETWORK_ERROR',
              latencyMs: Date.now() - startTime,
              error: (err as Error)?.message || 'Meta connectivity failure',
            },
          });
        }
      }

      // C) Baileys Self-Hosted Gateway Ping (Option B & A)
      const targetUrl = searchParams.get('url') || gw.baileysGatewayUrl || process.env.WHATSAPP_BAILEYS_GATEWAY_URL;
      const targetKey = searchParams.get('key') || gw.baileysApiKey || process.env.WHATSAPP_BAILEYS_API_KEY;

      if (!targetUrl) {
        return NextResponse.json({
          success: true,
          ping: { online: false, status: 'UNCONFIGURED', error: 'No Baileys Gateway URL configured' },
        });
      }

      const pingResult = await pingBaileysGateway(targetUrl, targetKey);
      return NextResponse.json({
        success: true,
        ping: pingResult,
      });
    }

    // Return current settings
    return NextResponse.json({
      success: true,
      data: {
        provider: gw.provider || 'baileys_gateway',
        baileysGatewayUrl: gw.baileysGatewayUrl || '',
        baileysApiKey: gw.baileysApiKey || '',
        metaCloudToken: gw.metaCloudToken || '',
        metaPhoneNumberId: gw.metaPhoneNumberId || '',
        ultraMsgInstanceId: gw.ultraMsgInstanceId || '',
        ultraMsgToken: gw.ultraMsgToken || '',
        greenApiInstanceId: gw.greenApiInstanceId || '',
        greenApiToken: gw.greenApiToken || '',
        senderPhone: gw.senderPhone || '',
        fallbackToSimulator: gw.fallbackToSimulator !== false,
        status: gw.status || 'STANDBY',
        envFallbacks: {
          hasBaileysEnvUrl: Boolean(process.env.WHATSAPP_BAILEYS_GATEWAY_URL || process.env.WHATSAPP_BAILEYS_API_URL),
          hasMetaEnvToken: Boolean(process.env.WHATSAPP_CLOUD_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
          hasUltraMsgEnv: Boolean(process.env.WHATSAPP_ULTRAMSG_INSTANCE_ID && process.env.WHATSAPP_ULTRAMSG_TOKEN),
          hasGreenApiEnv: Boolean(process.env.WHATSAPP_GREENAPI_ID_INSTANCE && process.env.WHATSAPP_GREENAPI_API_TOKEN),
        },
      },
    });
  } catch (err) {
    console.error('Failed to get WhatsApp gateway settings:', err);
    return NextResponse.json({ success: false, error: 'Internal failure retrieving settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      provider,
      baileysGatewayUrl,
      baileysApiKey,
      metaCloudToken,
      metaPhoneNumberId,
      ultraMsgInstanceId,
      ultraMsgToken,
      greenApiInstanceId,
      greenApiToken,
      senderPhone,
      fallbackToSimulator,
    } = body;

    const currentSettings = await db.getSiteSettings();
    const updatedGateway: WhatsAppGatewayConfig = {
      provider: provider || 'baileys_gateway',
      baileysGatewayUrl: typeof baileysGatewayUrl === 'string' ? baileysGatewayUrl.trim() : undefined,
      baileysApiKey: typeof baileysApiKey === 'string' ? baileysApiKey.trim() : undefined,
      metaCloudToken: typeof metaCloudToken === 'string' ? metaCloudToken.trim() : undefined,
      metaPhoneNumberId: typeof metaPhoneNumberId === 'string' ? metaPhoneNumberId.trim() : undefined,
      ultraMsgInstanceId: typeof ultraMsgInstanceId === 'string' ? ultraMsgInstanceId.trim() : undefined,
      ultraMsgToken: typeof ultraMsgToken === 'string' ? ultraMsgToken.trim() : undefined,
      greenApiInstanceId: typeof greenApiInstanceId === 'string' ? greenApiInstanceId.trim() : undefined,
      greenApiToken: typeof greenApiToken === 'string' ? greenApiToken.trim() : undefined,
      senderPhone: typeof senderPhone === 'string' ? senderPhone.trim() : undefined,
      fallbackToSimulator: fallbackToSimulator !== false,
      lastPing: new Date().toISOString(),
    };

    await db.updateSiteSettings({
      whatsappGateway: updatedGateway,
    });

    await db.recordAuditEvent('whatsapp_gateway_updated', undefined, {
      provider: updatedGateway.provider,
      hasBaileysUrl: Boolean(updatedGateway.baileysGatewayUrl),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp Gateway settings saved and applied dynamically.',
      data: updatedGateway,
    });
  } catch (err) {
    console.error('Failed to update WhatsApp gateway settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to update gateway settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, phoneNumber } = body;

    if (action === 'test_dispatch') {
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        return NextResponse.json({ success: false, error: 'Target phone number is required' }, { status: 400 });
      }

      const testCode = String(Math.floor(100000 + Math.random() * 900000));
      const startTime = Date.now();

      const result = await sendWhatsAppOtp(phoneNumber, testCode, 'Admin Gateway Connectivity Test');
      const latencyMs = Date.now() - startTime;

      return NextResponse.json({
        success: result.success,
        deliveredVia: result.deliveredVia,
        messageId: result.messageId,
        testCode,
        latencyMs,
        error: result.error,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Failed to test WhatsApp dispatch:', err);
    return NextResponse.json({ success: false, error: 'Dispatch test failed' }, { status: 500 });
  }
}
