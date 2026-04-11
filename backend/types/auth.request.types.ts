import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

// Extends NextRequest with auth session injected by Auth.js
export interface AuthenticatedRequest extends NextRequest {
    auth: Session;
}