import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createUser, getUserByEmail } from '@/backend/repositories/user.repository';
import { hashPassword } from '@/backend/utils/password.utils';

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const { email, username, password } = await req.json();

  // Validation
  if (!email || !username || !password) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }

  // Check if email already exists
  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: 'Email already in use' },
      { status: 409 }
    );
  }

  // Hash password + create user
  const password_hash = await hashPassword(password);

  await createUser({
    type: 'user',
    email,
    username,
    password_hash,
    role: 'user',
    watchlist: [],
    favorite_ids: [],
  });

  return NextResponse.json(
    { message: 'Account created successfully' },
    { status: 201 }
  );
};