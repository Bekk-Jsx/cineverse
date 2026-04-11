import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { db } from '@/backend/config/couchdb.config';
import type { UserDocument } from '@/frontend/types';

// GET /api/admin/users — list all users
export const GET = withAuth(async (_req: NextRequest) => {
    const result = await db.find({
        selector: { type: 'user' },
        limit: 100,
    });

    const users = (result.docs as UserDocument[]).map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ password_hash, ...user }) => user
    );

    return NextResponse.json({ data: users });
}, ['admin']);