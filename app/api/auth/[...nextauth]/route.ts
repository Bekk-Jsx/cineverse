import { handlers } from '@/auth';

// One file that handles all Auth.js internal routes automatically

// /api/auth/signin
// /api/auth/signout
// /api/auth/session
// /api/auth/csrf


// Auth.js handles all /api/auth/* routes automatically
export const { GET, POST } = handlers;