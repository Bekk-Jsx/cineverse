import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { apolloServer } from '@/backend/graphql';
import { auth } from '@/auth';
import type { NextRequest } from 'next/server';

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer, {
  context: async (req) => {
    const session = await auth();
    return { req, session };
  },
});

export const GET = (req: NextRequest) => handler(req);
export const POST = (req: NextRequest) => handler(req);