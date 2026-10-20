import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.VOTING_HMAC_SECRET ||
  'meravote_admin_secure_session_key_2026_salt';

/**
 * Validates admin HMAC-SHA256 session token using the Web Crypto API (Edge-compatible).
 */
async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url to base64
    const base64Sig = signature.replace(/-/g, '+').replace(/_/g, '/');
    const paddedSig = base64Sig.padEnd(base64Sig.length + ((4 - (base64Sig.length % 4)) % 4), '=');
    const sigBytes = Uint8Array.from(atob(paddedSig), (c) => c.charCodeAt(0));
    const dataBytes = encoder.encode(payloadB64);

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!isValid) return false;

    // Check payload expiration and role
    const base64Payload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      '='
    );
    const payload = JSON.parse(atob(paddedPayload));

    if (!payload || payload.role !== 'admin') return false;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Block access to hidden files (.env, .git, .DS_Store, etc.)
  if (pathname.includes('/.') || pathname.startsWith('/.')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. Protect Admin API routes (except the login endpoint /api/admin/auth)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth') {
    let token = '';

    // Check Authorization: Bearer <token>
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    // Check Cookie
    if (!token) {
      const cookie = request.cookies.get('meravote_admin_token');
      if (cookie) {
        token = cookie.value;
      }
    }

    const isTokenValid = await verifyAdminToken(token);

    if (!isTokenValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid administrative session required',
        },
        { status: 401 }
      );
    }
  }

  // 3. CSRF & Origin Validation for state-changing API requests
  if (request.method !== 'GET' && request.method !== 'HEAD' && pathname.startsWith('/api/')) {
    // Exclude payment webhooks (they are signed by webhook providers)
    if (!pathname.includes('webhook')) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');

      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          // Disallow if origin host doesn't match the destination host (prevent cross-site request forgery)
          if (
            originHost !== host &&
            !originHost.includes('meravote') &&
            !originHost.includes('vercel.app') &&
            !originHost.includes('localhost')
          ) {
            return NextResponse.json(
              { success: false, error: 'Cross-origin request blocked for security' },
              { status: 403 }
            );
          }
        } catch {}
      }
    }
  }

  // 4. Continue with security headers applied
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, svg assets
     */
    '/((?!_next/static|_next/image|favicon.ico|parties|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
