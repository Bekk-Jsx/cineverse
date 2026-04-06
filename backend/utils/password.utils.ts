import { hash, compare } from 'bcryptjs';

// Hash password before storing in CouchDB
export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 12); // 12 salt rounds — good balance of security/speed
};

// Compare plain password with stored hash
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return compare(password, hashedPassword);
};