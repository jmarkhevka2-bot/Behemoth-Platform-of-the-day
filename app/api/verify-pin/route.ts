import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
}

// In-memory rate limit map keyed by IP.
// Resets on cold start — acceptable for this use case.
const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS   = 5;
const LOCK_DURATION  = 60_000; // 60 seconds

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const now   = Date.now();
  const entry = rateLimitMap.get(ip) ?? { attempts: 0, lockedUntil: 0 };

  // Locked out?
  if (entry.lockedUntil > now) {
    const seconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return NextResponse.json({ locked: true, seconds }, { status: 429 });
  }

  const body = await req.json() as { pin?: string };
  const pin  = String(body.pin ?? '');

  const ADMIN_PIN = process.env.ADMIN_PIN;
  const CREW_PIN  = process.env.CREW_PIN;

  if (pin === ADMIN_PIN) {
    rateLimitMap.delete(ip);
    return NextResponse.json({ success: true, role: 'admin' });
  }

  if (pin === CREW_PIN) {
    rateLimitMap.delete(ip);
    return NextResponse.json({ success: true, role: 'crew' });
  }

  // Wrong PIN
  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_DURATION;
  }
  rateLimitMap.set(ip, entry);

  return NextResponse.json({ success: false }, { status: 401 });
}
