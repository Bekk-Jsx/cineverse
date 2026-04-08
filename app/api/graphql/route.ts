import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { apolloServer } from '@/backend/graphql';
import { auth } from '@/auth';
import type { NextRequest } from 'next/server';

const handler = startServerAndCreateNextHandler(apolloServer, {
  // Attach session to GraphQL context
  context: async (req: NextRequest) => {
    const session = await auth();
    return { req, session };
  },
});

export const GET = handler;
export const POST = handler;