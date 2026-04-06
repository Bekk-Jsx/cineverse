import { db } from '../config/couchdb.config';
import type { UserDocument } from '../../frontend/types';

// Find user by email — used during login
export const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
  try {
    const result = await db.find({
      selector: {
        type: 'user',
        email,
      },
      limit: 1,
    });

    if (result.docs.length === 0) return null;
    return result.docs[0] as UserDocument;
  } catch {
    return null;
  }
};

// Find user by ID
export const getUserById = async (id: string): Promise<UserDocument | null> => {
  try {
    const user = await db.get(id);
    return user as UserDocument;
  } catch {
    return null;
  }
};

// Create new user
export const createUser = async (
  userData: Omit<UserDocument, '_id' | '_rev' | 'created_at' | 'updated_at'>
): Promise<UserDocument> => {
  const now = new Date().toISOString();
  const _id = `user_${Date.now()}`;

  const user: UserDocument = {
    ...userData,
    _id,
    created_at: now,
    updated_at: now,
  };

  await db.insert(user);
  return user;
};

// Update user
export const updateUser = async (
  id: string,
  updates: Partial<UserDocument>
): Promise<UserDocument> => {
  const existing = await db.get(id);

  const updated: UserDocument = {
    ...(existing as UserDocument),
    ...updates,
    _id: id,
    _rev: existing._rev,
    updated_at: new Date().toISOString(),
  };

  await db.insert(updated);
  return updated;
};