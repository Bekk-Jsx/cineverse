import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middlewares/auth.middleware';
import { updateUser } from '@/backend/repositories/user.repository';
import type { UserRole } from '@/frontend/types';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/users/:id/role — update user role
export const PUT = withAuth(
    async (req: NextRequest, context: unknown) => {
        const { id } = await (context as RouteContext).params;
        const { role } = await req.json();

        const validRoles: UserRole[] = ['admin', 'moderator', 'user'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        const updated = await updateUser(id, { role });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...safeUser } = updated;

        return NextResponse.json({ data: safeUser });
    },
    ['admin']
);