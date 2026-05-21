import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface ImpersonationClaims {
  tokenType?: 'firebase' | 'impersonation';
  companyId?: string;
  companyName?: string;
  originalAdminUid?: string;
  originalAdminEmail?: string;
  impersonationReadOnly?: boolean;
  sessionMode?: 'LIVE' | 'READ_ONLY';
}

export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken & ImpersonationClaims;
}
