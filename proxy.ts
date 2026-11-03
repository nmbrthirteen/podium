import { type NextRequest, NextResponse } from 'next/server';
import { isLoopbackHost } from '@/lib/auth/loopback-host';
import { isHosted } from '@/lib/env';

// Local mode has no sign-in, so it must only answer requests addressed to this computer.
// Checking Host also blocks DNS rebinding from a web page the user happens to have open.
export function proxy(request: NextRequest) {
  if (isHosted() || isLoopbackHost(request.headers.get('host'))) return NextResponse.next();

  return new NextResponse(
    'Podium is in local mode and only answers requests sent to localhost. Open it at localhost.',
    {
      status: 403,
    },
  );
}
