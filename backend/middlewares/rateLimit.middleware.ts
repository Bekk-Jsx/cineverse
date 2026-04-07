import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '../services/cache.service';

export const withRateLimit = (
  handler: (req: NextRequest, context: unknown) => Promise<NextResponse>,
  limit: number = 100
) => {
  return async (req: NextRequest, context: unknown): Promise<NextResponse> => {
    // Get IP from request headers
    const ip = req.headers.get('x-forwarded-for') ?? 
                req.headers.get('x-real-ip') ?? 
                '127.0.0.1';

    const { allowed, remaining, resetIn } = await rateLimit(ip, limit);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetIn.toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler(req, context);
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetIn.toString());

    return response;
  };
};